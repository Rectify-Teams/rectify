---
title: "How Rectify Handles Events"
date: 2026-04-02
description: Rectify never calls addEventListener on your elements — here is how clicks still reach your handlers.
author: Rectify Teams
aside: false
---


Here's something that surprises a lot of developers when they first dig into Rectify: when you write `<button onClick={handleClick}>`, Rectify **never calls `addEventListener` on that button**. Not once. Not on mount, not on update, not ever.

So how does clicking the button actually call your handler? That's what this post is about.


## The big picture first

Before diving into each piece, here is the full journey an event takes from the moment a user clicks to the moment your handler runs:

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  STARTUP (once, when createRoot() is called)                    │
  │                                                                 │
  │  registerNativeEvent()        listenToAllEventSupported()       │
  │  Build two-way lookup  ──►    Attach ~30 listeners on           │
  │  "onClick" ↔ "click"          the root container only           │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │  COMMIT (each time a component renders)                         │
  │                                                                 │
  │  Regular props  ──►  element.setAttribute(...)                  │
  │  Event props    ──►  element["__rectifyListeners$xyz"].set(...)  │
  │  Fiber ref      ──►  element["__rectifyFiber$xyz"] = fiber       │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │  DISPATCH (each time a user interaction fires)                  │
  │                                                                 │
  │  Browser fires "click" in capture phase                         │
  │       ↓                                                         │
  │  Container listener intercepts it                               │
  │       ↓                                                         │
  │  nativeEvent.target  ──►  DOM node                              │
  │  DOM node["__rectifyFiber$xyz"]  ──►  Fiber                     │
  │       ↓                                                         │
  │  Wrap in SyntheticEvent                                         │
  │       ↓                                                         │
  │  Walk fiber.return path upward, calling matching handlers       │
  │       ↓                                                         │
  │  setEventPriority(InputLane) → handler() → resetEventPriority() │
  └─────────────────────────────────────────────────────────────────┘
```

Three distinct phases, three separate concerns. Let's walk through each one in full detail.

---

## Phase 1 — What most people expect (and why it doesn't scale)

If you've written vanilla JavaScript before, your mental model of events probably looks like this:

```js
const button = document.getElementById("my-btn");
button.addEventListener("click", handleClick);
```

Simple, direct, intuitive. The button listens. The button fires. Done.

It feels natural to assume that a framework like Rectify does the same thing under the hood — just automatically. Mount a component → attach the listener. Update the handler → swap the listener. Unmount → clean up.

### The scaling problem, visualised

Imagine a table with 7 rows. Each row has a delete button. Here is what each approach costs — watch what happens as listeners attach one by one versus Rectify's approach:

<DelegationScaleAnimation />

```
  Per-element addEventListener (naive approach)
  ─────────────────────────────────────────────
  <div id="app">
    <table>
      <tr> <button> ──── click listener #1    ┐
      <tr> <button> ──── click listener #2    │
      <tr> <button> ──── click listener #3    │  N listeners
      ...                                     │  living in memory
      <tr> <button> ──── click listener #N    ┘
    </table>
  </div>

  Every re-render: removeEventListener + addEventListener per row.
  Every unmount:   must manually clean up or leak.


  Rectify's delegation approach
  ─────────────────────────────
  <div id="app">  ──── click listener (1 total, capture phase)
    <table>
      <tr> <button>  (no listener — handler stored in a Map)
      <tr> <button>  (no listener — handler stored in a Map)
      ...            N rows, still just 1 listener
    </table>
  </div>

  Every re-render: map.set() — one fast property write.
  Every unmount:   DOM GC claims the Map automatically.
