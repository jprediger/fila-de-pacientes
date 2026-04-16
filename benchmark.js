#!/usr/bin/env node
// ================================================
// Benchmark Node.js — fila-de-pacientes
// Roda todos os presets AG × SA × datasets × N iterações
// e gera um relatório markdown para stdout.
//
// Uso: node benchmark.js [N]     (N = número de iterações, padrão: 5)
//      node benchmark.js 10 > relatorio.md
// ================================================

'use strict';

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

// ---- 1. Configurar contexto vm ----
// Inclui todos os built-ins que os algoritmos precisam.
// performance.now() não é usado pelos algoritmos (só por main.js), mas é incluído por segurança.
const ctx = vm.createContext({
  Math, Array, Object, Set, parseInt, parseFloat, Number,
  Infinity, isNaN, console,
  performance: { now: () => Number(process.hrtime.bigint()) / 1e6 },
});

// ---- 2. Carregar js/state.js ----
// Patch em memória: `let` e `const` no topo do script não viram propriedades do ctx em vm.
// Convertemos as 4 declarações top-level conhecidas para `var` para que fiquem no ctx.
let stateCode = fs.readFileSync(path.join(__dirname, 'js/state.js'), 'utf8');
[
  'let patients',
  'const URGENCY_WEIGHTS',
  'const URGENCY_LABELS',
  'const URGENCY_COLORS',
].forEach(decl => {
  stateCode = stateCode.replace(decl, decl.replace(/^(let|const)/, 'var'));
});
vm.runInContext(stateCode, ctx);

// ---- 3. Carregar arquivos de algoritmos ----
// Todos usam apenas `function` declarations (var-hoisted no ctx) — sem patch necessário.
[
  'js/fitness.js',
  'js/algorithms/genetic.js',
  'js/algorithms/annealing.js',
  'js/baselines.js',
].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);
});

// ---- 4. Extrair EXAMPLES de patients.js (sem executar código DOM) ----
// A função abaixo isola o bloco `const EXAMPLES = { ... };` rastreando profundidade de chaves.
function extractExamples(code) {
  const lines = code.split('\n');
  let depth = 0, capturing = false;
  const out = [];
  for (const line of lines) {
    if (!capturing && line.trimStart().startsWith('const EXAMPLES')) capturing = true;
    if (capturing) {
      out.push(line);
      depth += (line.match(/\{/g) || []).length;
      depth -= (line.match(/\}/g) || []).length;
      if (depth === 0) break;
    }
  }
  return out.join('\n');
}

const patientsCode = fs.readFileSync(path.join(__dirname, 'js/patients.js'), 'utf8');
const examplesCode = extractExamples(patientsCode).replace('const EXAMPLES', 'var EXAMPLES');
vm.runInContext(examplesCode, ctx);

// ---- 5. Referências diretas às funções do ctx ----
// Após vm.runInContext, function declarations ficam como propriedades do ctx.
const { runGA, runSA, fitness: fitnessF, computeFCFS, computePriority, EXAMPLES } = ctx;

// ---- 6. Presets ----
// Mantidos em sincronia com js/presets.js — valores idênticos.
const PRESETS_GA = {
  padrao:     { popSize: 30,  generations: 60,  mutRate: 10, crossRate: 80, eliteSize: 10 },
  explorador: { popSize: 100, generations: 200, mutRate: 30, crossRate: 70, eliteSize: 10 },
  intensivo:  { popSize: 200, generations: 500, mutRate: 20, crossRate: 85, eliteSize: 5  },
};

const PRESETS_SA = {
  padrao:   { tempInit: 800,  tempMin: 1.00, coolRate: 970, iterTemp: 8  },
  lento:    { tempInit: 1000, tempMin: 0.10, coolRate: 995, iterTemp: 20 },
  intensivo:{ tempInit: 2000, tempMin: 0.01, coolRate: 999, iterTemp: 50 },
};

