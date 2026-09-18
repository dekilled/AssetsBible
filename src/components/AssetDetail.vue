<script setup>
import { ref, computed, watch } from 'vue'
import PreviewFrame from './PreviewFrame.vue'
import CodeBlock from './CodeBlock.vue'

const props = defineProps({
  asset: { type: Object, default: null },
})

const emit = defineEmits(['editar', 'excluir'])

const abaAtiva = ref('sobre')

watch(
  () => props.asset?.id,
  () => {
    abaAtiva.value = 'sobre'
  }
)

const linguagem = computed(() => (props.asset?.tipo === 'vue' ? 'javascript' : 'markup'))
</script>

<template>
  <section class="detalhe">
    <p v-if="!asset" class="vazio">Selecione um asset na lista ao lado para ver os detalhes.</p>

    <template v-else>
      <header class="cabecalho">
        <h2>{{ asset.nome }}</h2>
        <div class="acoes">
          <button @click="emit('editar', asset)">Editar</button>
          <button class="perigo" @click="emit('excluir', asset)">Excluir</button>
        </div>
      </header>

      <nav class="abas">
        <button :class="{ ativa: abaAtiva === 'sobre' }" @click="abaAtiva = 'sobre'">Sobre</button>
        <button :class="{ ativa: abaAtiva === 'codigo' }" @click="abaAtiva = 'codigo'">Código</button>
        <button :class="{ ativa: abaAtiva === 'preview' }" @click="abaAtiva = 'preview'">Preview</button>
      </nav>

      <div class="conteudo-aba">
        <div v-show="abaAtiva === 'sobre'" class="aba-sobre">
          <p><strong>Categoria:</strong> {{ asset.categoria }}</p>
          <p>{{ asset.descricao }}</p>
          <div class="tags">
            <span v-for="tag in asset.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <div v-if="asset.variacoes?.length" class="variacoes">
            <h4>Variações</h4>
            <details v-for="(v, i) in asset.variacoes" :key="i">
              <summary>{{ v.nome }}</summary>
              <CodeBlock :codigo="v.codigo" :language="linguagem" />
            </details>
          </div>
        </div>

        <div v-show="abaAtiva === 'codigo'" class="aba-codigo">
          <CodeBlock :codigo="asset.codigo" :language="linguagem" />
        </div>

        <div v-show="abaAtiva === 'preview'" class="aba-preview">
          <PreviewFrame :tipo="asset.tipo" :codigo="asset.codigo" />
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.detalhe {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #fbfbfc;
  box-sizing: border-box;
}

.vazio {
  color: #888;
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
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
  padding: 6px 12px;
  font-size: 13px;
}

.acoes .perigo {
  border-color: #f2c2c2;
  color: #c0392b;
}

.abas {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e2e4e9;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.abas button {
  background: transparent;
  border: none;
  padding: 8px 14px;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.abas button.ativa {
  color: #1f2430;
  border-bottom-color: #3b4a6b;
  font-weight: 600;
}

.conteudo-aba {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag {
  background: #e7ecff;
  color: #33436e;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
}

.aba-sobre {
  overflow-y: auto;
}

.variacoes {
  margin-top: 16px;
}

.variacoes details {
  margin-bottom: 10px;
}

.variacoes summary {
  cursor: pointer;
  font-size: 13px;
  color: #444;
  margin-bottom: 6px;
}

.aba-codigo {
  flex: 1;
  min-height: 0;
  display: flex;
}

.aba-codigo :deep(.code-block) {
  flex: 1;
}

.aba-preview {
  flex: 1;
  min-height: 0;
  display: flex;
}

.aba-preview :deep(.preview-frame) {
  flex: 1;
}
</style>