```

The better pattern — one that front-end developers have known about for years — is called **event delegation**. Instead of putting a listener on every button, you put *one* listener on a common ancestor and let the browser's event bubbling do the rest.

Rectify takes this idea and pushes it further: **one listener per event type, on the root container, for the entire application**.

---

## Phase 2 — Startup: building the foundations

### Step 1 — Setting up the event name translation table

The first thing Rectify does when `@rectify-dev/dom-binding` loads is call `registerNativeEvent()`. This runs **once** and builds a two-way lookup between Rectify's camelCase JSX prop names and the browser's lowercase native event names:

```typescript
// ─── Forward direction: JSX prop name → native event names ───────────
//
//  Why an array? Some JSX props map to more than one native event.
//  e.g. onChange on <input> needs both "input" and "change"
//
registrationNameDependencies["onClick"]      = ["click"];
registrationNameDependencies["onKeyDown"]    = ["keydown"];
registrationNameDependencies["onKeyUp"]      = ["keyup"];
registrationNameDependencies["onChange"]     = ["input", "change"];  // note: two events
registrationNameDependencies["onMouseEnter"] = ["mouseenter"];
registrationNameDependencies["onMouseLeave"] = ["mouseleave"];
registrationNameDependencies["onFocus"]      = ["focusin"];
registrationNameDependencies["onBlur"]       = ["focusout"];
// ... 30+ entries in total

// ─── Reverse direction: native event name → JSX prop name ────────────
//
//  Used during dispatch to look up the right handler from the Map.
//
nativeEventToRectifyName.set("click",      "onClick");
nativeEventToRectifyName.set("keydown",    "onKeyDown");
nativeEventToRectifyName.set("keyup",      "onKeyUp");
nativeEventToRectifyName.set("input",      "onChange");
nativeEventToRectifyName.set("change",     "onChange");
nativeEventToRectifyName.set("focusin",    "onFocus");
nativeEventToRectifyName.set("focusout",   "onBlur");
```

:::info Why two directions?
The forward direction (`onClick → ["click"]`) is used during **setup** — to know which native events to register on the container. The reverse direction (`"click" → "onClick"`) is used during **dispatch** — to know which handler key to look up in the Map when an event fires.
:::

### Step 2 — Attaching listeners to the root container (just once)

When you call `createRoot(document.getElementById("app"))`, Rectify calls `listenToAllEventSupported` on that container element. It loops through every native event name collected in Step 1 and attaches **one capture-phase listener** per event type:

```typescript
//  allNativeEvents = Set { "click", "keydown", "keyup", "input", "change", ... }
//                    collected from all registrationNameDependencies values

allNativeEvents.forEach((domEventName) => {
  //  createEventListenerWrapper returns a function that calls
  //  dispatchEvent(domEventName, container, nativeEvent)
  const listener = createEventListenerWrapper(container, domEventName);

  container.addEventListener(
    domEventName,
    listener,
    true   // ← capture phase, not bubble. Explained in detail below.
  );
});
```

For a typical app this is roughly **30 listeners total on one `<div>`**, regardless of component count.

```
  After createRoot():

  document
  └── <body>
      └── <div id="app">   ← ~30 listeners here (click, keydown, input, ...)
          └── ... your entire component tree (zero listeners anywhere below)
```

#### The duplicate-registration guard

Immediately after attaching listeners, Rectify stamps the container with a hidden marker property:

```typescript
//  The random suffix prevents collisions if multiple versions of Rectify
//  are loaded on the same page (e.g. in a micro-frontend setup).
container["_rectifyEventListening$a1b2c3"] = true;
```

Before attaching any listener, `listenToAllEventSupported` first checks for this marker and bails out if it finds one:

```typescript
function listenToAllEventSupported(container: Element) {
  if (container["_rectifyEventListening$a1b2c3"]) {
    return; // already registered — skip
  }
  // ... attach listeners ...
  container["_rectifyEventListening$a1b2c3"] = true;
}
```

```
  Why this matters — the portal double-fire problem:

  <div id="app">          ← root container, listeners attached here
    <Modal>
      <div id="portal">   ← portal container, rendered outside the tree
        <button>          ← click would bubble through BOTH containers
      </div>              ← without the guard, the handler fires twice
    </Modal>
  </div>

  With the guard: portal container already has the marker → skip.
  Only the outermost root processes the event. ✓
