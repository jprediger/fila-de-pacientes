// ================================================
// Gráfico de evolução do fitness ao longo das iterações
// Renderizado como SVG inline
// ================================================

/**
 * Desenha o gráfico de linha do histórico de fitness em um elemento SVG.
 *
 * @param {string}   svgId       - id do elemento <svg>
 * @param {number[]} bestHistory - série do melhor fitness por iteração
 * @param {number[]|null} avgHistory  - série da média (opcional, tracejada)
 * @param {string}   colorBest   - cor da linha principal
 * @param {string|null} colorAvg - cor da linha de média (null para omitir)
 */
function renderEvolutionChart(svgId, bestHistory, avgHistory, colorBest, colorAvg) {
  const svg = document.getElementById(svgId);
  const W = svg.parentElement.clientWidth - 24;
  const H = 196;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const allVals = [...bestHistory, ...(avgHistory || [])];
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.05;
  const n = bestHistory.length;

  // Funções de escala: índice → coordenada X, valor → coordenada Y
  const xScale = i => (i / (n - 1)) * (W - 40) + 20;
  const yScale = v => H - 20 - ((v - minV) / (maxV - minV)) * (H - 30);

  // Gera o atributo "d" de um <path> SVG a partir de um array de valores
  const pathD = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');

  svg.innerHTML = `
    <line x1="20" y1="${H-20}" x2="${W-10}" y2="${H-20}" stroke="#ddd" stroke-width="1"/>
    <line x1="20" y1="10" x2="20" y2="${H-20}" stroke="#ddd" stroke-width="1"/>
    <text x="22" y="${H-5}" font-size="10" fill="#aaa">0</text>
    <text x="22" y="16" font-size="10" fill="#aaa">${maxV.toFixed(0)}</text>
    <text x="${W/2}" y="${H-5}" font-size="10" fill="#aaa" text-anchor="middle">iterações</text>
    ${avgHistory ? `<path d="${pathD(avgHistory)}" fill="none" stroke="${colorAvg}" stroke-width="1.5" opacity="0.5" stroke-dasharray="4,3"/>` : ''}
    <path d="${pathD(bestHistory)}" fill="none" stroke="${colorBest}" stroke-width="2"/>
    <circle cx="${xScale(n-1).toFixed(1)}" cy="${yScale(bestHistory[n-1]).toFixed(1)}" r="4" fill="${colorBest}"/>
    ${avgHistory ? `<text x="${W-50}" y="20" font-size="10" fill="${colorAvg}">— média</text>` : ''}
    <text x="${W-50}" y="34" font-size="10" fill="${colorBest}">— melhor</text>
  `;
}
