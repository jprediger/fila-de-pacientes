// ================================================
// Logger — exibe mensagens no console visual da aba "Log"
// Tipos: 'info' (azul), 'good' (verde), 'warn' (amarelo)
// ================================================

function log(msg, type = 'info') {
  const box = document.getElementById('logBox');
  const span = document.createElement('span');
  span.className = `log-entry ${type}`;
  const ts = new Date().toLocaleTimeString();
  span.textContent = `[${ts}] ${msg}`;
  box.appendChild(document.createElement('br'));
  box.appendChild(span);
  box.scrollTop = box.scrollHeight;
}
