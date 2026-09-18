<script setup>
import { reactive, computed, ref, watch } from 'vue'
import PreviewFrame from './PreviewFrame.vue'
import CodeEditor from './CodeEditor.vue'

const props = defineProps({
  asset: { type: Object, default: null },
  categoriasExistentes: { type: Array, default: () => [] },
  novoId: { type: Function, required: true },
})

const emit = defineEmits(['salvar', 'cancelar', 'dirty-change'])

const tiposDisponiveis = [
  { valor: 'javascript', label: 'JavaScript' },
  { valor: 'vue', label: 'Vue Component' },
  { valor: 'html', label: 'HTML/CSS' },
]

function criarFormularioVazio() {
  return {
    id: props.novoId(),
    nome: '',
    tipo: 'javascript',
    categoria: '',
    descricao: '',
    tags: '',
    codigo: '',
    variacoes: [],
  }
}

function snapshotDe(asset) {
  return asset
    ? {
        ...asset,
        tags: (asset.tags || []).join(', '),
        variacoes: (asset.variacoes || []).map((v) => ({ ...v })),
      }
    : criarFormularioVazio()
}

const estadoInicial = snapshotDe(props.asset)
const form = reactive(JSON.parse(JSON.stringify(estadoInicial)))

const abaAtiva = ref('sobre')
const editorExpandido = ref(false)

const isDirty = computed(() => JSON.stringify(form) !== JSON.stringify(estadoInicial))

watch(isDirty, (valor) => emit('dirty-change', valor), { immediate: true })

function confirmarDescarteSeNecessario() {
  if (!isDirty.value) return true
  return confirm('Você tem alterações não salvas. Deseja descartá-las?')
}

defineExpose({ confirmarDescarteSeNecessario })

const listaDataId = 'categorias-existentes'

// HTML/JS/CSS ficam num único editor (linguagem 'markup' faz o Prism destacar
// <script>/<style> embutidos); componentes Vue usam highlight de 'javascript' puro.
const linguagemEditor = computed(() => (form.tipo === 'vue' ? 'javascript' : 'markup'))

function adicionarVariacao() {
  form.variacoes.push({ nome: '', codigo: '' })
}

function removerVariacao(index) {
  form.variacoes.splice(index, 1)
}

function tentarCancelar() {
  if (confirmarDescarteSeNecessario()) emit('cancelar')
}

function salvar() {
  if (!form.nome.trim() || !form.codigo.trim()) return
  emit('salvar', {
    id: form.id,
    nome: form.nome.trim(),
    tipo: form.tipo,
    categoria: form.categoria.trim() || 'Sem categoria',
    descricao: form.descricao.trim(),
    tags: form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    codigo: form.codigo,
    variacoes: form.variacoes.filter((v) => v.nome.trim() || v.codigo.trim()),
  })
}
</script>

