<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  targetPath?: string
}>()

const dragging = ref(false)
const moved = ref(false)
const startX = ref(0)
const startY = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const posX = ref(24)
const posY = ref(24)

const target = computed(() => props.targetPath || '/transition-hc-flow-board')

const handlePointerDown = (event: PointerEvent) => {
  dragging.value = true
  moved.value = false
  startX.value = event.clientX
  startY.value = event.clientY
  offsetX.value = event.clientX - posX.value
  offsetY.value = event.clientY - posY.value
  ;(event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!dragging.value) return
  const deltaX = Math.abs(event.clientX - startX.value)
  const deltaY = Math.abs(event.clientY - startY.value)
  if (deltaX > 4 || deltaY > 4) moved.value = true
  const nextX = Math.min(Math.max(8, event.clientX - offsetX.value), window.innerWidth - 64)
  const nextY = Math.min(Math.max(8, event.clientY - offsetY.value), window.innerHeight - 64)
  posX.value = nextX
  posY.value = nextY
}

const handlePointerUp = (event: PointerEvent) => {
  dragging.value = false
  ;(event.currentTarget as HTMLElement)?.releasePointerCapture?.(event.pointerId)
  if (moved.value) return
  const source = encodeURIComponent(window.location.pathname)
  window.location.href = `${target.value}?from=${source}&flowSource=transition_hc_flow_board`
}
</script>

<template>
  <div
    class="flow-return-btn"
    role="button"
    tabindex="0"
    :style="{ right: `${posX}px`, bottom: `${posY}px` }"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @keydown.enter="handlePointerUp($event as unknown as PointerEvent)"
  >
    ↩
  </div>
</template>

<style scoped>
.flow-return-btn {
  position: fixed;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  color: #fff;
  font-size: 22px;
  line-height: 48px;
  text-align: center;
  box-shadow: 0 10px 24px rgba(22, 119, 255, 0.32);
  cursor: grab;
  z-index: 2000;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  touch-action: none;
}

.flow-return-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 26px rgba(22, 119, 255, 0.36);
}

.flow-return-btn:active {
  cursor: grabbing;
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .flow-return-btn {
    width: 52px;
    height: 52px;
    font-size: 24px;
    line-height: 52px;
  }
}
</style>
