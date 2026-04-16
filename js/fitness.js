// ================================================
// Função de fitness e utilitários de permutação
// Usados tanto pelos algoritmos quanto pela renderização
// ================================================

/**
 * Simula a execução sequencial da fila e retorna os dados de cada slot de atendimento.
 *
 * Esta é a fonte única da lógica de simulação de fila. Tanto fitness() quanto as
 * funções de renderização (renderQueueList, renderGantt) devem usar esta função
 * para garantir consistência: se o modelo mudar, basta alterar aqui.
 *
 * Modelo de serviço sequencial com um único atendente:
 *   `time` representa o instante em que o atendente fica disponível.
 *   Cada paciente começa a ser atendido em max(time, p.arrival):
 *     - Se a fila estiver ociosa (time < p.arrival), o paciente é atendido imediatamente.
 *     - Se a fila estiver ocupada (time > p.arrival), o paciente aguarda.
 *
 * @param {number[]} order - Índices dos pacientes na ordem de atendimento
 * @returns {{ idx: number, p: object, startTime: number, wait: number, end: number }[]}
 */
function computeSchedule(order) {
  let time = 0;
  return order.map(idx => {
    const p = patients[idx];
    const startTime = Math.max(time, p.arrival);
    const wait = startTime - p.arrival;
    time = startTime + p.duration;
    return { idx, p, startTime, wait, end: time };
  });
}

/**
 * Calcula o fitness de uma ordem de atendimento.
 *
 * Score (objetivo a minimizar):
 *   score = Σ wait[i] × URGENCY_WEIGHTS[urgency[i]]
 *   Pacientes mais urgentes recebem peso maior, de modo que a mesma espera de 1 minuto
 *   contribui 30× mais para o score se o paciente for Imediata (urgência 5) do que
 *   Baixa (urgência 1). Isso força os algoritmos a priorizar quem mais precisa.
 *
 * @param {number[]} order - Índices dos pacientes na ordem de atendimento
 * @returns {{ score: number, avgWait: number }}
 *   score   — soma ponderada do tempo de espera (quanto maior, pior; algoritmos minimizam)
 *   avgWait — média simples do tempo de espera em minutos (exibição na interface)
 */
function fitness(order) {
  // Guarda defensivo: evita divisão por zero se order for vazio
  if (order.length === 0) return { score: 0, avgWait: 0 };

  let totalWeightedWait = 0;
  let totalWait = 0;

  for (const { p, wait } of computeSchedule(order)) {
    totalWeightedWait += wait * URGENCY_WEIGHTS[p.urgency];
    totalWait += wait;
  }

  return {
    score: totalWeightedWait,
    avgWait: totalWait / order.length,
  };
}

/**
 * Retorna uma cópia embaralhada do array (Fisher-Yates).
 * Garante distribuição uniforme sobre todas as permutações possíveis.
 *
 * @param {any[]} arr
 * @returns {any[]}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Retorna uma cópia do array com dois índices distintos trocados (swap mutation).
 *
 * Garante que os dois índices sorteados sejam sempre diferentes, assegurando que
 * a mutação produza uma perturbação real na permutação. Sem essa garantia, quando
 * a === b o swap é nulo e a taxa de mutação efetiva é menor que a configurada.
 *
 * @param {any[]} arr - array de origem (não é modificado)
 * @returns {any[]} cópia com dois elementos trocados
 */
function swapMutate(arr) {
  const copy = [...arr];
  const a = Math.floor(Math.random() * copy.length);
  let b;
  do { b = Math.floor(Math.random() * copy.length); } while (b === a);
  [copy[a], copy[b]] = [copy[b], copy[a]];
  return copy;
}
