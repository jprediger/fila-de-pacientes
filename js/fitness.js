// ================================================
// Função de fitness e utilitários de permutação
// Usados tanto pelos algoritmos quanto pela renderização
// ================================================

/**
 * Calcula o fitness de uma ordem de atendimento.
 * Retorna a soma ponderada do tempo de espera (quanto maior, pior)
 * e a média simples de espera em minutos.
 *
 * @param {number[]} order - Índices dos pacientes na ordem de atendimento
 * @returns {{ score: number, avgWait: number }}
 */
function fitness(order) {
  let time = 0;
  let totalWeightedWait = 0;
  let totalWait = 0;
  for (const idx of order) {
    const p = patients[idx];
    const startTime = Math.max(time, p.arrival);
    const wait = startTime - p.arrival;
    const w = URGENCY_WEIGHTS[p.urgency];
    totalWeightedWait += wait * w;
    totalWait += wait;
    time = startTime + p.duration;
  }
  return { score: totalWeightedWait, avgWait: totalWait / order.length };
}

/**
 * Retorna uma cópia embaralhada do array (Fisher-Yates).
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
