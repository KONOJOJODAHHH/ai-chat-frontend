<template>
  <ParentSize
    :parent-size-styles="parentSizeStyles"
    :debounce-time="50"
    v-bind="$attrs"
  >
    <template #default>
      <canvas
        ref="canvasRef"
        :style="canvasStyle"
      />
      <slot v-if="isLoading" />
    </template>
  </ParentSize>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { Application, type SplineEventName } from "@splinetool/runtime";
import { useDebounceFn, useIntersectionObserver } from "@vueuse/core";
import ParentSize from "./ParentSize.vue";

const props = defineProps({
  scene: {
    type: String,
    required: true,
  },
  onLoad: Function,
  renderOnDemand: {
    type: Boolean,
    default: true,
  },
  style: Object,
});

const emit = defineEmits([
  "error",
  "load",
  "spline-mouse-down",
  "spline-mouse-up",
  "spline-mouse-move",
  "spline-mouse-hover",
  "spline-key-down",
  "spline-key-up",
  "spline-start",
  "spline-look-at",
  "spline-follow",
  "spline-scroll",
]);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(false);
const splineApp = ref<Application | null>(null);
const isVisible = ref(true);
const isPointerInside = ref(false);

// eslint-disable-next-line func-style
let cleanup: () => void = () => {};
let pointerEventsCleanup: () => void = () => {};

const parentSizeStyles = computed(() => ({
  overflow: "hidden",
  ...props.style,
}));

const canvasStyle = computed(() => ({
  display: "block",
  width: "100%",
  height: "100%",
}));

// Use IntersectionObserver to detect when component is visible
const { stop: stopIntersectionObserver } = useIntersectionObserver(
  canvasRef,
  ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting;
    if (isIntersecting && splineApp.value) {
      // When becoming visible again, force a resize
      nextTick(() => {
        if (canvasRef.value && splineApp.value) {
          splineApp.value.requestRender();
          splineApp.value.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight);
        }
      });
    }
  },
  { threshold: 0.1 },
);

function eventHandler(name: SplineEventName, handler?: (e: any) => void) {
  if (!handler || !splineApp.value) return;
  const debouncedHandler = useDebounceFn(handler, 50, { maxWait: 100 });
  splineApp.value.addEventListener(name, debouncedHandler);
  return () => splineApp.value?.removeEventListener(name, debouncedHandler);
}

async function initSpline() {
  if (!canvasRef.value) return;
  
  isLoading.value = true;
  
  try {
    // Clean up previous instance if exists
    if (splineApp.value) {
      splineApp.value.dispose();
      splineApp.value = null;
    }
    
    splineApp.value = new Application(canvasRef.value, {
      renderOnDemand: props.renderOnDemand,
    });
    
    await splineApp.value.load(props.scene);
    splineApp.value.setGlobalEvents?.(true);
    pointerEventsCleanup();
    pointerEventsCleanup = bridgePointerEvents();
    
    // Set up event listeners
    const cleanUpFns = [
      eventHandler("mouseDown", (e: any) => emit("spline-mouse-down", e)),
      eventHandler("mouseUp", (e: any) => emit("spline-mouse-up", e)),
      eventHandler("mouseHover", (e: any) => emit("spline-mouse-hover", e)),
      eventHandler("keyDown", (e: any) => emit("spline-key-down", e)),
      eventHandler("keyUp", (e: any) => emit("spline-key-up", e)),
      eventHandler("start", (e: any) => emit("spline-start", e)),
      eventHandler("lookAt", (e: any) => emit("spline-look-at", e)),
      eventHandler("follow", (e: any) => emit("spline-follow", e)),
      eventHandler("scroll", (e: any) => emit("spline-scroll", e)),
    ].filter(Boolean);
    
    // 添加原生鼠标移动监听
    const mouseMoveHandler = (e: MouseEvent) => {
      emit("spline-mouse-move", e);
    };
    window.addEventListener("mousemove", mouseMoveHandler);
    
    isLoading.value = false;
    emit("load", splineApp.value);
    props.onLoad?.(splineApp.value);
    
    return () => {
      cleanUpFns.forEach((fn) => fn?.());
      window.removeEventListener("mousemove", mouseMoveHandler);
      pointerEventsCleanup();
    };
  } catch (err) {
    console.error("Spline initialization error:", err);
    emit("error", err);
    isLoading.value = false;
    return () => {};
  }
}

async function initialize() {
  cleanup();
  cleanup = (await initSpline()) ?? (() => {});
}

onMounted(async () => {
  await initialize();
  
  // Reinitialize when becoming visible again
  watch(isVisible, (visible) => {
    if (visible) {
      initialize();
    }
  });
});

onUnmounted(() => {
  stopIntersectionObserver();
  if (splineApp.value) {
    splineApp.value.dispose();
    splineApp.value = null;
  }
  pointerEventsCleanup();
});

function bridgePointerEvents() {
  const canvas = canvasRef.value;
  if (!canvas) return () => {};

  let rafId = 0;
  let pendingEvent: PointerEvent | null = null;

  const dispatchEventOnCanvas = (type: string, source: PointerEvent) => {
    if (!canvasRef.value) return;
    const synthesized = new PointerEvent(type, {
      bubbles: true,
      cancelable: false,
      pointerId: source.pointerId,
      pointerType: source.pointerType,
      clientX: source.clientX,
      clientY: source.clientY,
      screenX: source.screenX,
      screenY: source.screenY,
      buttons: source.buttons,
      ctrlKey: source.ctrlKey,
      altKey: source.altKey,
      shiftKey: source.shiftKey,
      metaKey: source.metaKey,
    });
    canvasRef.value.dispatchEvent(synthesized);
  };

  const flush = () => {
    rafId = 0;
    if (!pendingEvent || !canvasRef.value) return;
    const rect = canvasRef.value.getBoundingClientRect();
    const inside =
      pendingEvent.clientX >= rect.left &&
      pendingEvent.clientX <= rect.right &&
      pendingEvent.clientY >= rect.top &&
      pendingEvent.clientY <= rect.bottom;

    if (inside) {
      if (!isPointerInside.value) {
        dispatchEventOnCanvas("pointerenter", pendingEvent);
        dispatchEventOnCanvas("mouseenter", pendingEvent);
      }
      dispatchEventOnCanvas("pointermove", pendingEvent);
      dispatchEventOnCanvas("mousemove", pendingEvent);
    } else if (isPointerInside.value) {
      dispatchEventOnCanvas("pointerleave", pendingEvent);
      dispatchEventOnCanvas("mouseleave", pendingEvent);
    }

    isPointerInside.value = inside;
    pendingEvent = null;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!canvasRef.value) return;
    if (event.target === canvasRef.value) {
      isPointerInside.value = true;
      return;
    }
    pendingEvent = event;
    if (!rafId) {
      rafId = requestAnimationFrame(flush);
    }
  };

  const handleWindowLeave = () => {
    if (!isPointerInside.value || !canvasRef.value) return;
    const fakeEvent =
      pendingEvent ?? new PointerEvent("pointerleave", { clientX: 0, clientY: 0 });
    dispatchEventOnCanvas("pointerleave", fakeEvent);
    dispatchEventOnCanvas("mouseleave", fakeEvent);
    isPointerInside.value = false;
    pendingEvent = null;
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", handleWindowLeave);
  window.addEventListener("blur", handleWindowLeave);

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerleave", handleWindowLeave);
    window.removeEventListener("blur", handleWindowLeave);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    pendingEvent = null;
    isPointerInside.value = false;
  };
}
</script>
