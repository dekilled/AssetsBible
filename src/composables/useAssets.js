import { ref } from 'vue'

const STORAGE_KEY = 'asset-vault:assets'

const assets = ref([])
const loading = ref(false)
const error = ref(null)

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToLocalStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // localStorage indisponível, ignora silenciosamente
  }
}

async function fetchAssets() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/assets')
    if (!res.ok) throw new Error('Falha ao buscar assets do servidor')
    const data = await res.json()
    assets.value = data
    saveToLocalStorage(data)
  } catch (err) {
    const cached = loadFromLocalStorage()
    if (cached) {
      assets.value = cached
      error.value = 'Não foi possível falar com o servidor, usando cópia local (localStorage).'
    } else {
      error.value = err.message
    }
  } finally {
    loading.value = false
  }
}

async function persistAssets() {
  saveToLocalStorage(assets.value)
  try {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assets.value, null, 2),
    })
    if (!res.ok) throw new Error('Falha ao salvar no servidor')
  } catch (err) {
    error.value = 'Não foi possível salvar no servidor, alterações ficaram só no localStorage por enquanto.'
  }
}

function upsertAsset(asset) {
  const index = assets.value.findIndex((a) => a.id === asset.id)
  if (index === -1) {
    assets.value.push(asset)
  } else {
    assets.value.splice(index, 1, asset)
  }
  return persistAssets()
}

function removeAsset(id) {
  assets.value = assets.value.filter((a) => a.id !== id)
  return persistAssets()
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useAssets() {
  return {
    assets,
    loading,
    error,
    fetchAssets,
    upsertAsset,
    removeAsset,
    generateId,
  }
}
