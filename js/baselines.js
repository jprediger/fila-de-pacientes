// ================================================
// Baselines determinísticos para comparação
// FCFS: ordem de chegada | Prioridade pura: urgência decrescente
// ================================================
//
// Os baselines servem como pontos de referência para medir o ganho real dos algoritmos:
//   FCFS     → pior caso esperado: sem triagem, atende quem chegou primeiro
//   Priority → referência intermediária: triagem simples por urgência, sem otimização global
//
// Se os algoritmos metaheurísticos (AG/SA) não superam o baseline Priority, algo está errado
// nos parâmetros ou no número de pacientes (com poucos pacientes, a solução ótima pode ser
// idêntica à triagem por urgência).

/**
 * Computa a ordenação FCFS (First Come, First Served).
 *
 * Atende os pacientes na ordem de chegada, sem nenhuma consideração de urgência.
 * É o comportamento natural de uma fila sem sistema de triagem.
 *
 * Por que é o "pior caso"?
 *   Um paciente crítico que chega depois de vários pacientes de baixa urgência ficará
 *   no final da fila, acumulando espera com peso alto no fitness. O score tende a ser
 *   o mais alto entre as quatro estratégias, servindo como teto de referência.
 *
 * @returns {{ order: number[], score: number, avgWait: number }}
 */
function computeFCFS() {
  // Ordena por tempo de chegada crescente; empates mantêm a ordem original (estável em JS)
  const order = patients.map((_, i) => i).sort((a, b) => patients[a].arrival - patients[b].arrival);
  const f = fitness(order);
  return { order, score: f.score, avgWait: f.avgWait };
}

/**
 * Computa a ordenação por prioridade pura.
 *
 * Atende do mais urgente para o menos urgente; em caso de empate de urgência,
 * desempata por ordem de chegada (quem chegou antes atende antes dentro do mesmo nível).
 *
 * Representa a decisão intuitiva de um enfermeiro experiente sem ferramenta de otimização.
 * É melhor que FCFS porque reduz a espera dos pacientes críticos, mas ainda pode ser
 * subótimo: não considera interações entre chegadas e durações que os algoritmos exploram.
 *
 * @returns {{ order: number[], score: number, avgWait: number }}
 */
function computePriority() {
  const order = patients.map((_, i) => i).sort((a, b) => {
    // Urgência decrescente: maior urgência primeiro
    const urgDiff = patients[b].urgency - patients[a].urgency;
    // Empate: chegada crescente (quem chegou antes tem prioridade dentro do mesmo nível)
    return urgDiff !== 0 ? urgDiff : patients[a].arrival - patients[b].arrival;
  });
  const f = fitness(order);
  return { order, score: f.score, avgWait: f.avgWait };
}
