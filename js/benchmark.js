// ================================================
// Benchmark browser
// Roda todos os presets × datasets × N iterações no browser
// e exibe os resultados na aba Benchmark
// ================================================

/**
 * Abre a aba Benchmark, tornando o painel de resultados visível se necessário.
 * Chamado pelo botão "Benchmark" no header.
 */
function openBenchmark() {
  document.getElementById('resultsContent').style.display = 'flex';
  document.getElementById('resultsEmpty').style.display  = 'none';
  switchTab('benchmark');
}

/**
 * Executa o benchmark completo: todos os presets AG × presets SA × datasets × N iterações.
 * A função é async e cede ao event loop entre cada par de execuções (via sleep(0)),
 * mantendo a UI responsiva durante o processo.
 *
 * Ao final, chama renderBenchmarkResults() com os dados coletados.
 */
async function runBenchmark() {
  const N = parseInt(document.getElementById('benchIterations').value) || 5;
  const btn = document.getElementById('benchRunBtn');
  const progressWrap = document.getElementById('benchProgress');
  const resultsDiv   = document.getElementById('benchResults');

  btn.disabled = true;
  progressWrap.style.display = 'block';
  resultsDiv.innerHTML = '';
  setStatus('calculating');

  const dsKeys = Object.keys(EXAMPLES);                // ['xs', 'sm', 'md', 'lg']
  const gaKeys = Object.keys(PRESETS_GA);              // ['padrao', 'explorador', 'intensivo']
  const saKeys = Object.keys(PRESETS_SA);              // ['padrao', 'lento', 'intensivo']
  const totalSteps = dsKeys.length * gaKeys.length * saKeys.length * N;
  let step = 0;

  const allResults = [];

  try {
    for (const dsKey of dsKeys) {
      // Carrega o dataset no array global de pacientes
      patients = EXAMPLES[dsKey].data.map((p, i) => ({ ...p, id: i + 1 }));

      // Baselines determinísticos: calculados uma única vez por dataset
      const fcfsRef = computeFCFS();
      const prioRef = computePriority();

      for (const gaKey of gaKeys) {
        const gaParams = _buildGAParams(PRESETS_GA[gaKey]);

        for (const saKey of saKeys) {
          const saParams = _buildSAParams(PRESETS_SA[saKey]);

          const gaScores = [], gaWaits = [], gaTimes = [];
          const saScores = [], saWaits = [], saTimes = [];

          for (let i = 0; i < N; i++) {
            // Execução AG
            const t0ga = performance.now();
            const gaRes = runGA(gaParams);
            gaTimes.push((performance.now() - t0ga) / 1000);
            const gaF = fitness(gaRes.best.ind);
            gaScores.push(gaF.score);
            gaWaits.push(gaF.avgWait);

            // Execução SA
            const t0sa = performance.now();
            const saRes = runSA(saParams);
            saTimes.push((performance.now() - t0sa) / 1000);
            const saF = fitness(saRes.best.ind);
            saScores.push(saF.score);
            saWaits.push(saF.avgWait);

            step++;
            _updateBenchProgress(step, totalSteps);

            // Cede ao event loop para manter a UI responsiva
            await sleep(0);
          }

          allResults.push({
            dsKey,
            dsLabel: EXAMPLES[dsKey].label,
            gaKey,
            saKey,
            ga: {
              best:    Math.min(...gaScores),
              avg:     _mean(gaScores),
              avgWait: _mean(gaWaits),
              avgTime: _mean(gaTimes),
            },
            sa: {
              best:    Math.min(...saScores),
              avg:     _mean(saScores),
              avgWait: _mean(saWaits),
              avgTime: _mean(saTimes),
            },
            fcfs: fcfsRef,
            prio: prioRef,
          });
        }
      }
    }

    log(`Benchmark concluído — ${totalSteps} execuções`, 'good');
    renderBenchmarkResults(allResults);
    setStatus('done');
  } finally {
    btn.disabled = false;
    progressWrap.style.display = 'none';
  }
}

/**
 * Renderiza os resultados do benchmark agrupados por dataset.
 * Para cada dataset: tabela de todas as combos preset × preset,
 * com destaque para a melhor combinação encontrada.
 *
 * @param {Array} results - array produzido por runBenchmark()
 */