```

---

## Phase 3 — Commit: wiring up each component

Every time Rectify commits a component to the DOM, it processes the component's props. The logic splits into three distinct paths depending on the prop type:

```
  Processing props for <button onClick={handleClick} className="btn" id="x">

  ┌──────────────────────────────────────────────────────────────────┐
  │ Prop: className="btn"                                            │
  │   → Regular attribute                                            │
  │   → element.setAttribute("class", "btn")                        │
  │   → lives on the DOM node itself, visible in DevTools            │
  └──────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────┐
  │ Prop: onClick={handleClick}                                      │
  │   → Event handler                                                │
  │   → stored in a hidden Map on the DOM node                       │
  │                                                                  │
  │   element["__rectifyListeners$xyz"] = Map {                      │
  │     "onClick" → handleClick    ← your function                   │
  │   }                                                              │
  │                                                                  │
  │   On re-render (new handler): map.set("onClick", newHandler)     │
  │   No removeEventListener. No addEventListener. Just map.set().   │
  └──────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────┐
  │ Fiber backlink (always set, regardless of props)                 │
  │   → element["__rectifyFiber$xyz"] = fiber                        │
  │   → the bridge between the DOM node and the fiber tree           │
  │   → used during dispatch to find the fiber from nativeEvent.target│
  └──────────────────────────────────────────────────────────────────┘
```

### Why a Map on the node instead of a closure?

A natural alternative would be to store the handler in a closure that gets replaced on each render. The Map approach has one key advantage:

```typescript
// ─── Closure approach (NOT what Rectify does) ────────────────────────
//
//  On mount:
container.addEventListener("click", () => handler(event));
//
//  On update (new handler):
container.removeEventListener("click", oldClosure);  // must keep a reference
container.addEventListener("click", () => newHandler(event));
//  Two DOM API calls. The old closure must be stored somewhere.

// ─── Map approach (what Rectify actually does) ────────────────────────
//
//  On mount:
element["__rectifyListeners$xyz"] = new Map([["onClick", handler]]);
//
//  On update (new handler):
element["__rectifyListeners$xyz"].set("onClick", newHandler);
//  One property write. No DOM API. No stored reference needed.
```

And on unmount — there is simply nothing to do. When the DOM node is removed, the Map it carries gets garbage collected with it.

---

## Phase 4 — Dispatch: what happens when you actually click

Step through the animation below. Each step corresponds to a distinct action inside Rectify's dispatch pipeline:

<DispatchFlowAnimation />

Your user clicks a button. Here is the complete sequence, annotated at each step:

```
  ① User clicks <button> deep inside the tree

  ② Browser fires native "click" event
    Phase: CAPTURE (top-down, not bottom-up)
    Path:  document → <body> → <div id="app"> → ...children...

  ③ Container listener intercepts at <div id="app">
    (before the event reaches the <button> or any of its ancestors
     in the DOM — capture fires on the way DOWN)

  ④ dispatchEvent("click", container, nativeEvent) runs:
    │
    ├─ a) Resolve target DOM node
    │     targetDOMNode = nativeEvent.target   // the <button> element
    │
    ├─ b) Resolve the fiber from the DOM node
    │     fiber = targetDOMNode["__rectifyFiber$xyz"]
    │     // the bridge set during commit
    │
    ├─ c) Wrap native event in SyntheticEvent
    │     syntheticEvent = new SyntheticEvent(nativeEvent)
    │     // adds a custom stopPropagation() flag for the fiber walk below
    │
    ├─ d) Collect the fiber ancestor path (upward walk)
    │     path = []
    │     current = fiber
    │     while (current !== containerFiber) {
    │       path.push(current)
    │       current = current.return   // .return is the parent fiber
    │     }
    │     // path = [buttonFiber, listItemFiber, listFiber, appFiber]
    │     //         ↑ innermost                             outermost ↑
    │
    └─ e) Walk the path, calling handlers (simulated bubbling)
          for (const nodeFiber of path) {
            const domNode = nodeFiber.stateNode
            const map     = getEventHandlerListeners(domNode)
            const key     = nativeEventToRectifyName.get("click")  // → "onClick"
            const handler = map?.get(key)
            if (handler) {
              setEventPriority(InputLane)
              handler(syntheticEvent)
              resetEventPriority()
            }
            if (syntheticEvent.isPropagationStopped()) break
          }
