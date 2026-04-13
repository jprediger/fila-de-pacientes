// ================================================
// Renderização dos resultados na aba "Resultados"
// Inclui: métricas, filas otimizadas e tabela comparativa
// ================================================

/**
 * Atualiza todos os elementos visuais de resultados após a execução dos algoritmos.
 *
 * @param {string} agTime - tempo de execução do AG em segundos (string formatada)
 * @param {string} saTime - tempo de execução do SA em segundos (string formatada)
 */
function renderResults(agTime, saTime) {
  const agF = fitness(agResult.best.ind);
  const saF = fitness(saResult.best.ind);

  // Métricas resumidas no topo
  document.getElementById('m-ag-fitness').textContent = agF.score.toFixed(1);
  document.getElementById('m-ag-wait').textContent = agF.avgWait.toFixed(1);
  document.getElementById('m-sa-fitness').textContent = saF.score.toFixed(1);
  document.getElementById('m-sa-wait').textContent = saF.avgWait.toFixed(1);

  document.getElementById('ag-exec-info').textContent = `Tempo de execução: ${agTime}s`;
  document.getElementById('sa-exec-info').textContent = `Tempo de execução: ${saTime}s`;

  // Tabelas com a ordem otimizada de cada algoritmo
  renderQueueList('ag-queue-result', agResult.best.ind, 'ag');
  renderQueueList('sa-queue-result', saResult.best.ind, 'sa');

  renderComparisonTable(agF, saF, agTime, saTime);

  // Gráficos de evolução e Gantt
  renderEvolutionChart('ag-chart', agResult.historyBest, agResult.historyAvg, '#5c6bc0', '#b39ddb');
  renderEvolutionChart('sa-chart', saResult.historyBest, null, '#ef6c00', null);
  renderGantt('ag-gantt', agResult.best.ind, '#5c6bc0');
  renderGantt('sa-gantt', saResult.best.ind, '#ef6c00');
}

/**
 * Renderiza a tabela com a fila otimizada de um algoritmo.
 * Colunas: posição, paciente, urgência, chegada, início, espera.
 *
 * @param {string}   elId   - id do elemento container
 * @param {number[]} order  - índices dos pacientes na ordem otimizada
 * @param {string}   prefix - prefixo identificador do algoritmo ('ag' ou 'sa')
 */
function renderQueueList(elId, order, prefix) {
  const el = document.getElementById(elId);
  let time = 0;
  el.innerHTML = `<table><thead><tr><th>#</th><th>Paciente</th><th>Urgência</th><th>Chegada</th><th>Início</th><th>Espera</th></tr></thead><tbody>` +
    order.map((idx, pos) => {
      const p = patients[idx];
      const startTime = Math.max(time, p.arrival);
      const wait = startTime - p.arrival;
      time = startTime + p.duration;
      return `<tr>
        <td>${pos + 1}</td>
        <td>${p.name}</td>
        <td><span style="background:${URGENCY_COLORS[p.urgency]};color:#fff;padding:2px 7px;border-radius:10px;font-size:11px">${URGENCY_LABELS[p.urgency]}</span></td>
        <td>${p.arrival}min</td>
        <td>${startTime}min</td>
        <td>${wait}min</td>
      </tr>`;
    }).join('') + '</tbody></table>';
}

/**
 * Renderiza a tabela de comparação de métricas entre AG e SA.
 * Destaca o vencedor em cada métrica.
 *
 * @param {{ score: number, avgWait: number }} agF
 * @param {{ score: number, avgWait: number }} saF
 * @param {string} agTime
 * @param {string} saTime
 */
function renderComparisonTable(agF, saF, agTime, saTime) {
  const rows = [
    ['Fitness (menor = melhor)', agF.score.toFixed(1), saF.score.toFixed(1), agF.score < saF.score ? 'AG' : 'SA'],
    ['Espera média (min)', agF.avgWait.toFixed(1), saF.avgWait.toFixed(1), agF.avgWait < saF.avgWait ? 'AG' : 'SA'],
    ['Tempo de execução (s)', agTime, saTime, parseFloat(agTime) < parseFloat(saTime) ? 'AG' : 'SA'],
  ];
  document.getElementById('comparison-table').innerHTML = rows.map(r => {
    const win = r[3];
    return `<tr>
      <td>${r[0]}</td>
      <td style="color:#5c6bc0;font-weight:${win==='AG'?'700':'400'}">${r[1]}</td>
      <td style="color:#ef6c00;font-weight:${win==='SA'?'700':'400'}">${r[2]}</td>
      <td><span class="badge ${win==='AG'?'badge-purple':'badge-orange'}">${win}</span></td>
    </tr>`;
  }).join('');
}
