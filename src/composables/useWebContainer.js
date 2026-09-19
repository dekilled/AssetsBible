import { WebContainer } from '@webcontainer/api'

// Só é permitido um WebContainer por aba do navegador — por isso o boot
// fica num singleton de módulo, compartilhado por todas as instâncias de
// PreviewFrame (o boot em si só acontece na primeira vez que um asset do
// tipo "server" é aberto).
let containerPromise = null
function getContainer() {
  if (!containerPromise) {
    containerPromise = WebContainer.boot()
  }
  return containerPromise
}

// Mesmo raciocínio: só um processo de servidor roda por vez (o container é
// compartilhado), então cada nova execução mata a anterior antes de montar
// os arquivos e rodar de novo.
let currentProcess = null

export function stopServer() {
  if (currentProcess) {
    try {
      currentProcess.kill()
    } catch {
      // processo já pode ter morrido sozinho, ignora
    }
    currentProcess = null
  }
}

/**
 * Roda um snippet de código Node.js (server.js) dentro do WebContainer e
 * resolve com a URL real do servidor assim que ele sobe.
 *
 * Convenção de dependências: se a primeira linha do código for um comentário
 * no formato "// deps: pacote1 pacote2", esses pacotes são instalados via
 * npm antes de rodar (ex: "// deps: express" pra usar o framework Express).
 * Sem essa linha, o servidor sobe direto com só os módulos nativos do Node
 * (http, fs, etc), sem esperar npm install.
 *
 * @param {string} codigo — conteúdo do arquivo server.js
 * @param {{onLog?: (chunk: string) => void}} [options]
 * @returns {Promise<{url: string}>}
 */
export async function runServerCode(codigo, { onLog } = {}) {
  const container = await getContainer()

  stopServer()

  const depsMatch = codigo.match(/^\s*\/\/\s*deps:\s*(.+)$/m)
  const deps = depsMatch ? depsMatch[1].trim().split(/\s+/).filter(Boolean) : []

  const packageJson = {
    name: 'asset-preview',
    version: '1.0.0',
    private: true,
    dependencies: Object.fromEntries(deps.map((dep) => [dep, 'latest'])),
  }

  await container.mount({
    'server.js': { file: { contents: codigo } },
    'package.json': { file: { contents: JSON.stringify(packageJson, null, 2) } },
  })

  if (deps.length) {
    onLog?.(`Instalando dependências: ${deps.join(', ')}...\n`)
    const installProcess = await container.spawn('npm', ['install'])
    installProcess.output.pipeTo(new WritableStream({ write: (chunk) => onLog?.(chunk) }))
    const exitCode = await installProcess.exit
    if (exitCode !== 0) {
      throw new Error(`Falha ao instalar dependências (npm install saiu com código ${exitCode}).`)
    }
  }

  onLog?.('Iniciando servidor...\n')
  const runProcess = await container.spawn('node', ['server.js'])
  currentProcess = runProcess
  runProcess.output.pipeTo(new WritableStream({ write: (chunk) => onLog?.(chunk) }))

  const exitedEarly = runProcess.exit.then((code) => {
    throw new Error(`O processo do servidor encerrou sozinho (código ${code}) antes de ficar pronto.`)
  })

  const serverReady = new Promise((resolve) => {
    const unsubscribe = container.on('server-ready', (_port, url) => {
      unsubscribe()
      resolve(url)
    })
  })

  const url = await Promise.race([serverReady, exitedEarly])
  return { url }
}
