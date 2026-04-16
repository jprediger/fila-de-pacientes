// ================================================
// Orquestrador principal
// Execução manual — roda os algoritmos apenas quando o usuário clicar em "Executar"
// ================================================

/**
 * Executa os algoritmos AG e SA com os pacientes e parâmetros atuais.
 * Deve ser chamada apenas pelo botão "Executar" na interface.
 */
function runAlgorithms() {
  if (patients.length < 2) {
    log('Adicione ao menos 2 pacientes antes de executar.', 'warn');
    return;
  }

  setStatus('calculating');

  const gaParams = getGAParams();
  const saParams = getSAParams();

  log(`Executando — ${patients.length} paciente(s)`, 'info');

  const t0ag = performance.now();
  agResult = runGA(gaParams);
  const agTime = ((performance.now() - t0ag) / 1000).toFixed(3);

  const t0sa = performance.now();
  saResult = runSA(saParams);
  const saTime = ((performance.now() - t0sa) / 1000).toFixed(3);

  const fcfsResult = computeFCFS();
  const priorityResult = computePriority();

  log(
    `AG: ${agTime}s (fitness ${fitness(agResult.best.ind).score.toFixed(1)}) | ` +
    `SA: ${saTime}s (fitness ${fitness(saResult.best.ind).score.toFixed(1)}) | ` +
    `FCFS ref: ${fcfsResult.score.toFixed(1)}`,
    'good'
  );

  renderResults(agTime, saTime, fcfsResult, priorityResult);

  document.getElementById('resultsContent').style.display = 'flex';
  document.getElementById('resultsEmpty').style.display  = 'none';

  setStatus('done');
}

/**
 * Atualiza o badge de status no header.
 * @param {'idle'|'calculating'|'live'} state
 */
function setStatus(state) {
  const badge = document.getElementById('statusBadge');
  const label = document.getElementById('statusLabel');
  badge.dataset.state = state;
  if (state === 'idle')             label.textContent = 'Aguardando execução';
  else if (state === 'calculating') label.textContent = 'Calculando...';
  else if (state === 'done')        label.textContent = 'Resultados prontos';
}

/** Lê os parâmetros do Algoritmo Genético do modal. */
function getGAParams() {
  return {
    popSize:    parseInt(document.getElementById('popSize').value),
    generations: parseInt(document.getElementById('generations').value),
    mutRate:    parseInt(document.getElementById('mutRate').value) / 100,
    crossRate:  parseInt(document.getElementById('crossRate').value) / 100,
    eliteRatio: parseInt(document.getElementById('eliteSize').value) / 100,
  };
}

/** Lê os parâmetros do Simulated Annealing do modal. */
function getSAParams() {
  return {
    tempInit:    parseInt(document.getElementById('tempInit').value),
    tempMin:     parseFloat(document.getElementById('tempMin').value),
    coolRate:    parseInt(document.getElementById('coolRate').value) / 1000,
    iterPerTemp: parseInt(document.getElementById('iterTemp').value),
  };
}

/** Abre o modal de configurações. */
function openSettings() {
  document.getElementById('settingsModal').classList.add('open');
}

/** Fecha o modal de configurações. */
function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

/** Fecha o modal ao clicar no overlay (fora do card). */
function closeSettingsOutside(event) {
  if (event.target === document.getElementById('settingsModal')) closeSettings();
}

// ================================================
// Inicialização
// ================================================
log('Sistema iniciado. Adicione pacientes para começar.', 'info');
