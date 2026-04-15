// ================================================
// Simulated Annealing (SA)
// Otimiza a ordem de atendimento por resfriamento simulado
// ================================================

/**
 * Executa o Simulated Annealing com os parâmetros fornecidos.
 *
 * Funcionamento geral:
 *   O SA mantém uma solução corrente `current` e, a cada iteração, gera um vizinho
 *   por troca (swap) de dois pacientes na ordem. O vizinho é aceito sempre que melhora
 *   o fitness; pioras são aceitas com probabilidade exp(-Δ/T), controlada pela temperatura.
 *
 *   Por isso, `current` pode se afastar temporariamente de soluções boas — isso permite
 *   escapar de ótimos locais. Por isso `best` é rastreado separadamente: registra a melhor
 *   solução encontrada em qualquer ponto da busca, independentemente de onde `current` está.
 *
 * Critério de Metropolis — por que aceitar pioras:
 *   delta = fitness(vizinho) - fitness(current)
 *   P(aceitar piora) = exp(-delta / T)
 *   - T alto (início): exp(-delta/T) ≈ 1 → aceita quase qualquer piora → exploração ampla
 *   - T baixo (fim):   exp(-delta/T) ≈ 0 → rejeita pioras grandes → refinamento local
 *   - delta pequeno:   probabilidade maior → pioras suaves são mais toleradas
 *   - delta grande:    probabilidade menor → pioras drásticas são quase sempre rejeitadas
 *
 * Resfriamento geométrico:
 *   temp *= coolRate  (coolRate ∈ [0.90, 0.999])
 *   A temperatura decresce de forma multiplicativa (não linear), o que dá mais tempo
 *   de exploração nas altas temperaturas e refinamento suave nas baixas. Teoricamente,
 *   resfriamento suficientemente lento garante convergência ao ótimo global.
 *
 * Efeito dos parâmetros:
 *   tempInit ↑   → aceita mais pioras no início → exploração mais ampla
 *   tempMin  ↓   → busca termina mais tarde → mais refinamento
 *   coolRate ↑   → resfria mais devagar → mais iterações totais, mais qualidade
 *   iterPerTemp ↑ → mais swaps por nível de temperatura → busca mais densa
 *
 * @param {{ tempInit, tempMin, coolRate, iterPerTemp }} params
 * @returns {{ best: { ind: number[], avgWait: number }, historyBest: number[], historyTemp: number[] }}
 */
function runSA(params) {
  const n = patients.length;

  // Solução inicial aleatória: permutação dos índices dos pacientes
  let current = shuffle(Array.from({ length: n }, (_, i) => i));
  let currentScore = fitness(current).score;

  // `best` guarda a melhor solução vista; `current` pode piorar a qualquer momento
  let best = [...current];
  let bestScore = currentScore;
  let bestAvgWait = fitness(current).avgWait;

  let temp = params.tempInit;
  const tempMin = params.tempMin;
  const coolRate = params.coolRate;    // fator multiplicativo de resfriamento (< 1)
  const iterPerTemp = params.iterPerTemp;

  const historyBest = [];  // melhor fitness por nível de temperatura (para o gráfico)
  const historyTemp = [];  // temperatura em cada nível (para o gráfico)

  // Loop principal: resfria geometricamente até atingir temperatura mínima
  while (temp > tempMin) {
    for (let i = 0; i < iterPerTemp; i++) {
      // Gera vizinho por troca de duas posições aleatórias (swap mutation)
      // O swap é a menor perturbação possível em uma permutação: troca exatamente 2 pacientes
      const neighbor = [...current];
      const a = Math.floor(Math.random() * n);
      const b = Math.floor(Math.random() * n);
      [neighbor[a], neighbor[b]] = [neighbor[b], neighbor[a]];

      // Calcula fitness do vizinho de uma vez; reutiliza .avgWait se aceitar como best
      const nf = fitness(neighbor);
      const delta = nf.score - currentScore;

      // Critério de Metropolis: melhora sempre aceita; piora aceita com P = exp(-δ/T)
      if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
        current = neighbor;
        currentScore = nf.score;

        // Atualiza best somente se esta solução for a melhor até agora
        if (currentScore < bestScore) {
          bestScore = currentScore;
          best = [...current];
          bestAvgWait = nf.avgWait; // reutiliza o cálculo já feito acima
        }
      }
    }

    // Registra histórico ao final de cada nível de temperatura
    historyBest.push(bestScore);
    historyTemp.push(temp);

    // Resfriamento geométrico: temperatura decai exponencialmente
    temp *= coolRate;
  }

  return { best: { ind: best, avgWait: bestAvgWait }, historyBest, historyTemp };
}
