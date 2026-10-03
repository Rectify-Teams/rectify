<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

type Highlight = "orange" | "blue" | "green" | "gray" | "dim";
type HighlightMap = Partial<Record<string, Highlight>>;

const STEPS = [
  { title: "Idle", desc: "Application is idle. ~30 capture listeners sit on the root container. Nothing else." },
  { title: "① User clicks", desc: 'User clicks the <button>. The browser prepares a native "click" event.' },
  { title: "② Capture phase", desc: "Event travels DOWN the DOM tree: document → body → #app. Capture fires on the way down, not up." },
  { title: "③ Intercept", desc: 'The container listener on <div id="app"> fires — before the event even reaches <button>.' },
  { title: "④ Fiber lookup", desc: 'nativeEvent.target → <button> DOM node → node["__rectifyFiber$xyz"] → buttonFiber.' },
  { title: "⑤ SyntheticEvent", desc: "Native event is wrapped. SyntheticEvent adds a custom stopPropagation flag for the fiber walk." },
  { title: "⑥ Walk: button", desc: 'buttonFiber: map.get("onClick") ✓ → setEventPriority(InputLane) → handler() → resetEventPriority().' },
  { title: "⑦ Walk: li", desc: 'liFiber: map.get("onClick") → undefined. No handler on <li>. Skip and continue up.' },
  { title: "⑧ Walk: ul", desc: 'ulFiber: map.get("onClick") ✓ → handler called. isPropagationStopped()? No → continue.' },
  { title: "⑨ Done", desc: "Walk reaches the container root. All matching handlers have been called. Bubbling simulation complete." },
];
const TOTAL = STEPS.length;

const domHighlights: HighlightMap[] = [
  {},
  { button: "orange" },
  { doc: "orange", body: "orange", app: "orange" },
  { app: "blue" },
  { button: "blue" },
  { button: "blue" },
  { button: "blue" },
  {},
  {},
  {},
];

const fiberHighlights: HighlightMap[] = [
  {},
  {},
  {},
  {},
  { buttonf: "blue" },
  { buttonf: "blue" },
  { buttonf: "green" },
  { lif: "gray" },
  { ulf: "green" },
  { ulf: "dim", lif: "dim", buttonf: "dim" },
];

const domNodes = [
  { id: "doc", label: "document", indent: 0 },
  { id: "body", label: "<body>", indent: 1 },
  { id: "app", label: '<div id="app">', indent: 2 },
  { id: "ul", label: "<ul>", indent: 3 },
  { id: "li", label: "<li>", indent: 4 },
  { id: "button", label: "<button>", indent: 5 },
];

const fiberNodes = [
  { id: "appf", label: "AppFiber", detail: "" },
  { id: "ulf", label: "ulFiber", detail: " { onClick: ƒ }" },
  { id: "lif", label: "liFiber", detail: " (no handler)" },
  { id: "buttonf", label: "buttonFiber", detail: " { onClick: ƒ }" },
];

const idx = ref(0);
const isPlaying = ref(true);

let timer: ReturnType<typeof setInterval> | undefined;
// Timers start on mount only: they would keep the Node process alive during SSR.
onMounted(() =>
  watch(
    isPlaying,
    (playing) => {
      clearInterval(timer);
      if (playing) timer = setInterval(() => (idx.value = (idx.value + 1) % TOTAL), 2200);
    },
    { immediate: true },
  ),
);
onBeforeUnmount(() => clearInterval(timer));

const jump = (i: number) => {
  idx.value = Math.min(TOTAL - 1, Math.max(0, i));
  isPlaying.value = false;
};
</script>

