<script setup>
const props = defineProps({
  tipos: { type: Array, required: true },
  selectedTipo: { type: String, default: null },
  contagens: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['select', 'novo-asset'])
</script>

<template>
  <aside class="sidebar">
    <h2 class="titulo">Asset Vault</h2>

    <nav class="lista-tipos">
      <button
        v-for="tipo in tipos"
        :key="tipo.valor"
        class="item-tipo"
        :class="{ ativo: tipo.valor === selectedTipo }"
        @click="emit('select', tipo.valor)"
      >
        <span>{{ tipo.label }}</span>
        <span class="contagem">{{ contagens[tipo.valor] || 0 }}</span>
      </button>
    </nav>

    <button class="botao-novo" @click="emit('novo-asset')">+ Novo asset</button>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: #1f2430;
  color: #e6e8ec;
}

.titulo {
  font-size: 16px;
  margin: 0 0 16px;
}

.lista-tipos {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.item-tipo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  color: inherit;
  text-align: left;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.item-tipo:hover {
  background: #2c3242;
}

.item-tipo.ativo {
  background: #3b4a6b;
  font-weight: 600;
}

.contagem {
  font-size: 12px;
  opacity: 0.7;
}

.botao-novo {
  margin-top: 16px;
  padding: 10px;
  border: 1px dashed #4a5568;
  background: transparent;
  color: #e6e8ec;
  border-radius: 6px;
}

.botao-novo:hover {
  background: #2c3242;
}
</style>
