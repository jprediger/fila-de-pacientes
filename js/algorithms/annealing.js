// ================================================
// Simulated Annealing (SA)
// Otimiza a ordem de atendimento por resfriamento simulado
// ================================================

/**
 * Executa o Simulated Annealing com os parâmetros fornecidos.
 *
 * @param {{ tempInit, tempMin, coolRate, iterPerTemp }} params
 * @returns {{ best: { ind: number[], avgWait: number }, historyBest: number[], historyTemp: number[] }}
 */
function runSA(params) {
  const n = patients.length;
  let current = shuffle(Array.from({ length: n }, (_, i) => i));
  let currentScore = fitness(current).score;
  let best = [...current];
  let bestScore = currentScore;
  let bestAvgWait = fitness(current).avgWait;

  let temp = params.tempInit;
  const tempMin = params.tempMin;
  const coolRate = params.coolRate;
  const iterPerTemp = params.iterPerTemp;

  const historyBest = [];
  const historyTemp = [];

  // Loop principal: resfria até atingir temperatura mínima
  while (temp > tempMin) {
    for (let i = 0; i < iterPerTemp; i++) {
      // Gera vizinho por troca de duas posições aleatórias
      const neighbor = [...current];
      const a = Math.floor(Math.random() * n);
      const b = Math.floor(Math.random() * n);
      [neighbor[a], neighbor[b]] = [neighbor[b], neighbor[a]];

      const neighborScore = fitness(neighbor).score;
      const delta = neighborScore - currentScore;

      // Aceita melhora sempre; aceita piora com probabilidade exp(-delta/T)
      if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
        current = neighbor;
        currentScore = neighborScore;
        if (currentScore < bestScore) {
          bestScore = currentScore;
          best = [...current];
          bestAvgWait = fitness(current).avgWait;
        }
      }
    }
    historyBest.push(bestScore);
    historyTemp.push(temp);
    temp *= coolRate;
  }

  return { best: { ind: best, avgWait: bestAvgWait }, historyBest, historyTemp };
}