```

### A concrete example with a real component tree

```tsx
function App() {
  return (
    <ul onClick={() => console.log("ul clicked")}>   {/* handler stored on <ul> */}
      <li>
        <button onClick={() => console.log("button clicked")}>
          {/* handler stored on <button> */}
          Delete
        </button>
      </li>
    </ul>
  );
}
```

```
  Fiber tree (simplified):

  AppFiber
  └── ulFiber        ← Map { "onClick" → [ul handler] }
      └── liFiber
          └── buttonFiber  ← Map { "onClick" → [button handler] }

  User clicks the button. Walk path: [buttonFiber, liFiber, ulFiber, AppFiber]

  Iteration 1 — buttonFiber:
    map.get("onClick") = [button handler]  ✓ → call it
    console.log("button clicked")
    isPropagationStopped()? No → continue

  Iteration 2 — liFiber:
    map.get("onClick") = undefined         → skip

  Iteration 3 — ulFiber:
    map.get("onClick") = [ul handler]     ✓ → call it
    console.log("ul clicked")
    isPropagationStopped()? No → continue

  Output:
    "button clicked"
    "ul clicked"
```

:::tip stopPropagation works as expected
If the button handler calls `e.stopPropagation()`, the walk stops after iteration 1. The `ul` handler never runs — exactly what you'd expect from native bubbling, but implemented entirely in JavaScript over the fiber tree.
:::

---

## Phase 5 — Priority: why clicks always feel instant

There's one more thing happening around every handler call that you might not notice but would definitely feel if it was missing.

Before calling your handler:

```typescript
setEventPriority(InputLane);   // ① tell the scheduler: this is urgent
handler(syntheticEvent);       // ② your code runs
resetEventPriority();          // ③ back to default (lower priority)
```

### What the lanes look like

Rectify uses a bitmap of "lanes" to represent different levels of scheduling urgency:

```
  Lane priority (higher number = lower urgency):

  InputLane      ████░░░░░░  synchronous — must update before next paint
  DefaultLane    ████████░░  normal async — batched, may defer
  IdleLane       ██████████  background — runs when CPU is free

  A click fires → InputLane
    Any setState() calls inside the handler are processed synchronously.
    The browser paints the update before the user's finger leaves the screen.

  A data fetch completes → DefaultLane
    setState() calls get batched and scheduled — may take a frame or two.
```

### The clean separation between events and scheduling

`rectify-dom-binding` (where the event system lives) has **zero import** of `rectify-reconciler` (where the scheduler lives). Instead, at application startup, the reconciler injects two small callbacks into the events package:

```typescript
//  Called by the reconciler during its own initialisation:
injectEventPriorityCallbacks(
  //  Callback 1: set the priority before a handler runs
  (priority: Lane) => {
    currentLanePriority = priority;
  },
  //  Callback 2: reset the priority after a handler runs
  () => {
    currentLanePriority = DefaultLane;
  },
);
```

```
  Package dependency graph:

  rectify-reconciler  ──imports──►  rectify-dom-binding
       │                                    │
       │  injectEventPriorityCallbacks()     │
       └────────────────────────────────────┘
            (function reference injection,
             not an import — no cycle)

  rectify-dom-binding does NOT import rectify-reconciler.
  The events package is fully usable without the reconciler.
```

This is the dependency inversion principle in action: the lower-level package (events) exposes a slot; the higher-level package (reconciler) fills it.

---

## Why capture phase, not bubble phase?

This is one of the more subtle design decisions. Consider what happens with a **portal**:

```
  document
  ├── <div id="app">          ← Rectify root (listeners attached here)
  │   └── <Modal>
  │       └── createPortal(
  │             children,
  │             document.getElementById("modal-root")
  │           )
  │
  └── <div id="modal-root">   ← portal target, outside the app div
      └── <button>            ← user clicks here
```

```
  With bubble phase listeners on #app:

  click fires on <button>
  bubbles up:  <button> → #modal-root → <body> → document
                                    ✗ never passes through #app
  #app's bubble listener never fires.
  The onClick handler on <Modal> is never called. Bug.


  With capture phase listeners on #app:

  click fires on <button>
  capture goes DOWN first:  document → <body> → #app ← fires here ✓
                                               ↓
                            #modal-root → <button>
  #app's capture listener fires before the event even reaches the button.
  Rectify intercepts it and walks the fiber tree correctly.
  The onClick handler on <Modal> is called. ✓
