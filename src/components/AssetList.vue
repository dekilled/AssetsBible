<script setup>
import { computed } from 'vue'

const props = defineProps({
  assets: { type: Array, required: true },
  selectedId: { type: String, default: null },
})

const emit = defineEmits(['select', 'novo-asset'])

const agrupados = computed(() => {
  const grupos = {}
  for (const asset of props.assets) {
    const categoria = asset.categoria || 'Sem categoria'
    if (!grupos[categoria]) grupos[categoria] = []
    grupos[categoria].push(asset)
  }
  return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b))
})
</script>

<template>
  <section class="lista">
    <header class="cabecalho">
      <h3>Assets</h3>
      <button class="botao-novo" @click="emit('novo-asset')">+ Novo</button>
    </header>

    <p v-if="assets.length === 0" class="vazio">Nenhum asset encontrado para este tipo.</p>

    <div v-for="[categoria, itens] in agrupados" :key="categoria" class="grupo">
      <h4 class="nome-categoria">{{ categoria }}</h4>
      <button
        v-for="asset in itens"
        :key="asset.id"
        class="item-asset"
        :class="{ ativo: asset.id === selectedId }"
        @click="emit('select', asset.id)"
      >
        <strong>{{ asset.nome }}</strong>
        <span class="descricao">{{ asset.descricao }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.lista {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #fff;
  border-right: 1px solid #e2e4e9;
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cabecalho h3 {
  margin: 0;
  font-size: 15px;
}

.botao-novo {
  border: 1px solid #dcdfe4;
  background: #f6f7f9;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
}

.botao-novo:hover {
  background: #edeff2;
}

.vazio {
  color: #888;
  font-size: 14px;
}

.grupo {
  margin-bottom: 16px;
}

.nome-categoria {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin: 0 0 6px;
}

.item-asset {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 2px;
}

.item-asset:hover {
  background: #f2f3f5;
}

.item-asset.ativo {
  background: #e7ecff;
}

.descricao {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
