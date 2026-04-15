// ================================================
// Baselines determinísticos para comparação
// FCFS: ordem de chegada | Prioridade pura: urgência decrescente
// ================================================

/**
 * Computa a ordenação FCFS (First Come, First Served).
 * Atende os pacientes na ordem em que chegaram, sem priorização.
 * Representa o comportamento natural sem nenhum sistema de triagem.
 *
 * @returns {{ order: number[], score: number, avgWait: number }}
 */
function computeFCFS() {
  const order = patients.map((_, i) => i).sort((a, b) => patients[a].arrival - patients[b].arrival);
  const f = fitness(order);
  return { order, score: f.score, avgWait: f.avgWait };
}

/**
 * Computa a ordenação por prioridade pura.
 * Atende do mais urgente para o menos urgente; em caso de empate, por ordem de chegada.
 * Representa a decisão intuitiva de um enfermeiro sem ferramenta de otimização.
 *
 * @returns {{ order: number[], score: number, avgWait: number }}
 */
function computePriority() {
  const order = patients.map((_, i) => i).sort((a, b) => {
    const urgDiff = patients[b].urgency - patients[a].urgency;
    return urgDiff !== 0 ? urgDiff : patients[a].arrival - patients[b].arrival;
  });
  const f = fitness(order);
  return { order, score: f.score, avgWait: f.avgWait };
}
