<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { IEmbedVm } from "@wcvm/sdk";
import { projectFiles } from "../playgroundProject";

const host = ref<HTMLElement>();
const status = ref<"loading" | "ready" | "error">("loading");
const errorMessage = ref("");

let vm: IEmbedVm | undefined;

onMounted(async () => {
  try {
    if (!crossOriginIsolated) {
      throw new Error(
        "This page is not cross-origin isolated, which the embedded editor requires. " +
          "Serve it with Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp.",
      );
    }
    const { embed } = await import("@wcvm/sdk");
    vm = await embed(
      host.value!,
      {
        title: "Rectify Playground",
        files: projectFiles(),
        openFile: "src/App.tsx",
        startCommand: "npm run dev",
      },
      {
        view: "both",
        panes: { terminal: true },
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        height: "calc(100vh - 140px)",
      },
    );
    status.value = "ready";
  } catch (e) {
    status.value = "error";
    errorMessage.value = e instanceof Error ? e.message : String(e);
  }
});

onBeforeUnmount(() => vm?.destroy());
</script>

<template>
  <div class="playground">
    <p v-if="status === 'loading'" class="note">Loading editor… the first run installs packages and can take a while.</p>
    <p v-if="status === 'error'" class="note error">{{ errorMessage }}</p>
    <div ref="host" class="host" />
  </div>
</template>

<style scoped>
.playground { max-width: 1600px; margin: 0 auto; padding: 72px 24px 24px; }
.host { min-height: 400px; border: 1px solid var(--vp-c-divider); border-radius: 8px; overflow: hidden; }
.note { margin: 0 0 12px; font-size: 14px; color: var(--vp-c-text-2); }
.error { color: var(--vp-c-danger-1); }
</style>
