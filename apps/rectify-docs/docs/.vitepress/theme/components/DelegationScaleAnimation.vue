<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const ROW_COUNT = 7;
const RED = "#ff6b6b";
const GREEN = "#69db7c";

const phase = ref<"naive" | "rectify">("naive");
const naiveCount = ref(0);
const isPlaying = ref(true);
const isNaive = computed(() => phase.value === "naive");

let timer: ReturnType<typeof setTimeout> | undefined;

const tick = () => {
  clearTimeout(timer);
  if (!isPlaying.value) return;
  if (phase.value === "naive" && naiveCount.value < ROW_COUNT) {
    timer = setTimeout(() => naiveCount.value++, 320);
  } else if (phase.value === "naive") {
    timer = setTimeout(() => (phase.value = "rectify"), 2000);
  } else {
    timer = setTimeout(() => {
      phase.value = "naive";
      naiveCount.value = 0;
    }, 3200);
  }
};

// Timers start on mount only: they would keep the Node process alive during SSR.
onMounted(() => watch([phase, naiveCount, isPlaying], tick, { immediate: true }));
onBeforeUnmount(() => clearTimeout(timer));

const status = computed(() =>
  isNaive.value
    ? naiveCount.value < ROW_COUNT
      ? `Attaching listener ${naiveCount.value + 1} of ${ROW_COUNT}…`
      : "All listeners attached."
    : "Rectify: one root listener, handlers in a Map.",
);
</script>

<template>
  <div class="anim">
    <div class="cols">
      <div class="col">
        <div class="heading" :style="{ color: isNaive ? RED : undefined }">
          Per-element addEventListener
        </div>
        <div class="row" style="margin-bottom: 4px">
          <span class="label" :class="{ active: isNaive }">&lt;div id="app"&gt;</span>
        </div>
        <div v-for="i in ROW_COUNT" :key="i" class="row indent">
          <span class="label" :class="{ active: isNaive }">&lt;button&gt; row {{ i }}</span>
          <div
            class="dot"
            :style="isNaive && i <= naiveCount ? { background: RED, boxShadow: `0 0 7px ${RED}` } : {}"
          />
          <span class="badge" :style="{ color: RED, opacity: isNaive && i <= naiveCount ? 1 : 0 }">
            listener
          </span>
        </div>
        <div class="count" :style="{ color: isNaive ? RED : undefined }">
          {{ isNaive ? `${naiveCount} / ${ROW_COUNT} listeners` : `${ROW_COUNT} listeners` }}
        </div>
      </div>

      <div class="col">
        <div class="heading" :style="{ color: !isNaive ? GREEN : undefined }">
          Rectify delegation
        </div>
        <div class="row" style="margin-bottom: 4px">
          <span class="label" :class="{ active: !isNaive }">&lt;div id="app"&gt;</span>
          <div class="dot" :style="!isNaive ? { background: GREEN, boxShadow: `0 0 7px ${GREEN}` } : {}" />
          <span class="badge" :style="{ color: GREEN, opacity: !isNaive ? 1 : 0 }">
            1 listener (root only)
          </span>
        </div>
        <div v-for="i in ROW_COUNT" :key="i" class="row indent">
          <span class="label" :class="{ active: !isNaive }">&lt;button&gt; row {{ i }}</span>
          <span v-if="!isNaive" class="muted small">Map.set only</span>
        </div>
        <div class="count" :style="{ color: !isNaive ? GREEN : undefined }">1 listener (always)</div>
      </div>
    </div>

    <div class="controls">
      <button class="btn" @click="isPlaying = !isPlaying">{{ isPlaying ? "⏸ Pause" : "▶ Play" }}</button>
      <span class="muted status">{{ status }}</span>
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
.cols { display: flex; gap: 32px; flex-wrap: wrap; }
.col { flex: 1 1 220px; min-width: 0; }
.heading {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: 10px; color: var(--vp-c-text-3); transition: color 0.4s;
}
.row { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 13px; }
.indent { padding-left: 16px; }
.label { color: var(--vp-c-text-3); transition: color 0.3s; }
.label.active { color: var(--vp-c-text-1); }
.dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: transparent; transition: all 0.25s ease;
}
.badge { font-size: 10px; white-space: nowrap; font-weight: 600; transition: opacity 0.25s; }
.count { margin-top: 10px; font-size: 13px; font-weight: 600; color: var(--vp-c-text-3); transition: color 0.4s; }
.muted { color: var(--vp-c-text-3); }
.small { font-size: 10px; }
.controls { margin-top: 14px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.status { font-size: 12px; }
.btn {
  padding: 4px 12px; font-size: 12px; border-radius: 4px; cursor: pointer;
  border: 1px solid var(--vp-c-divider); background: transparent; color: var(--vp-c-text-2);
}
</style>
