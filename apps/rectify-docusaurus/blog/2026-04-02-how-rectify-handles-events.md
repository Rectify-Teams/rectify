---
slug: how-rectify-handles-events
title: "How Rectify Handles Events (and why it doesn't use addEventListener on your buttons)"
authors:
  name: Rectify Teams
  title: Rectify Core Team
  url: https://github.com/Rectify-Teams
date: 2026-04-02
tags: [internals, events, dom, performance]
---

Here's something that surprises a lot of developers when they first dig into Rectify: when you write `<button onClick={handleClick}>`, Rectify **never calls `addEventListener` on that button**. Not once. Not on mount, not on update, not ever.

So how does clicking the button actually call your handler? That's what this post is about.

<!-- truncate -->

## First, let's talk about what most people expect

If you've written vanilla JavaScript before, your mental model of events probably looks like this:

```js
const button = document.getElementById("my-btn");
button.addEventListener("click", handleClick);
```

Simple, direct, intuitive. The button listens. The button fires. Done.

It feels natural to assume that a framework like Rectify does the same thing under the hood — just automatically. Mount a component → attach the listener. Update the handler → swap the listener. Unmount → clean up.

But Rectify doesn't do that. And there's a good reason why.

---

## The problem with per-element listeners at scale

Imagine you have a table with 5,000 rows. Each row has a delete button. With the naive approach, that's 5,000 individual `click` listeners living in memory. Scroll the table, filter it, re-render it — every update means removing old listeners and attaching new ones.

It works, but it's wasteful. The DOM API isn't free, and neither is garbage collection.

The better pattern — one that front-end developers have known about for years — is called **event delegation**. Instead of putting a listener on every button, you put *one* listener on a common ancestor and let the browser's event bubbling do the rest. When any button inside that ancestor is clicked, the single listener fires and you figure out which button it came from.

Rectify takes this idea and pushes it further: one listener on the root container, for every event type, for the entire application.

---

## How it actually works — step by step

### Setting up the event map

The first thing Rectify does when `@rectify-dev/dom-binding` loads is call `registerNativeEvent()`. This runs once and builds a simple two-way lookup between Rectify's camelCase prop names and the browser's native event names:

```typescript
// "onClick" in your JSX maps to the native "click" event
registrationNameDependencies["onClick"]   = ["click"];
registrationNameDependencies["onKeyDown"] = ["keydown"];
registrationNameDependencies["onChange"]  = ["change"];
// ... 30+ events in total

// and the reverse, so dispatch can go the other way
nativeEventToRectifyName.set("click",   "onClick");
nativeEventToRectifyName.set("keydown", "onKeyDown");
```

Nothing fancy here — it's just a translation table. But this is the foundation everything else sits on.

### Attaching listeners to the root container (just once)

When you call `createRoot(document.getElementById("app"))`, Rectify calls `listenToAllEventSupported` on that container element. It loops through every native event name from the step above and attaches one capture-phase listener to the container:

```typescript
allNativeEvents.forEach((domEventName) => {
  const listener = createEventListenerWrapper(container, domEventName);
  container.addEventListener(domEventName, listener, true); // true = capture phase
});
```

That's it. For a typical app that's around 30 listeners total on a single `<div>` — regardless of whether you have 10 components or 10,000.

One more detail: the container gets a stamp on it — a hidden property like `_rectifyEventListening$abc123`. If you ever create a nested Rectify root inside the same DOM tree, Rectify checks for this stamp and skips re-registration. Without this check, a portal inside your app would cause every event to fire twice.

### Storing your handler in a hidden Map (not on the DOM)

Now here's the part that's a bit unusual. When Rectify commits a component and processes its props, it doesn't call `addEventListener` for event props. Instead it stores your handler in a `Map` that lives on the DOM node itself, under a hidden randomised key:

```typescript
// Your JSX: <button onClick={handleClick} className="btn" />

// Regular attribute — goes to the DOM normally
element.setAttribute("class", "btn");

// Event handler — goes into a hidden Map on the node
const handlerMap = getEventHandlerListeners(element) ?? new Map();
handlerMap.set("onClick", handleClick);
setEventHandlerListeners(element, handlerMap); // stored as element["__rectifyListeners$xyz"]
```

Why? Because updating handlers on re-render becomes a single `map.set`. No `removeEventListener`, no `addEventListener`, no browser API overhead at all. Just a map entry being overwritten.

And on unmount, the DOM node gets garbage collected and takes the map with it. Zero cleanup code needed.

### Connecting the DOM node back to the fiber tree

There's one more hidden key set on every DOM node during commit: the fiber reference itself.

```typescript
// stored as element["__rectifyFiber$xyz"] = fiber
precacheFiberNode(fiber, domNode);
```

This is the bridge. When an event fires and we have a DOM node, this lets us immediately look up which fiber in the tree it belongs to — and from there, walk all the way up to the root.

### When you actually click — the dispatch

Okay, so your user clicks a button. The browser fires the native `click` event in capture phase. The container's listener picks it up immediately (before any other element even sees it). Here's what happens next:

```
User clicks <button> somewhere deep in the tree
  ↓
dispatchEvent("click", container, nativeEvent)
  ↓
1. Look up the target DOM node from nativeEvent.target
2. Use the hidden fiber key to get the Fiber for that <button>
3. Wrap the native event in a SyntheticEvent
4. Walk fiber.return up toward the container, collecting the path:
   [buttonFiber → listItemFiber → listFiber → appFiber]
5. Loop through the path from innermost to outermost (simulating bubbling):
   - Look up the handler map on each DOM node
   - Translate "click" → "onClick" using the lookup table
   - If the map has an "onClick" entry, call it
   - If the handler calls stopPropagation(), stop the loop
```

This is how bubbling works in Rectify — not via the browser's native bubble mechanism, but by walking up the fiber tree and calling handlers along the way. The browser's bubble phase never actually runs because the capture listener handles everything first.

### Priority: making sure clicks feel instant

There's one more thing happening around every handler call that you might not notice but would definitely feel if it was missing.

Right before calling your handler, Rectify does this:

```typescript
setEventPriority(InputLane); // mark current work as user-interaction priority
handler(syntheticEvent);
resetEventPriority();        // back to default
```

`InputLane` is Rectify's highest-priority lane for state updates — it means synchronous. So any `setState` you call inside a click handler gets processed immediately, before the browser has a chance to paint. The result: the UI always responds to clicks without any visible delay.

The clever part is how this is wired up. `rectify-dom-binding` (the events package) has zero dependency on the reconciler (the scheduling package). Instead, at startup the reconciler injects two callbacks:

```typescript
injectEventPriorityCallbacks(
  (priority) => { currentLanePriority = priority; },
  ()         => { currentLanePriority = DefaultLane; },
);
```

Clean separation. The events system doesn't need to know anything about scheduling — it just calls the callbacks it was given.

---

## So why not just use per-element addEventListener?

Honestly? For a small app, you could. It would work. But here's what that would cost you at scale:

| | Per-element `addEventListener` | Rectify delegation |
|---|---|---|
| Memory | 1 listener per interactive element | ~30 listeners total, forever |
| Mount | `addEventListener` call per commit | `map.set` per commit |
| Update handler | `removeEventListener` + `addEventListener` | single `map.set` |
| Unmount | Must track and remove every listener | node GC takes the map with it |
| List of 10k items | 10k listeners | still just 30 |
| Nested roots | Likely double-fires | ancestor marker check prevents it |

The reason capture phase is used (instead of the default bubble phase) is more subtle. If a child element calls `nativeEvent.stopPropagation()` in a native listener, that stops the browser's bubble chain — but Rectify's container wouldn't even see the event in bubble phase. Using capture guarantees Rectify intercepts every event first, every time.

---

## What other approaches could have been taken?

It's worth thinking about the roads not taken, because they each reveal a real trade-off.

**WeakMap instead of hidden property keys** — rather than `element["__rectifyFiber$xyz"] = fiber`, a `WeakMap<Node, Fiber>` would be cleaner. No hidden properties cluttering the object. The downside is WeakMap lookups are slightly slower than property access, and it adds module-level state. It's a valid alternative, just a different trade-off.

**Bubble phase delegation instead of capture** — this is how older versions of React worked (pre-17). It's simpler, but portals break it. If you render a portal into a `<div>` outside your root, events from inside that portal won't reach a bubble-phase listener on the root. Capture phase solves this cleanly.

**No SyntheticEvent wrapper** — you could pass the native event directly to handlers and skip the allocation entirely. The problem is that Rectify simulates its own bubbling, separate from the browser's. To support `stopPropagation` across that custom walk, you need your own flag. The `SyntheticEvent` class is basically just a wrapper with that flag on it — and it also gives you a consistent API regardless of which browser quirks the native event has.

---

## Pros and cons — honestly

No approach is perfect. Here's a realistic assessment:

**The good parts:**

- Memory usage is basically flat. Your app can grow to thousands of components and the event listener count stays constant.
- Re-rendering is cheap for events. Changing a handler is a map write, nothing more.
- Event-triggered `setState` is always synchronous — users feel instant feedback on clicks and keypresses.
- Bubbling works correctly even across portals, which is notoriously tricky with native event delegation.
- Nested roots don't double-fire thanks to the ancestor marker check.

**The less good parts:**

- Every event goes through the capture listener even if nothing in your app handles it. For high-frequency events like `mousemove` or `scroll`, this adds a small constant overhead. It's usually negligible, but it's real.
- You can't pass `{ passive: true }` on a per-element basis. Rectify makes a fixed choice per event type. Passive event support isn't currently exposed through JSX props.
- Browser DevTools can be confusing. Open "Event Listeners" on a button and you won't see `onClick` — you'll see nothing. The listener is on the container, not the button. If you're not expecting that, it looks like a bug.
- A `SyntheticEvent` object is allocated on every dispatch. These are short-lived and get GC'd quickly, but for genuinely high-frequency events (pointer tracking, canvas interactions) it adds GC pressure.