```

:::warning This is a breaking difference from pre-v17 React
Older versions of React used bubble phase delegation. This meant portals rendered outside the root container would break bubbling. Capture phase was one of the headline changes in React 17. Rectify uses capture phase from the start.
:::

---

## Comparison: all six approaches side by side

| Operation | Per-element `addEventListener` | Rectify delegation |
|---|---|---|
| Memory per interactive element | 1 listener object | 0 (one Map entry) |
| Total listeners in a 10k-row list | 10,000 | ~30 (unchanged) |
| Mount cost | `addEventListener` call (DOM API) | `map.set` (property write) |
| Update handler on re-render | `removeEventListener` + `addEventListener` | single `map.set` |
| Unmount cleanup | must track and remove every listener | DOM GC takes the Map |
| Portal support | breaks with bubble phase | works via capture phase |
| Nested root double-fire | likely | prevented by marker check |
| Visible in DevTools "Event Listeners" | yes, on the element | no — only on the container |

---

## The roads not taken

### WeakMap instead of hidden property keys

Rather than `element["__rectifyFiber$xyz"] = fiber`, a `WeakMap<Node, Fiber>` would keep the DOM object clean. No hidden properties, no risk of name collision with other libraries.

```typescript
//  WeakMap approach:
const fiberMap = new WeakMap<Node, Fiber>();
fiberMap.set(domNode, fiber);           // on commit
const fiber = fiberMap.get(domNode);    // on dispatch
```

The tradeoff: WeakMap lookups are fractionally slower than direct property access, and it adds module-level state that must be imported by both the commit path and the dispatch path. Hidden property keys avoid both. It's a close call — either could work.

### Bubble phase delegation instead of capture

This is how React worked before version 17. Simpler to reason about — events travel upward as usual and the container sees them on the way up.

The problem: portals (demonstrated above). The fix requires capture phase.

### Passing the native event directly (no SyntheticEvent)

You could remove the `SyntheticEvent` wrapper entirely and hand the raw browser event to handlers:

```typescript
//  No wrapper:
handler(nativeEvent);
```

The problem: Rectify's custom fiber-walk bubbling is independent of the browser's native bubble. To support `e.stopPropagation()` across that custom walk, you need your own flag. `SyntheticEvent` is essentially a thin wrapper that carries this flag:

```typescript
class SyntheticEvent {
  private _stopped = false;

  constructor(public nativeEvent: Event) {}

  stopPropagation() {
    this._stopped = true;
    this.nativeEvent.stopPropagation();  // also stop the native bubble
  }

  isPropagationStopped() {
    return this._stopped;
  }

  // delegates everything else (target, currentTarget, preventDefault, etc.)
  // to nativeEvent via getters — so the API surface is identical
}
```

Removing it would save a small allocation per dispatch, but `stopPropagation` across bubbling ancestors would silently break.

---

## Pros and cons — honestly

**The good parts:**

- Memory usage is flat. Thousands of components, constant listener count.
- Handler updates are cheap: a single `map.set`, no DOM API calls.
- Click-triggered `setState` is always synchronous (`InputLane`) — users feel instant feedback.
- Bubbling works correctly across portals (capture phase guarantee).
- Nested roots don't double-fire (marker check).

**The less good parts:**

- Every event goes through the container listener even if nothing handles it. For `mousemove` or `scroll`, this is a small constant overhead — usually negligible, but measurable with a profiler.
- `{ passive: true }` cannot be set per element via JSX. Rectify makes a fixed choice per event type at startup. This means scroll-blocking event listeners can't be opted out of through props alone.
- Browser DevTools "Event Listeners" panel shows nothing on your button. The listener is on the container. Developers who don't know this lose time debugging what looks like a missing listener.
- A `SyntheticEvent` is allocated on every dispatch. Fast to GC, but genuinely high-frequency events (pointer tracking, canvas painting) will see measurable GC pressure.
