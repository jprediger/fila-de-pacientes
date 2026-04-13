// ================================================
// Algoritmo Genético (AG)
// Otimiza a ordem de atendimento por evolução de população
// ================================================

/**
 * Executa o Algoritmo Genético com os parâmetros fornecidos.
 *
 * @param {{ popSize, generations, mutRate, crossRate, eliteRatio }} params
 * @returns {{ best: { ind: number[], avgWait: number }, historyBest: number[], historyAvg: number[] }}
 */
function runGA(params) {
  const n = patients.length;
  const base = Array.from({ length: n }, (_, i) => i);
  const popSize = params.popSize;
  const generations = params.generations;
  const mutRate = params.mutRate;
  const crossRate = params.crossRate;
  const eliteCount = Math.max(1, Math.floor(popSize * params.eliteRatio));

  let population = Array.from({ length: popSize }, () => shuffle(base));
  const historyBest = [];
  const historyAvg = [];
  let globalBest = null;
  let globalBestScore = Infinity;

  for (let gen = 0; gen < generations; gen++) {
    // Avalia e ordena a população pelo fitness (menor = melhor)
    const evaluated = population.map(ind => {
      const f = fitness(ind);
      return { ind, score: f.score, avgWait: f.avgWait };
    }).sort((a, b) => a.score - b.score);

    if (evaluated[0].score < globalBestScore) {
      globalBestScore = evaluated[0].score;
      globalBest = { ind: evaluated[0].ind, avgWait: evaluated[0].avgWait };
    }

    const avg = evaluated.reduce((s, e) => s + e.score, 0) / evaluated.length;
    historyBest.push(globalBestScore);
    historyAvg.push(avg);

    // Elitismo: preserva os melhores indivíduos diretamente
    const newPop = evaluated.slice(0, eliteCount).map(e => [...e.ind]);

    // Crossover + preenchimento do restante da população
    while (newPop.length < popSize) {
      const p1 = tournamentSelect(evaluated);
      if (Math.random() < crossRate) {
        const p2 = tournamentSelect(evaluated);
        newPop.push(oxCrossover(p1, p2));
      } else {
        newPop.push([...p1]);
      }
    }

    // Mutação por troca de posições (swap), exceto elite
    for (let i = eliteCount; i < newPop.length; i++) {
      if (Math.random() < mutRate) {
        const a = Math.floor(Math.random() * n);
        const b = Math.floor(Math.random() * n);
        [newPop[i][a], newPop[i][b]] = [newPop[i][b], newPop[i][a]];
      }
    }
    population = newPop;
  }

  return { best: globalBest, historyBest, historyAvg };
}

/**
 * Seleção por torneio: escolhe o melhor entre k candidatos aleatórios.
 *
 * @param {{ ind: number[], score: number }[]} evaluated
 * @returns {number[]} cópia do indivíduo vencedor
 */
function tournamentSelect(evaluated) {
  const k = 3;
  let best = null;
  for (let i = 0; i < k; i++) {
    const cand = evaluated[Math.floor(Math.random() * evaluated.length)];
    if (!best || cand.score < best.score) best = cand;
  }
  return [...best.ind];
}

/**
 * Crossover OX (Order Crossover): preserva um segmento de p1
 * e preenche o restante com os genes de p2 na ordem original.
 *
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number[]} filho gerado
 */
function oxCrossover(p1, p2) {
  const n = p1.length;
  const start = Math.floor(Math.random() * n);
  const end = start + Math.floor(Math.random() * (n - start)) + 1;
  const child = new Array(n).fill(-1);
  for (let i = start; i < end; i++) child[i] = p1[i];
  let pos = end % n;
  for (let i = 0; i < n; i++) {
    const gene = p2[(end + i) % n];
    if (!child.includes(gene)) {
      child[pos] = gene;
      pos = (pos + 1) % n;
    }
  }
  return child;
}
