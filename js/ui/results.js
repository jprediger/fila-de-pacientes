// ================================================
// Renderização dos resultados na aba "Resultados"
// Inclui: métricas, filas otimizadas e tabela comparativa
// ================================================

/**
 * Alterna a tab ativa no painel de resultados.
 * Re-renderiza o Gantt da tab ao torná-la visível, pois clientWidth era 0 quando oculta.
 * @param {string} name - 'comparacao', 'ag' ou 'sa'
 */
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-btn-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');

  // Re-renderiza o Gantt após o painel ficar visível para obter clientWidth correto
  if (name === 'ag' && typeof agResult !== 'undefined' && agResult) {
    requestAnimationFrame(() => renderGantt('ag-gantt', agResult.best.ind, '#5c6bc0'));
  } else if (name === 'sa' && typeof saResult !== 'undefined' && saResult) {
    requestAnimationFrame(() => renderGantt('sa-gantt', saResult.best.ind, '#ef6c00'));
  }
}

/**
 * Atualiza todos os elementos visuais de resultados após a execução dos algoritmos.
 *
 * @param {string} agTime        - tempo de execução do AG em segundos (string formatada)
 * @param {string} saTime        - tempo de execução do SA em segundos (string formatada)
 * @param {{ score, avgWait }} fcfsResult     - resultado do baseline FCFS
 * @param {{ score, avgWait }} priorityResult - resultado do baseline Prioridade pura
 */
function renderResults(agTime, saTime, fcfsResult, priorityResult) {
  const agF = fitness(agResult.best.ind);
  const saF = fitness(saResult.best.ind);

  // Baselines
  document.getElementById('m-fcfs-fitness').textContent = fcfsResult.score.toFixed(1);
  document.getElementById('m-fcfs-wait').textContent = fcfsResult.avgWait.toFixed(1);
  document.getElementById('m-priority-fitness').textContent = priorityResult.score.toFixed(1);
  document.getElementById('m-priority-wait').textContent = priorityResult.avgWait.toFixed(1);

  // Métricas na tab Comparação
  document.getElementById('m-ag-fitness').textContent = agF.score.toFixed(1);
  document.getElementById('m-ag-wait').textContent = agF.avgWait.toFixed(1);
  document.getElementById('m-sa-fitness').textContent = saF.score.toFixed(1);
  document.getElementById('m-sa-wait').textContent = saF.avgWait.toFixed(1);

  // Métricas nas tabs individuais
  document.getElementById('m-ag-fitness-tab').textContent = agF.score.toFixed(1);
  document.getElementById('m-ag-wait-tab').textContent = agF.avgWait.toFixed(1);
  document.getElementById('m-sa-fitness-tab').textContent = saF.score.toFixed(1);
  document.getElementById('m-sa-wait-tab').textContent = saF.avgWait.toFixed(1);

  document.getElementById('ag-exec-info').textContent = `Tempo de execução: ${agTime}s`;
  document.getElementById('sa-exec-info').textContent = `Tempo de execução: ${saTime}s`;

  // Tabelas com a ordem otimizada de cada algoritmo
  renderQueueList('ag-queue-result', agResult.best.ind, 'ag');
  renderQueueList('sa-queue-result', saResult.best.ind, 'sa');

  renderComparisonTable(agF, saF, agTime, saTime, fcfsResult);

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
  el.innerHTML = `<table><thead><tr><th>#</th><th>Paciente</th><th data-tooltip="Nível de prioridade clínica. Pesos no fitness: Baixa 1×, Média 3×, Alta 7×, Crítica 15×, Imediata 30×.">Urgência</th><th data-tooltip="Horário em que o paciente chegou à fila (minutos a partir do início).">Chegada</th><th data-tooltip="Horário em que o atendimento começa. Nunca antes da chegada do paciente.">Início</th><th data-tooltip="Tempo entre chegada e início do atendimento. Zero = atendido imediatamente.">Espera</th></tr></thead><tbody>` +
    order.map((idx, pos) => {
      const p = patients[idx];
      const startTime = Math.max(time, p.arrival);
      const wait = startTime - p.arrival;
      time = startTime + p.duration;
      return `<tr>
        <td>${pos + 1}</td>
        <td>${p.name}</td>
        <td><span style="background:${URGENCY_COLORS[p.urgency]};color:#fff;padding:2px 7px;border-radius:10px;font-size:11px" data-tooltip="Peso no fitness: ${URGENCY_WEIGHTS[p.urgency]}×">${URGENCY_LABELS[p.urgency]}</span></td>
        <td>${p.arrival}min</td>
        <td>${startTime}min</td>
        <td>${wait}min</td>
      </tr>`;
    }).join('') + '</tbody></table>';
}

/**
 * Renderiza a tabela de comparação de métricas entre AG e SA.
 * Destaca o vencedor em cada métrica e exibe a melhoria percentual vs FCFS.
 *
 * @param {{ score: number, avgWait: number }} agF
 * @param {{ score: number, avgWait: number }} saF
 * @param {string} agTime
 * @param {string} saTime
 * @param {{ score: number, avgWait: number }} fcfsF
 */
function renderComparisonTable(agF, saF, agTime, saTime, fcfsF) {
  const agImprovement = fcfsF.score > 0
    ? ((fcfsF.score - agF.score) / fcfsF.score * 100).toFixed(1) + '%'
    : '—';
  const saImprovement = fcfsF.score > 0
    ? ((fcfsF.score - saF.score) / fcfsF.score * 100).toFixed(1) + '%'
    : '—';

  const rows = [
    ['Fitness (menor = melhor)', agF.score.toFixed(1), saF.score.toFixed(1), agF.score < saF.score ? 'AG' : 'SA',
     'Soma do tempo de espera de cada paciente multiplicado pelo peso de sua urgência. Menor = melhor.'],
    ['Espera média (min)', agF.avgWait.toFixed(1), saF.avgWait.toFixed(1), agF.avgWait < saF.avgWait ? 'AG' : 'SA',
     'Média simples do tempo de espera em minutos, sem ponderação por urgência.'],
    ['Tempo de execução (s)', agTime, saTime, parseFloat(agTime) < parseFloat(saTime) ? 'AG' : 'SA',
     'Tempo de CPU para executar o algoritmo, excluindo a renderização da interface.'],
    ['Melhoria vs FCFS (%)', agImprovement, saImprovement, parseFloat(agImprovement) > parseFloat(saImprovement) ? 'AG' : 'SA',
     'Redução percentual do fitness em relação à fila por ordem de chegada (FCFS). Maior = melhor — indica quanto o algoritmo superou a fila sem otimização.'],
  ];
  document.getElementById('comparison-table').innerHTML = rows.map(r => {
    const win = r[3];
    return `<tr>
      <td data-tooltip="${r[4]}">${r[0]}</td>
      <td style="color:#5c6bc0;font-weight:${win==='AG'?'700':'400'}">${r[1]}</td>
      <td style="color:#ef6c00;font-weight:${win==='SA'?'700':'400'}">${r[2]}</td>
      <td><span class="badge ${win==='AG'?'badge-purple':'badge-orange'}">${win}</span></td>
    </tr>`;
  }).join('');
}