function renderBenchmarkResults(results) {
  const container = document.getElementById('benchResults');
  const dsKeys = [...new Set(results.map(r => r.dsKey))];
  const html = [];

  // Resumo geral no topo
  const summaryRows = [];

  for (const dsKey of dsKeys) {
    const group = results.filter(r => r.dsKey === dsKey);
    const dsLabel = group[0].dsLabel;
    const fcfs = group[0].fcfs;
    const prio = group[0].prio;

    // Melhor combo do dataset = menor GA best score entre todas as combos
    const best = group.reduce((a, b) => a.ga.best <= b.ga.best ? a : b);
    const agImprBest = fcfs.score > 0
      ? ((fcfs.score - best.ga.best) / fcfs.score * 100).toFixed(1) + '%'
      : '—';
    const saImprBest = fcfs.score > 0
      ? ((fcfs.score - best.sa.best) / fcfs.score * 100).toFixed(1) + '%'
      : '—';

    summaryRows.push({ dsLabel, best, agImprBest, saImprBest, fcfs, prio });

    // Tabela das combos
    const rows = group.map(r => {
      const winner = r.ga.best <= r.sa.best ? 'AG' : 'SA';
      const wClass = winner === 'AG' ? 'badge-purple' : 'badge-orange';
      const isTopGA = r.ga.best === best.ga.best && r.gaKey === best.gaKey && r.saKey === best.saKey;
      return `<tr${isTopGA ? ' class="bench-best-row"' : ''}>
        <td>${PRESET_LABELS_GA[r.gaKey]}</td>
        <td>${PRESET_LABELS_SA[r.saKey]}</td>
        <td style="color:#5c6bc0;font-weight:600">${r.ga.best.toFixed(0)}</td>
        <td style="color:#5c6bc0">${r.ga.avg.toFixed(0)}</td>
        <td style="color:#5c6bc0">${r.ga.avgWait.toFixed(1)}min</td>
        <td style="color:#ef6c00;font-weight:600">${r.sa.best.toFixed(0)}</td>
        <td style="color:#ef6c00">${r.sa.avg.toFixed(0)}</td>
        <td style="color:#ef6c00">${r.sa.avgWait.toFixed(1)}min</td>
        <td><span class="badge ${wClass}">${winner}</span></td>
      </tr>`;
    }).join('');

    html.push(`
      <div class="bench-dataset-section">
        <div class="bench-dataset-title">${dsLabel}</div>
        <div class="bench-summary-card">
          Melhor combo: <strong>AG ${PRESET_LABELS_GA[best.gaKey]}</strong> + <strong>SA ${PRESET_LABELS_SA[best.saKey]}</strong>
          &nbsp;—&nbsp; AG fitness ${best.ga.best.toFixed(0)} · SA fitness ${best.sa.best.toFixed(0)}
          &nbsp;|&nbsp; FCFS ref: ${fcfs.score.toFixed(0)} · Prio ref: ${prio.score.toFixed(0)}
        </div>
        <div class="bench-table-wrap">
          <table class="bench-table">
            <thead>
              <tr>
                <th>Preset AG</th>
                <th>Preset SA</th>
                <th data-tooltip="Menor fitness encontrado pelo AG nas ${document.getElementById('benchIterations').value} execuções">AG Melhor</th>
                <th data-tooltip="Média do fitness do AG">AG Média</th>
                <th data-tooltip="Espera média dos pacientes na melhor solução AG">AG Espera</th>
                <th data-tooltip="Menor fitness encontrado pelo SA">SA Melhor</th>
                <th data-tooltip="Média do fitness do SA">SA Média</th>
                <th data-tooltip="Espera média dos pacientes na melhor solução SA">SA Espera</th>
                <th>Melhor</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `);
  }

  // Tabela resumo geral
  const summaryHtml = `
    <div class="bench-dataset-section">
      <div class="bench-dataset-title">Resumo Geral — melhor combo por dataset</div>
      <div class="bench-table-wrap">
        <table class="bench-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Melhor combo</th>
              <th>AG Melhor</th>
              <th>SA Melhor</th>
              <th>FCFS ref</th>
              <th>Melhoria AG vs FCFS</th>
              <th>Melhoria SA vs FCFS</th>
            </tr>
          </thead>
          <tbody>
            ${summaryRows.map(r => `<tr>
              <td>${r.dsLabel}</td>
              <td>AG ${PRESET_LABELS_GA[r.best.gaKey]} + SA ${PRESET_LABELS_SA[r.best.saKey]}</td>
              <td style="color:#5c6bc0;font-weight:600">${r.best.ga.best.toFixed(0)}</td>
              <td style="color:#ef6c00;font-weight:600">${r.best.sa.best.toFixed(0)}</td>
              <td>${r.fcfs.score.toFixed(0)}</td>
              <td style="color:#2e7d32;font-weight:600">${r.agImprBest}</td>
              <td style="color:#2e7d32;font-weight:600">${r.saImprBest}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = summaryHtml + html.join('');
}

// ---- helpers internos ----

function _buildGAParams(preset) {
  return {
    popSize:     preset.popSize,
    generations: preset.generations,
    mutRate:     preset.mutRate    / 100,
    crossRate:   preset.crossRate  / 100,
    eliteRatio:  preset.eliteSize  / 100,
  };
}

function _buildSAParams(preset) {
  return {
    tempInit:    preset.tempInit,
    tempMin:     preset.tempMin,
    coolRate:    preset.coolRate   / 1000,
    iterPerTemp: preset.iterTemp,
  };
}

function _mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function _updateBenchProgress(step, total) {
  const pct = Math.round(step / total * 100);
  document.getElementById('benchProgressFill').style.width = pct + '%';
  document.getElementById('benchProgressText').textContent =
    `Executando... ${step}/${total} (${pct}%)`;
}
