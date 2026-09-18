<script setup>
import { computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'

const props = defineProps({
  codigo: { type: String, default: '' },
  language: { type: String, default: 'markup' },
})

const highlighted = computed(() => {
  const grammar = Prism.languages[props.language] || Prism.languages.markup
  return Prism.highlight(props.codigo, grammar, props.language)
})
</script>

<template>
  <pre class="code-block"><code v-html="highlighted"></code></pre>
</template>

<style scoped>
.code-block {
  margin: 0;
  background: #1f2430;
  color: #e6e8ec;
  padding: 12px;
  border-radius: 6px;
  overflow: auto;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.code-block :deep(code) {
  font: inherit;
}

.code-block :deep(.token.comment) {
  color: #7d8492;
  font-style: italic;
}
.code-block :deep(.token.tag),
.code-block :deep(.token.keyword) {
  color: #7aa2f7;
}
.code-block :deep(.token.attr-name),
.code-block :deep(.token.property) {
  color: #e0af68;
}
.code-block :deep(.token.attr-value),
.code-block :deep(.token.string) {
  color: #9ece6a;
}
.code-block :deep(.token.function) {
  color: #7dcfff;
}
.code-block :deep(.token.number),
.code-block :deep(.token.boolean) {
  color: #ff9e64;
}
.code-block :deep(.token.punctuation),
.code-block :deep(.token.operator) {
  color: #a9b1d6;
}
.code-block :deep(.token.selector) {
  color: #bb9af7;
}
</style>
