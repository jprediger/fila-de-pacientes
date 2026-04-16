// ================================================
// Logger — exibe mensagens no console visual da aba "Log"
// Tipos: 'info' (azul), 'good' (verde), 'warn' (amarelo)
// ================================================

const LOG_MAX_ENTRIES = 100;

function log(msg, type = 'info') {
  const box = document.getElementById('logBox');
  const span = document.createElement('span');
  span.className = `log-entry ${type}`;
  const ts = new Date().toLocaleTimeString();
  span.textContent = `[${ts}] ${msg}`;
  box.appendChild(document.createElement('br'));
  box.appendChild(span);

  // Remove as entradas mais antigas ao exceder o limite (cada entrada = br + span)
  const entries = box.querySelectorAll('.log-entry');
  if (entries.length > LOG_MAX_ENTRIES) {
    const overflow = entries.length - LOG_MAX_ENTRIES;
    for (let i = 0; i < overflow; i++) {
      const entry = entries[i];
      if (entry.previousSibling?.nodeName === 'BR') entry.previousSibling.remove();
      entry.remove();
    }
  }

  box.scrollTop = box.scrollHeight;
}