const PRESET_LABELS_GA = { padrao: 'Padrão', explorador: 'Explorador', intensivo: 'Intensivo' };
const PRESET_LABELS_SA = { padrao: 'Padrão', lento: 'Lento',           intensivo: 'Intensivo' };

function buildGAParams(p) {
  return { popSize: p.popSize, generations: p.generations,
           mutRate: p.mutRate / 100, crossRate: p.crossRate / 100, eliteRatio: p.eliteSize / 100 };
}
function buildSAParams(p) {
  return { tempInit: p.tempInit, tempMin: p.tempMin,
           coolRate: p.coolRate / 1000, iterPerTemp: p.iterTemp };
}
function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function std(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

// ---- 7. Loop principal ----
const N = parseInt(process.argv[2] || '5');
if (isNaN(N) || N < 1) { console.error('N deve ser um inteiro positivo'); process.exit(1); }

const dsKeys = Object.keys(EXAMPLES);
const gaKeys = Object.keys(PRESETS_GA);
const saKeys = Object.keys(PRESETS_SA);
const allResults = [];

process.stderr.write(`Benchmark — ${N} iterações × ${gaKeys.length} presets GA × ${saKeys.length} presets SA × ${dsKeys.length} datasets\n`);
let done = 0;
const total = dsKeys.length * gaKeys.length * saKeys.length;

for (const dsKey of dsKeys) {
  ctx.patients = EXAMPLES[dsKey].data.map((p, i) => ({ ...p, id: i + 1 }));
  const fcfsRef = computeFCFS();
  const prioRef = computePriority();

  for (const gaKey of gaKeys) {
    const gaParams = buildGAParams(PRESETS_GA[gaKey]);

    for (const saKey of saKeys) {
      const saParams = buildSAParams(PRESETS_SA[saKey]);

      const gaScores = [], gaWaits = [], gaTimes = [];
      const saScores = [], saWaits = [], saTimes = [];

      for (let i = 0; i < N; i++) {
        const t0ga = Date.now();
        const gaRes = runGA(gaParams);
        gaTimes.push(Date.now() - t0ga);
        const gaF = fitnessF(gaRes.best.ind);
        gaScores.push(gaF.score);
        gaWaits.push(gaF.avgWait);

        const t0sa = Date.now();
        const saRes = runSA(saParams);
        saTimes.push(Date.now() - t0sa);
        const saF = fitnessF(saRes.best.ind);
        saScores.push(saF.score);
        saWaits.push(saF.avgWait);
      }

      allResults.push({
        dsKey, dsLabel: EXAMPLES[dsKey].label,
        gaKey, saKey,
        ga: { best: Math.min(...gaScores), avg: mean(gaScores), std: std(gaScores),
              avgWait: mean(gaWaits), avgTimeMs: mean(gaTimes) },
        sa: { best: Math.min(...saScores), avg: mean(saScores), std: std(saScores),
              avgWait: mean(saWaits), avgTimeMs: mean(saTimes) },
        fcfs: fcfsRef, prio: prioRef,
      });

      done++;
      process.stderr.write(`  [${done}/${total}] ${EXAMPLES[dsKey].label} · GA ${gaKey} + SA ${saKey}\n`);
    }
  }
}

// ---- 8. Gerar relatório markdown ----
const now = new Date().toISOString().split('T')[0];
const lines = [];

lines.push(`# Benchmark — Fila de Pacientes`);
lines.push(``);
lines.push(`**Data:** ${now}  `);
lines.push(`**Iterações por preset:** ${N}  `);
lines.push(`**Datasets:** ${dsKeys.map(k => `${k} (${EXAMPLES[k].data.length} pac.)`).join(', ')}  `);
lines.push(`**Presets AG:** ${gaKeys.map(k => PRESET_LABELS_GA[k]).join(', ')}  `);
lines.push(`**Presets SA:** ${saKeys.map(k => PRESET_LABELS_SA[k]).join(', ')}  `);
lines.push(``);
lines.push(`---`);
lines.push(``);

// Por dataset
for (const dsKey of dsKeys) {
  const group = allResults.filter(r => r.dsKey === dsKey);
  const { fcfs, prio, dsLabel } = group[0];

  lines.push(`## Dataset: ${dsLabel}`);
  lines.push(``);
  lines.push(`**Baselines (determinísticos):** FCFS fitness = ${fcfs.score.toFixed(0)} · Prioridade fitness = ${prio.score.toFixed(0)}`);
  lines.push(``);

  lines.push(`| Preset AG | Preset SA | AG Melhor | AG Média | AG DP | AG Espera | SA Melhor | SA Média | SA DP | SA Espera | Melhor |`);
  lines.push(`|---|---|---:|---:|---:|---:|---:|---:|---:|---:|:---:|`);

  for (const r of group) {
    const winner = r.ga.best <= r.sa.best ? 'AG' : 'SA';
    lines.push(
      `| ${PRESET_LABELS_GA[r.gaKey]} | ${PRESET_LABELS_SA[r.saKey]}` +
      ` | **${r.ga.best.toFixed(0)}** | ${r.ga.avg.toFixed(0)} | ${r.ga.std.toFixed(0)}` +
      ` | ${r.ga.avgWait.toFixed(1)}min` +
      ` | **${r.sa.best.toFixed(0)}** | ${r.sa.avg.toFixed(0)} | ${r.sa.std.toFixed(0)}` +
      ` | ${r.sa.avgWait.toFixed(1)}min` +
      ` | **${winner}** |`
    );
  }

  // Melhor combo do dataset
  const best = group.reduce((a, b) => a.ga.best <= b.ga.best ? a : b);
  const agImpr = fcfs.score > 0 ? ((fcfs.score - best.ga.best) / fcfs.score * 100).toFixed(1) : '—';
  const saImpr = fcfs.score > 0 ? ((fcfs.score - best.sa.best) / fcfs.score * 100).toFixed(1) : '—';
  lines.push(``);
  lines.push(`> **Melhor combo:** AG ${PRESET_LABELS_GA[best.gaKey]} + SA ${PRESET_LABELS_SA[best.saKey]} — AG fitness ${best.ga.best.toFixed(0)} (${agImpr}% vs FCFS) · SA fitness ${best.sa.best.toFixed(0)} (${saImpr}% vs FCFS)`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
}

// Resumo geral
lines.push(`## Resumo Geral`);
lines.push(``);
lines.push(`| Dataset | Melhor combo | AG Melhor | SA Melhor | FCFS ref | Melhoria AG vs FCFS | Melhoria SA vs FCFS |`);
lines.push(`|---|---|---:|---:|---:|---:|---:|`);

for (const dsKey of dsKeys) {
  const group = allResults.filter(r => r.dsKey === dsKey);
  const { fcfs, dsLabel } = group[0];
  const best = group.reduce((a, b) => a.ga.best <= b.ga.best ? a : b);
  const agImpr = fcfs.score > 0 ? ((fcfs.score - best.ga.best) / fcfs.score * 100).toFixed(1) + '%' : '—';
  const saImpr = fcfs.score > 0 ? ((fcfs.score - best.sa.best) / fcfs.score * 100).toFixed(1) + '%' : '—';
  lines.push(
    `| ${dsLabel} | AG ${PRESET_LABELS_GA[best.gaKey]} + SA ${PRESET_LABELS_SA[best.saKey]}` +
    ` | ${best.ga.best.toFixed(0)} | ${best.sa.best.toFixed(0)} | ${fcfs.score.toFixed(0)}` +
    ` | **${agImpr}** | **${saImpr}** |`
  );
}

lines.push(``);
lines.push(`---`);
lines.push(`*Gerado por \`node benchmark.js ${N}\`*`);

console.log(lines.join('\n'));
