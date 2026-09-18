<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAssets } from './composables/useAssets'
import TypeSidebar from './components/TypeSidebar.vue'
import AssetList from './components/AssetList.vue'
import AssetDetail from './components/AssetDetail.vue'
import AssetForm from './components/AssetForm.vue'

const { assets, loading, error, fetchAssets, upsertAsset, removeAsset, generateId } = useAssets()

const tipos = [
  { valor: 'javascript', label: 'JavaScript' },
  { valor: 'vue', label: 'Vue Component' },
  { valor: 'html', label: 'HTML/CSS' },
]

const selectedTipo = ref('javascript')
const selectedAssetId = ref(null)
const modo = ref('detalhe') // 'detalhe' | 'form'
const assetEmEdicao = ref(null)
const assetFormRef = ref(null)

onMounted(fetchAssets)

const assetsDoTipo = computed(() => assets.value.filter((a) => a.tipo === selectedTipo.value))

const contagens = computed(() => {
  const c = {}
  for (const t of tipos) c[t.valor] = assets.value.filter((a) => a.tipo === t.valor).length
  return c
})

const assetSelecionado = computed(() => assets.value.find((a) => a.id === selectedAssetId.value) || null)

const categoriasExistentes = computed(() => {
  const set = new Set(assets.value.map((a) => a.categoria).filter(Boolean))
  return Array.from(set).sort()
})

const colunasGrid = computed(() => (modo.value === 'form' ? '220px 1fr' : '220px 320px 1fr'))

function podeSairDoForm() {
  if (modo.value !== 'form') return true
  return assetFormRef.value?.confirmarDescarteSeNecessario() ?? true
}

function selecionarTipo(tipo) {
  if (!podeSairDoForm()) return
  selectedTipo.value = tipo
  selectedAssetId.value = null
  modo.value = 'detalhe'
}

function selecionarAsset(id) {
  if (!podeSairDoForm()) return
  selectedAssetId.value = id
  modo.value = 'detalhe'
}

function iniciarNovoAsset() {
  if (!podeSairDoForm()) return
  assetEmEdicao.value = null
  modo.value = 'form'
}

function iniciarEdicao(asset) {
  if (!podeSairDoForm()) return
  assetEmEdicao.value = asset
  modo.value = 'form'
}

async function salvarAsset(dados) {
  await upsertAsset(dados)
  selectedTipo.value = dados.tipo
  selectedAssetId.value = dados.id
  modo.value = 'detalhe'
}

async function excluirAsset(asset) {
  if (!confirm(`Excluir o asset "${asset.nome}"?`)) return
  await removeAsset(asset.id)
  if (selectedAssetId.value === asset.id) selectedAssetId.value = null
  modo.value = 'detalhe'
}

function cancelarForm() {
  modo.value = 'detalhe'
}
</script>

<template>
  <div class="layout">
    <TypeSidebar
      :tipos="tipos"
      :selected-tipo="selectedTipo"
      :contagens="contagens"
      @select="selecionarTipo"
      @novo-asset="iniciarNovoAsset"
    />

    <AssetList
      v-if="modo !== 'form'"
      :assets="assetsDoTipo"
      :selected-id="selectedAssetId"
      @select="selecionarAsset"
      @novo-asset="iniciarNovoAsset"
    />

    <main class="coluna-direita">
      <p v-if="error" class="aviso">{{ error }}</p>
      <p v-if="loading" class="aviso">Carregando assets...</p>

      <div class="conteudo">
        <AssetForm
          v-if="modo === 'form'"
          ref="assetFormRef"
          :asset="assetEmEdicao"
          :categorias-existentes="categoriasExistentes"
          :novo-id="generateId"
          @salvar="salvarAsset"
          @cancelar="cancelarForm"
        />
        <AssetDetail v-else :asset="assetSelecionado" @editar="iniciarEdicao" @excluir="excluirAsset" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: v-bind(colunasGrid);
  height: 100vh;
}

.coluna-direita {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.aviso {
  margin: 8px 16px 0;
  padding: 8px 12px;
  background: #fff3cd;
  color: #7a5b00;
  border-radius: 6px;
  font-size: 13px;
}

.conteudo {
  flex: 1;
  overflow: hidden;
}
</style>