<template>
  <div class="anim">
    <div class="progress">
      <div
        v-for="(_, i) in STEPS"
        :key="i"
        class="seg"
        :class="{ current: i === idx, past: i < idx }"
        @click="jump(i)"
      />
    </div>

    <div class="step">
      <strong>{{ STEPS[idx].title }}</strong>
      <span>{{ STEPS[idx].desc }}</span>
    </div>

    <div class="trees">
      <div class="tree">
        <div class="heading">DOM Tree</div>
        <div v-for="n in domNodes" :key="n.id" :style="{ paddingLeft: n.indent * 10 + 'px' }">
          <div class="node" :class="domHighlights[idx][n.id]">
            {{ n.label }}
            <span v-if="n.id === 'app' && idx <= 1" class="note muted">← ~30 listeners</span>
            <span v-if="n.id === 'app' && idx === 2" class="note" style="color: #ffa94d">← capture fires here ↙</span>
            <span v-if="n.id === 'app' && idx === 3" class="note" style="color: #4dabf7">← intercepting ✓</span>
          </div>
        </div>
      </div>

      <div class="tree">
        <div class="heading">Fiber Tree{{ idx >= 6 && idx <= 8 ? " (walking ↑)" : "" }}</div>
        <div v-for="n in fiberNodes" :key="n.id">
          <div class="node" :class="fiberHighlights[idx][n.id]">
            {{ n.label }}<span style="opacity: 0.6">{{ n.detail }}</span>
            <span v-if="fiberHighlights[idx][n.id] === 'green'" style="color: #69db7c"> ✓</span>
            <span v-if="fiberHighlights[idx][n.id] === 'gray'" style="color: #adb5bd"> (skip)</span>
          </div>
        </div>
        <div v-if="idx === 5" class="chip" style="color: #ffa94d; background: #ffa94d18; border-color: #ffa94d">
          SyntheticEvent ← created ✓
        </div>
        <div v-if="idx === 9" class="chip" style="color: #69db7c; background: #69db7c18; border-color: #69db7c">
          Bubbling complete ✓
        </div>
      </div>
    </div>

    <div class="controls">
      <button class="btn" @click="isPlaying = !isPlaying">{{ isPlaying ? "⏸ Pause" : "▶ Play" }}</button>
      <button class="btn" @click="jump(idx - 1)">← Prev</button>
      <button class="btn" @click="jump(idx + 1)">Next →</button>
      <span class="muted hint">{{ idx + 1 }} / {{ TOTAL }} — click the progress bar to jump to any step</span>
    </div>
  </div>
</template>

<style scoped>
.anim {
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 16px 0;
}
.progress { display: flex; gap: 4px; margin-bottom: 14px; }
.seg { flex: 1; height: 5px; border-radius: 3px; cursor: pointer; background: var(--vp-c-divider); transition: background 0.3s; }
.seg.past { background: #4dabf766; }
.seg.current { background: #4dabf7; }
.step {
  margin-bottom: 16px; padding: 10px 14px; border-radius: 6px; min-height: 52px;
  background: #4dabf710; border: 1px solid #4dabf740; font-size: 13px;
  display: flex; align-items: center; gap: 8px;
}
.step strong { color: #4dabf7; white-space: nowrap; }
.step span { color: var(--vp-c-text-2); }
.trees { display: flex; gap: 20px; flex-wrap: wrap; }
.tree { flex: 1 1 200px; min-width: 0; }
.heading {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  color: var(--vp-c-text-3); margin-bottom: 8px;
}
.node {
  padding: 4px 10px; border-radius: 4px; margin-bottom: 3px; font-size: 12.5px;
  background: transparent; border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2);
  transition: all 0.35s ease;
}
.node.orange { background: #ffa94d18; border-color: #ffa94d; color: var(--vp-c-text-1); box-shadow: 0 0 8px #ffa94d44; }
.node.blue { background: #4dabf718; border-color: #4dabf7; color: var(--vp-c-text-1); box-shadow: 0 0 8px #4dabf744; }
.node.green { background: #69db7c18; border-color: #69db7c; color: var(--vp-c-text-1); box-shadow: 0 0 8px #69db7c44; }
.node.gray { background: #adb5bd18; border-color: #adb5bd; color: var(--vp-c-text-2); }
.node.dim { border-color: var(--vp-c-divider); color: var(--vp-c-text-3); opacity: 0.5; }
.note { font-size: 11px; margin-left: 4px; }
.muted { color: var(--vp-c-text-3); }
.chip { margin-top: 8px; padding: 4px 10px; border-radius: 4px; font-size: 12px; border: 1px solid; }
.controls { margin-top: 14px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.hint { font-size: 11px; }
.btn {
  padding: 4px 12px; font-size: 12px; border-radius: 4px; cursor: pointer;
  border: 1px solid var(--vp-c-divider); background: transparent; color: var(--vp-c-text-2);
}
</style>
