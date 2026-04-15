// ================================================
// Gráfico de Gantt — cronograma visual de atendimento
// Renderizado como SVG inline
// ================================================

/**
 * Gera um diagrama de Gantt para a ordem de atendimento informada.
 * Cada linha representa um paciente; barras coloridas indicam tempo de atendimento
 * e barras cinzas indicam tempo de espera.
 *
 * @param {string}   elId  - id do elemento container
 * @param {number[]} order - índices dos pacientes na ordem otimizada
 * @param {string}   color - cor principal (usada no fallback; urgência define a cor das barras)
 */
function renderGantt(elId, order, color) {
  const el = document.getElementById(elId);
  let time = 0;
  const slots = order.map(idx => {
    const p = patients[idx];
    const startTime = Math.max(time, p.arrival);
    const wait = startTime - p.arrival;
    time = startTime + p.duration;
    return { p, startTime, wait, end: time };
  });
  const totalTime = slots[slots.length - 1].end;
  const W = Math.max(400, el.clientWidth || el.parentElement?.clientWidth || 800);
  const ROW_H = 28;
  const H = slots.length * (ROW_H + 4) + 30;
  const xScale = t => 100 + (t / totalTime) * (W - 120);

  let svg = `<svg width="${W}" height="${H}" style="display:block">`;
  svg += `<text x="0" y="16" font-size="11" fill="#888">Paciente</text>`;
  svg += `<text x="${W/2}" y="16" text-anchor="middle" font-size="11" fill="#888">Tempo (min) →</text>`;
  slots.forEach(({ p, startTime, wait, end }, i) => {
    const y = 24 + i * (ROW_H + 4);
    const x1 = xScale(startTime);
    const x2 = xScale(end);
    const xArr = xScale(p.arrival);
    svg += `<text x="96" y="${y + 18}" text-anchor="end" font-size="11" fill="#555">${p.name}</text>`;
    // Barra cinza de espera (se houver)
    if (wait > 0) {
      svg += `<g><title>Aguardando: ${wait}min\nChegada: ${p.arrival}min → Início: ${startTime}min</title>`;
      svg += `<rect x="${xArr.toFixed(1)}" y="${y+6}" width="${(x1-xArr).toFixed(1)}" height="${ROW_H-12}" rx="3" fill="#eee" stroke="#ddd" stroke-width="0.5"/>`;
      svg += `<text x="${((xArr+x1)/2).toFixed(1)}" y="${y+ROW_H/2+1}" text-anchor="middle" font-size="9" fill="#999">espera ${wait}min</text>`;
      svg += `</g>`;
    }
    // Barra colorida de atendimento (cor por urgência)
    svg += `<g><title>${p.name} — ${URGENCY_LABELS[p.urgency]} (peso ${URGENCY_WEIGHTS[p.urgency]}×)\nDuração: ${p.duration}min\nInício: ${startTime}min → Fim: ${end}min</title>`;
    svg += `<rect x="${x1.toFixed(1)}" y="${y}" width="${(x2-x1).toFixed(1)}" height="${ROW_H}" rx="3" fill="${URGENCY_COLORS[p.urgency]}" opacity="0.85"/>`;
    svg += `<text x="${((x1+x2)/2).toFixed(1)}" y="${y+ROW_H/2+4}" text-anchor="middle" font-size="10" fill="#fff">${p.duration}min</text>`;
    svg += `</g>`;
  });
  // Eixo de tempo com marcas verticais
  const ticks = 6;
  for (let i = 0; i <= ticks; i++) {
    const t = Math.round((i / ticks) * totalTime);
    const x = xScale(t).toFixed(1);
    svg += `<line x1="${x}" y1="22" x2="${x}" y2="${H}" stroke="#eee" stroke-width="0.5"/>`;
    svg += `<text x="${x}" y="${H}" text-anchor="middle" font-size="10" fill="#aaa">${t}</text>`;
  }
  svg += `</svg>`;
  el.innerHTML = svg;
}
