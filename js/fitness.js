// ================================================
// Função de fitness e utilitários de permutação
// Usados tanto pelos algoritmos quanto pela renderização
// ================================================

/**
 * Calcula o fitness de uma ordem de atendimento.
 *
 * Modelo de serviço sequencial:
 *   A variável `time` representa o instante em que o atendente fica disponível.
 *   Cada paciente começa a ser atendido em max(time, p.arrival):
 *     - Se a fila estiver ociosa (time < p.arrival), o paciente é atendido imediatamente ao chegar.
 *     - Se a fila estiver ocupada (time > p.arrival), o paciente aguarda até o atendente terminar.
 *   Após o atendimento, time avança em p.duration.
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

  let time = 0;            // instante em que o atendente fica livre
  let totalWeightedWait = 0;
  let totalWait = 0;

  for (const idx of order) {
    const p = patients[idx];

    // O atendimento começa no máximo entre o fim do paciente anterior e a chegada deste
    const startTime = Math.max(time, p.arrival);

    // Espera = diferença entre início do atendimento e chegada (sempre ≥ 0)
    const wait = startTime - p.arrival;

    // Peso da urgência amplifica a penalidade proporcional à prioridade clínica
    const w = URGENCY_WEIGHTS[p.urgency];
    totalWeightedWait += wait * w;
    totalWait += wait;

    // Atendente fica livre após a duração do atendimento
    time = startTime + p.duration;
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
