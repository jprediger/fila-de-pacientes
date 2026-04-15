// ================================================
// Gráfico de evolução do fitness ao longo das iterações
// Renderizado como SVG inline
// ================================================

/**
 * Desenha o gráfico de linha do histórico de fitness em um elemento SVG.
 *
 * Escalas lineares:
 *   xScale: mapeia o índice da iteração [0, n-1] para coordenadas X [20, W-20]
 *   yScale: mapeia o valor de fitness [minV, maxV] para coordenadas Y [H-20, 10]
 *           (Y invertido: maior Y = mais para baixo na tela; fitness menor = mais acima)
 *
 * Margem de 5% acima e abaixo dos valores extremos (minV*0.95, maxV*1.05) evita que
 * as linhas fiquem coladas nas bordas do gráfico, melhorando a leitura visual.
 *
 * @param {string}       svgId       - id do elemento <svg>
 * @param {number[]}     bestHistory - série do melhor fitness por iteração
 * @param {number[]|null} avgHistory  - série da média (opcional, tracejada)
 * @param {string}       colorBest   - cor da linha principal (melhor fitness)
 * @param {string|null}  colorAvg    - cor da linha de média (null para omitir)
 */
function renderEvolutionChart(svgId, bestHistory, avgHistory, colorBest, colorAvg) {
  const svg = document.getElementById(svgId);
  const parent = svg.parentElement;
  const style = getComputedStyle(parent);
  const W = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const H = parent.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Domínio Y: 5% de margem para não cortar os extremos visualmente
  const allVals = [...bestHistory, ...(avgHistory || [])];
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.05;

  const n = bestHistory.length;

  // xScale: índice → coordenada X na área útil [20, W-20]
  // Guarda divisão por zero quando há apenas 1 ponto: centraliza no meio do SVG
  const xScale = i => n > 1 ? (i / (n - 1)) * (W - 40) + 20 : W / 2;

  // yScale: valor → coordenada Y (eixo Y invertido: menor fitness = posição mais alta)
  const yScale = v => H - 20 - ((v - minV) / (maxV - minV)) * (H - 30);

  // Gera o atributo "d" de um <path> SVG a partir de um array de valores
  const pathD = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');

  svg.innerHTML = `
    <line x1="20" y1="${H-20}" x2="${W-10}" y2="${H-20}" stroke="#ddd" stroke-width="1"/>
    <line x1="20" y1="10" x2="20" y2="${H-20}" stroke="#ddd" stroke-width="1"/>
    <text x="22" y="${H-5}" font-size="10" fill="#aaa">0</text>
    <text x="22" y="16" font-size="10" fill="#aaa">${maxV.toFixed(0)}<title>Escala Y: 0 a ${maxV.toFixed(0)} (pior fitness observado). Quanto mais o gráfico desce, melhor a otimização.</title></text>
    <text x="${W/2}" y="${H-5}" font-size="10" fill="#aaa" text-anchor="middle">iterações</text>
    ${avgHistory ? `<path d="${pathD(avgHistory)}" fill="none" stroke="${colorAvg}" stroke-width="1.5" opacity="0.5" stroke-dasharray="4,3"><title>Fitness médio da população a cada geração. Mostra a qualidade geral, não só o melhor.</title></path>` : ''}
    <path d="${pathD(bestHistory)}" fill="none" stroke="${colorBest}" stroke-width="2"><title>Melhor fitness encontrado até cada iteração. Sempre decresce ou permanece igual.</title></path>
    <circle cx="${xScale(n-1).toFixed(1)}" cy="${yScale(bestHistory[n-1]).toFixed(1)}" r="4" fill="${colorBest}"><title>Melhor fitness final: ${bestHistory[n-1].toFixed(1)}\nApós ${n} iterações</title></circle>
    ${avgHistory ? `<text x="${W-50}" y="20" font-size="10" fill="${colorAvg}">— média<title>Fitness médio da população (tracejado). Indica diversidade da busca.</title></text>` : ''}
    <text x="${W-50}" y="34" font-size="10" fill="${colorBest}">— melhor<title>Melhor fitness por iteração (linha sólida). Sempre decresce.</title></text>
  `;
}
