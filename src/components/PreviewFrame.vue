<script setup>
import { ref, watchEffect } from 'vue'

const props = defineProps({
  tipo: { type: String, required: true },
  codigo: { type: String, default: '' },
})

const srcdoc = ref(baseDoc(''))

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
</script>

<template>
  <iframe class="preview-frame" :srcdoc="srcdoc" sandbox="allow-scripts" title="Preview do asset" />
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
</style>
