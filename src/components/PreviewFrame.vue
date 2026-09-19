<script setup>
import { ref, watchEffect, onUnmounted } from 'vue'
import { runServerCode, stopServer } from '../composables/useWebContainer.js'

const props = defineProps({
  tipo: { type: String, required: true },
  codigo: { type: String, default: '' },
})

const srcdoc = ref(baseDoc(''))
const serverUrl = ref(null)
const serverLog = ref('')
const serverError = ref(null)
const serverBooting = ref(false)

// Evita que a resposta de uma execução antiga (asset trocado no meio do
// boot/instalação) sobrescreva o estado de uma execução mais nova.
let runToken = 0

// Vue embutido localmente (bundlado pelo Vite) em vez de CDN externo,
// para o preview funcionar offline e sem depender de rede de terceiros.
let vueGlobalCodePromise = null
function carregarVueGlobal() {
  if (!vueGlobalCodePromise) {
    vueGlobalCodePromise = import('vue/dist/vue.global.js?raw').then((m) => m.default)
  }
  return vueGlobalCodePromise
}

watchEffect(async () => {
  const tipo = props.tipo
  const codigo = props.codigo

  if (tipo === 'server') {
    const token = ++runToken
    serverUrl.value = null
    serverError.value = null
    serverLog.value = ''

    if (!codigo.trim()) {
      serverError.value = 'Sem código de servidor definido para este asset.'
      return
    }

    serverBooting.value = true
    try {
      const { url } = await runServerCode(codigo, {
        onLog: (chunk) => {
          if (token === runToken) serverLog.value += stripAnsi(chunk)
        },
      })
      if (token === runToken) serverUrl.value = url
    } catch (err) {
      if (token === runToken) serverError.value = err.message || String(err)
    } finally {
      if (token === runToken) serverBooting.value = false
    }
    return
  }

  if (tipo === 'javascript' || tipo === 'html') {
    srcdoc.value = codigo.trim()
      ? baseDoc(codigo)
      : baseDoc('<p style="font-family:sans-serif;color:#888;">Sem código definido para este asset.</p>')
    return
  }

  if (tipo === 'vue') {
    if (!codigo.trim()) {
      srcdoc.value = baseDoc('<p style="font-family:sans-serif;color:#888;">Sem código de componente definido.</p>')
      return
    }

    const vueGlobalCode = await carregarVueGlobal()

    // Converte "export default {...}" em uma atribuição global simples para
    // rodar como script comum no iframe (sem precisar de bundler/ESM).
    const componentSource = codigo.replace(/export\s+default/, 'window.__component =')
    const body = `
      <div id="vue-root"></div>
      <script>
        ${escapeInlineScript(vueGlobalCode)}
      <\/script>
      <script>
        ${escapeInlineScript(componentSource)}
      <\/script>
      <script>
        try {
          Vue.createApp(window.__component).mount('#vue-root');
        } catch (err) {
          document.body.innerHTML = '<pre style="color:#c00;font-family:monospace;">' + err.message + '</pre>';
        }
      <\/script>
    `
    srcdoc.value = baseDoc(body)
    return
  }

  srcdoc.value = baseDoc('<p style="font-family:sans-serif;color:#888;">Tipo de preview não suportado.</p>')
})

// O WebContainer aloca um pseudo-terminal pro npm install, então a saída
// vem cheia de códigos ANSI (cursor, cores, limpar linha) pensados pra um
// terminal real — sem isso o log do preview fica ilegível.
const ANSI_REGEX = /[\u001B\u009B][[\]()#;?]*(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007|(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~])/g
function stripAnsi(str) {
  return str.replace(ANSI_REGEX, '')
}

// Escapa sequências que o parser HTML interpreta dentro de uma tag <script>
// mesmo quando aparecem só como texto dentro de strings/comentários JS
// (ex: "<!--" ou "</script"), sem alterar o comportamento do código em runtime.
function escapeInlineScript(code) {
  return code.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--')
}

function baseDoc(bodyContent) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>body { margin: 12px; font-family: sans-serif; }</style>
  </head>
  <body>
    ${bodyContent}
  </body>
</html>`
}

onUnmounted(() => {
  if (props.tipo === 'server') stopServer()
})
</script>

<template>
  <div v-if="tipo === 'server'" class="server-preview">
    <div v-if="serverBooting || serverLog" class="server-console">
      <span v-if="serverBooting" class="server-status">⏳ Preparando WebContainer...</span>
      <pre>{{ serverLog }}</pre>
    </div>
    <p v-if="serverError" class="server-error">⚠️ {{ serverError }}</p>
    <iframe
      v-if="serverUrl"
      class="preview-frame"
      :src="serverUrl"
      title="Preview do asset (servidor)"
    />
  </div>
  <iframe v-else class="preview-frame" :srcdoc="srcdoc" sandbox="allow-scripts" title="Preview do asset" />
</template>

<style scoped>
.preview-frame {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: 1px solid #dcdfe4;
  border-radius: 6px;
  background: #fff;
}

.server-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 300px;
}

.server-console {
  flex-shrink: 0;
  max-height: 140px;
  overflow-y: auto;
  background: #1a1a1a;
  color: #ddd;
  border-radius: 6px;
  padding: 8px 10px;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
}

.server-status {
  display: block;
  color: #f5c542;
  margin-bottom: 4px;
}

.server-console pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.server-error {
  flex-shrink: 0;
  margin: 0;
  color: #c0392b;
  font-family: sans-serif;
  font-size: 13px;
}

.server-preview .preview-frame {
  flex: 1;
  min-height: 0;
}
</style>
