// ================================================
// Algoritmo Genético (AG)
// Otimiza a ordem de atendimento por evolução de população
// ================================================

/**
 * Executa o Algoritmo Genético com os parâmetros fornecidos.
 *
 * Funcionamento geral:
 *   Mantém uma população de `popSize` permutações dos pacientes (indivíduos).
 *   A cada geração, avalia o fitness de todos, seleciona os melhores para reprodução
 *   (crossover + mutação) e forma a nova geração. O processo repete por `generations` ciclos.
 *
 * Efeito dos parâmetros:
 *   popSize ↑    → mais diversidade genética → melhor qualidade final, execução mais lenta
 *   generations ↑ → mais refinamento → melhora gradual, retornos decrescentes após convergência
 *   mutRate ↑    → mais exploração → evita convergência prematura, mas dificulta refinamento
 *   crossRate ↑  → mais recombinação → converge mais rápido para boas soluções
 *   eliteRatio ↑ → preserva mais soluções boas → convergência mais segura, menos diversidade
 *
 * @param {{ popSize, generations, mutRate, crossRate, eliteRatio }} params
 * @returns {{ best: { ind: number[], avgWait: number }, historyBest: number[], historyAvg: number[] }}
 */
function runGA(params) {
  const n = patients.length;
  const base = Array.from({ length: n }, (_, i) => i);  // [0, 1, ..., n-1]
  const popSize = params.popSize;
  const generations = params.generations;
  const mutRate = params.mutRate;
  const crossRate = params.crossRate;

  // Número mínimo de 1 elite para garantir que o melhor nunca seja perdido
  const eliteCount = Math.max(1, Math.floor(popSize * params.eliteRatio));

  // Inicializa população com permutações aleatórias
  let population = Array.from({ length: popSize }, () => shuffle(base));

  const historyBest = [];  // melhor fitness por geração (para o gráfico)
  const historyAvg = [];   // fitness médio da população por geração

  let globalBest = null;
  let globalBestScore = Infinity;

  for (let gen = 0; gen < generations; gen++) {
    // ---- Avaliação ----
    // Calcula o fitness de cada indivíduo e ordena do melhor (menor) para o pior
    const evaluated = population.map(ind => {
      const f = fitness(ind);
      return { ind, score: f.score, avgWait: f.avgWait };
    }).sort((a, b) => a.score - b.score);

    // Atualiza o melhor global (pode melhorar a qualquer geração)
    if (evaluated[0].score < globalBestScore) {
      globalBestScore = evaluated[0].score;
      globalBest = { ind: evaluated[0].ind, avgWait: evaluated[0].avgWait };
    }

    // Registra histórico para o gráfico de evolução
    const avg = evaluated.reduce((s, e) => s + e.score, 0) / evaluated.length;
    historyBest.push(globalBestScore);
    historyAvg.push(avg);

    // ---- Elitismo ----
    // Copia os `eliteCount` melhores diretamente para a próxima geração, sem alteração.
    // Isso garante que boas soluções nunca sejam perdidas por crossover ou mutação ruim.
    const newPop = evaluated.slice(0, eliteCount).map(e => [...e.ind]);

    // ---- Crossover ----
    // Preenche o restante da população por seleção + crossover (ou cópia direta)
    while (newPop.length < popSize) {
      // Seleção por torneio: escolhe um pai entre k=3 candidatos aleatórios
      const p1 = tournamentSelect(evaluated);

      if (Math.random() < crossRate) {
        // Crossover OX com um segundo pai selecionado independentemente
        const p2 = tournamentSelect(evaluated);
        newPop.push(oxCrossover(p1, p2));
      } else {
        // Sem crossover: o filho é cópia direta do pai (reprodução assexuada)
        newPop.push([...p1]);
      }
    }

    // ---- Mutação ----
    // Aplica swap mutation a cada indivíduo não-elite com probabilidade mutRate.
    // O swap troca exatamente dois pacientes de posição — perturbação mínima que
    // mantém a permutação válida e introduz diversidade para escapar de ótimos locais.
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
 * Seleção por torneio: escolhe o melhor entre k=3 candidatos sorteados aleatoriamente.
 *
 * Por que torneio e não roleta (roulette wheel)?
 *   A roleta pondera pela diferença absoluta de fitness; quando os scores são próximos
 *   (população convergida), todos têm probabilidade similar e a seleção perde pressão.
 *   O torneio compara apenas quem é melhor entre os k sorteados, independente da magnitude
 *   — mantém pressão seletiva consistente em qualquer estágio da evolução.
 *
 * k=3 é um equilíbrio: aumentar k aumenta a pressão seletiva (converge mais rápido
 * mas perde diversidade); diminuir k deixa a seleção mais aleatória (mais exploração).
 *
 * @param {{ ind: number[], score: number }[]} evaluated - população avaliada e ordenada
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
 * Crossover OX (Order Crossover): gera um filho combinando dois pais de forma
 * que nenhum paciente seja repetido ou omitido (permutação válida garantida).
 *
 * Como funciona:
 *   1. Sorteia um segmento [start, end) de p1 e copia direto para o filho.
 *   2. Percorre p2 a partir de `end` (em ordem circular); para cada gene de p2
 *      que ainda não esteja no filho, insere na próxima posição livre.
 *   Resultado: o segmento de p1 é preservado intacto (mantém sub-rotas boas);
 *   o restante vem de p2 na ordem relativa original (mantém outra estrutura boa).
 *
 * Por que `end = start + rand(n - start) + 1`?
 *   - `rand(n - start)` ∈ [0, n-start-1] → `+1` garante comprimento mínimo 1
 *   - `start + (n - start)` = n → fim máximo é n (não ultrapassa o array)
 *   Portanto o segmento sempre tem comprimento ∈ [1, n-start], nunca vazio ou fora dos limites.
 *
 * @param {number[]} p1 - pai 1
 * @param {number[]} p2 - pai 2
 * @returns {number[]} filho gerado
 */
function oxCrossover(p1, p2) {
  const n = p1.length;
  const start = Math.floor(Math.random() * n);
  const end = start + Math.floor(Math.random() * (n - start)) + 1;

  // Filho inicializado com -1 (posições ainda não preenchidas)
  const child = new Array(n).fill(-1);

  // Copia o segmento de p1 integralmente
  for (let i = start; i < end; i++) child[i] = p1[i];

  // Preenche o restante com genes de p2 em ordem circular a partir de `end`
  let pos = end % n;  // próxima posição livre no filho
  for (let i = 0; i < n; i++) {
    const gene = p2[(end + i) % n];
    if (!child.includes(gene)) {  // só insere se ainda não está no filho
      child[pos] = gene;
      pos = (pos + 1) % n;
    }
  }

  return child;
}