<template>
  <section class="form-container">
    <nav class="abas">
      <button :class="{ ativa: abaAtiva === 'sobre' }" @click="abaAtiva = 'sobre'">Sobre</button>
      <button :class="{ ativa: abaAtiva === 'codigo' }" @click="abaAtiva = 'codigo'">Código</button>

      <button
        v-if="abaAtiva === 'codigo'"
        class="botao-expandir"
        type="button"
        @click="editorExpandido = !editorExpandido"
      >
        {{ editorExpandido ? '⤢ Mostrar preview' : '⤡ Expandir editor' }}
      </button>
    </nav>

    <div class="corpo">
      <div v-show="abaAtiva === 'sobre'" class="aba-sobre">
        <label class="campo">
          Nome
          <input v-model="form.nome" type="text" placeholder="Ex: Debounce" />
        </label>

        <label class="campo">
          Tipo
          <select v-model="form.tipo">
            <option v-for="t in tiposDisponiveis" :key="t.valor" :value="t.valor">{{ t.label }}</option>
          </select>
        </label>

        <label class="campo">
          Categoria
          <input v-model="form.categoria" type="text" placeholder="Ex: Utils" :list="listaDataId" />
          <datalist :id="listaDataId">
            <option v-for="c in categoriasExistentes" :key="c" :value="c" />
          </datalist>
        </label>

        <label class="campo">
          Tags (separadas por vírgula)
          <input v-model="form.tags" type="text" placeholder="Ex: performance, eventos" />
        </label>

        <label class="campo campo-largo">
          Descrição
          <textarea v-model="form.descricao" rows="5" placeholder="Descrição completa do asset"></textarea>
        </label>
      </div>

      <div v-show="abaAtiva === 'codigo'" class="aba-codigo" :class="{ expandido: editorExpandido }">
        <div class="painel-editor">
          <CodeEditor
            v-model="form.codigo"
            :language="linguagemEditor"
            placeholder="HTML, CSS e JS juntos aqui (tudo o que o preview precisa pra rodar)"
          />

          <details class="variacoes">
            <summary>Variações ({{ form.variacoes.length }})</summary>
            <div class="variacoes-corpo">
              <button type="button" class="botao-adicionar-variacao" @click="adicionarVariacao">+ Adicionar variação</button>
              <div v-for="(v, i) in form.variacoes" :key="i" class="variacao">
                <input v-model="v.nome" type="text" placeholder="Nome da variação" />
                <textarea v-model="v.codigo" rows="4" class="mono" placeholder="Código da variação"></textarea>
                <button type="button" class="remover" @click="removerVariacao(i)">Remover</button>
              </div>
            </div>
          </details>
        </div>

        <div v-if="!editorExpandido" class="painel-preview">
          <PreviewFrame :tipo="form.tipo" :codigo="form.codigo" />
        </div>
      </div>
    </div>

    <footer class="rodape">
      <button @click="tentarCancelar">Cancelar</button>
      <button class="primario" @click="salvar">Salvar</button>
    </footer>
  </section>
</template>

<style scoped>
.form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fbfbfc;
}

.abas {
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #e2e4e9;
  padding: 0 16px;
  flex-shrink: 0;
}

.abas button {
  background: transparent;
  border: none;
  padding: 12px 14px;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.abas button.ativa {
  color: #1f2430;
  border-bottom-color: #3b4a6b;
  font-weight: 600;
}

.botao-expandir {
  margin-left: auto;
  border: 1px solid #dcdfe4 !important;
  border-radius: 6px;
  padding: 4px 10px !important;
  font-size: 12px !important;
  color: #444 !important;
}

.corpo {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.aba-sobre {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-content: start;
  max-width: 720px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #444;
}

.campo-largo {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  padding: 8px;
  border: 1px solid #dcdfe4;
  border-radius: 6px;
  font-size: 14px;
}

textarea.mono {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 13px;
}

.aba-codigo {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
}

.aba-codigo.expandido {
  grid-template-columns: 1fr;
}

.painel-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  min-height: 0;
}

.variacoes {
  flex-shrink: 0;
  border: 1px solid #e2e4e9;
  border-radius: 6px;
  background: #fff;
}

.variacoes summary {
  padding: 8px 12px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  user-select: none;
}

.variacoes-corpo {
  padding: 0 12px 12px;
  max-height: 220px;
  overflow-y: auto;
}

.botao-adicionar-variacao {
  border: 1px dashed #b7bcc7;
  background: transparent;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  margin-bottom: 10px;
}

.variacao {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #e2e4e9;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
}

.variacao .remover {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: #c0392b;
  font-size: 12px;
  padding: 0;
}

.painel-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
}

.painel-preview :deep(.preview-frame) {
  flex: 1;
  min-height: 0;
}

.rodape {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e2e4e9;
  background: #fff;
  flex-shrink: 0;
}

.rodape button {
  border: 1px solid #dcdfe4;
  background: #fff;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 14px;
}

.rodape .primario {
  background: #3b4a6b;
  color: #fff;
  border-color: #3b4a6b;
}
</style>
