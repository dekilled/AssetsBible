<script setup>
import { reactive, computed } from 'vue'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps({
  asset: { type: Object, default: null },
  categoriasExistentes: { type: Array, default: () => [] },
  novoId: { type: Function, required: true },
})

const emit = defineEmits(['salvar', 'cancelar'])

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
    previewHtml: '',
    variacoes: [],
  }
}

const form = reactive(
  props.asset
    ? {
        ...props.asset,
        tags: (props.asset.tags || []).join(', '),
        variacoes: (props.asset.variacoes || []).map((v) => ({ ...v })),
      }
    : criarFormularioVazio()
)

const listaDataId = 'categorias-existentes'

function adicionarVariacao() {
  form.variacoes.push({ nome: '', codigo: '' })
}

function removerVariacao(index) {
  form.variacoes.splice(index, 1)
}

const assetPreview = computed(() => ({
  tipo: form.tipo,
  previewHtml: form.previewHtml,
  codigo: form.codigo,
}))

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
    previewHtml: form.previewHtml,
    variacoes: form.variacoes.filter((v) => v.nome.trim() || v.codigo.trim()),
  })
}
</script>

<template>
  <section class="form-container">
    <header class="cabecalho">
      <h2>{{ props.asset ? 'Editar asset' : 'Novo asset' }}</h2>
      <div class="acoes">
        <button @click="emit('cancelar')">Cancelar</button>
        <button class="primario" @click="salvar">Salvar</button>
      </div>
    </header>

    <div class="corpo">
      <div class="colunas-form">
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
          <textarea v-model="form.descricao" rows="3" placeholder="Descrição completa do asset"></textarea>
        </label>

        <label class="campo campo-largo">
          Código
          <textarea v-model="form.codigo" rows="10" class="mono" placeholder="Cole ou escreva o código aqui"></textarea>
        </label>

        <label class="campo campo-largo">
          Preview HTML (opcional, usado no iframe para JS/HTML)
          <textarea v-model="form.previewHtml" rows="8" class="mono" placeholder="HTML/CSS/JS para renderizar o preview"></textarea>
        </label>

        <div class="campo campo-largo">
          <div class="variacoes-cabecalho">
            <span>Variações</span>
            <button type="button" @click="adicionarVariacao">+ Adicionar variação</button>
          </div>
          <div v-for="(v, i) in form.variacoes" :key="i" class="variacao">
            <input v-model="v.nome" type="text" placeholder="Nome da variação" />
            <textarea v-model="v.codigo" rows="4" class="mono" placeholder="Código da variação"></textarea>
            <button type="button" class="remover" @click="removerVariacao(i)">Remover</button>
          </div>
        </div>
      </div>

      <div class="coluna-preview">
        <h4>Preview ao vivo</h4>
        <PreviewFrame :tipo="assetPreview.tipo" :preview-html="assetPreview.previewHtml" :codigo="assetPreview.codigo" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.form-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #fbfbfc;
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cabecalho h2 {
  margin: 0;
  font-size: 18px;
}

.acoes {
  display: flex;
  gap: 8px;
}

.acoes button {
  border: 1px solid #dcdfe4;
  background: #fff;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
}

.acoes .primario {
  background: #3b4a6b;
  color: #fff;
  border-color: #3b4a6b;
}

.corpo {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
}

.colunas-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-content: start;
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

.variacoes-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.variacoes-cabecalho button {
  border: 1px dashed #b7bcc7;
  background: transparent;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
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

.coluna-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coluna-preview h4 {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.coluna-preview :deep(.preview-frame) {
  height: 500px;
}
</style>
