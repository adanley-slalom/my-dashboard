<script setup lang="ts">
import { computed, ref } from 'vue'

export interface Option {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: Option[]
    label?: string
    id?: string
  }>(),
  {
    label: '',
    id: 'select',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find((o) => o.value === props.modelValue)
  return selected?.label ?? props.modelValue
})

const handleSelect = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="custom-select-wrapper">
    <label v-if="label" :for="id" class="custom-select-label">{{ label }}</label>
    <div class="custom-select-container">
      <button
        :id="id"
        class="custom-select-field"
        :aria-expanded="isOpen"
        @click="toggleDropdown"
        @blur="closeDropdown"
      >
        <span class="custom-select-value">{{ selectedLabel }}</span>
        <svg
          class="custom-select-chevron"
          :class="{ open: isOpen }"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M11.5 6.5L8 10l-3.5-3.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div v-if="isOpen" class="custom-select-menu">
        <button
          v-for="option in options"
          :key="option.value"
          class="custom-select-option"
          :class="{ selected: modelValue === option.value }"
          @click="handleSelect(option.value)"
          @mousedown.prevent
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@carbon/type' as type;

.custom-select-wrapper {
  width: 100%;
}

.custom-select-label {
  @include type.type-style('label-01');
  display: block;
  color: #a8a8a8;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.custom-select-container {
  position: relative;
}

.custom-select-field {
  @include type.type-style('body-compact-01');
  width: 100%;
  height: 40px;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #161616;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  position: relative;
}

.custom-select-field:hover {
  border-color: #0f62fe;
  background-color: #f4f4f4;
}

.custom-select-field:focus {
  outline: 2px solid #0f62fe;
  outline-offset: -2px;
  border-color: #0f62fe;
}

.custom-select-value {
  flex: 1;
}

.custom-select-chevron {
  width: 16px;
  height: 16px;
  color: #161616;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.custom-select-chevron.open {
  transform: translateY(-50%) rotate(180deg);
}

.custom-select-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
  margin-top: -1px;
}

.custom-select-option {
  @include type.type-style('body-compact-01');
  width: 100%;
  padding: 12px;
  border: none;
  background: white;
  color: #161616;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid #f4f4f4;
}

.custom-select-option:last-child {
  border-bottom: none;
}

.custom-select-option:hover {
  background-color: #f4f4f4;
  color: #0f62fe;
}

.custom-select-option.selected {
  background-color: #e8f4fd;
  color: #0f62fe;
  font-weight: 600;
}

.custom-select-option:active {
  background-color: #d0e8fc;
}

/* Scrollbar styling */
.custom-select-menu::-webkit-scrollbar {
  width: 8px;
}

.custom-select-menu::-webkit-scrollbar-track {
  background: transparent;
}

.custom-select-menu::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 2px;
}

.custom-select-menu::-webkit-scrollbar-thumb:hover {
  background: #8d8d8d;
}
</style>
