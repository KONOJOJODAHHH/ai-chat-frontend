<template>
  <div ref="containerRef" :style="parentSizeStyles">
    <slot v-bind="{ width, height }" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  parentSizeStyles?: Record<string, any>
  debounceTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  parentSizeStyles: () => ({}),
  debounceTime: 300
})

const containerRef = ref<HTMLDivElement | null>(null)
const width = ref(0)
const height = ref(0)

const updateSize = () => {
  if (containerRef.value) {
    width.value = containerRef.value.clientWidth
    height.value = containerRef.value.clientHeight
  }
}

const debouncedUpdateSize = useDebounceFn(updateSize, props.debounceTime)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateSize()
  
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(debouncedUpdateSize)
    resizeObserver.observe(containerRef.value)
  } else {
    window.addEventListener('resize', debouncedUpdateSize)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', debouncedUpdateSize)
  }
})
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
