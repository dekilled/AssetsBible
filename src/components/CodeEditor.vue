<script setup>
import { ref, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'

const props = defineProps({
  modelValue: { type: String, default: '' },
  // 'markup' entende HTML com <script>/<style> embutidos (JS/CSS destacados
  // automaticamente); 'javascript' é usado para o código de componentes Vue.
  language: { type: String, default: 'markup' },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const preRef = ref(null)

const highlighted = computed(() => {
  const grammar = Prism.languages[props.language] || Prism.languages.markup
  // Espaço extra evita que a última linha vazia "suma" visualmente no highlight.
  return Prism.highlight(props.modelValue + '\n', grammar, props.language)
})

function onInput(event) {
  emit('update:modelValue', event.target.value)
}

function sincronizarScroll() {
  if (!preRef.value || !textareaRef.value) return
  preRef.value.scrollTop = textareaRef.value.scrollTop
  preRef.value.scrollLeft = textareaRef.value.scrollLeft
}

function onKeydown(event) {
  if (event.key !== 'Tab') return
  event.preventDefault()
  const el = textareaRef.value
  const start = el.selectionStart
  const end = el.selectionEnd
  const novoValor = props.modelValue.slice(0, start) + '  ' + props.modelValue.slice(end)
  emit('update:modelValue', novoValor)
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + 2
  })
}
</script>

<template>
  <div class="code-editor">
    <pre ref="preRef" class="code-editor-highlight" aria-hidden="true"><code v-html="highlighted"></code></pre>
    <textarea
      ref="textareaRef"
      class="code-editor-input"
      :value="modelValue"
      :placeholder="placeholder"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      @input="onInput"
      @scroll="sincronizarScroll"
      @keydown="onKeydown"
    ></textarea>
  </div>
</template>

<style scoped>
.code-editor {
  position: relative;
  flex: 1;
  min-height: 0;
  border: 1px solid #dcdfe4;
  border-radius: 6px;
  overflow: hidden;
  background: #1f2430;
}

.code-editor-highlight,
.code-editor-input {
  margin: 0;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  overflow: auto;
}

.code-editor-highlight,
.code-editor-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.code-editor-highlight {
  color: #e6e8ec;
  pointer-events: none;
}

.code-editor-input {
  resize: none;
  border: none;
  background: transparent;
  color: transparent;
  caret-color: #fff;
}

.code-editor-input::placeholder {
  color: #6b7280;
}

/* Paleta de tokens do Prism customizada pro tema escuro do editor. */
.code-editor-highlight :deep(.token.comment) {
  color: #7d8492;
  font-style: italic;
}
.code-editor-highlight :deep(.token.tag),
.code-editor-highlight :deep(.token.keyword) {
  color: #7aa2f7;
}
.code-editor-highlight :deep(.token.attr-name),
.code-editor-highlight :deep(.token.property) {
  color: #e0af68;
}
.code-editor-highlight :deep(.token.attr-value),
.code-editor-highlight :deep(.token.string) {
  color: #9ece6a;
}
.code-editor-highlight :deep(.token.function) {
  color: #7dcfff;
}
.code-editor-highlight :deep(.token.number),
.code-editor-highlight :deep(.token.boolean) {
  color: #ff9e64;
}
.code-editor-highlight :deep(.token.punctuation),
.code-editor-highlight :deep(.token.operator) {
  color: #a9b1d6;
}
.code-editor-highlight :deep(.token.selector) {
  color: #bb9af7;
}
</style>
