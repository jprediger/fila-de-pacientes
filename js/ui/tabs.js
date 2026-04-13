// ================================================
// Navegação por abas
// ================================================

/**
 * Ativa a aba selecionada e oculta as demais.
 *
 * @param {'results'|'evolution'|'schedule'|'log'} name - identificador da aba
 */
function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    const names = ['results', 'evolution', 'schedule', 'log'];
    t.classList.toggle('active', names[i] === name);
  });
  document.querySelectorAll('.tab-content').forEach(tc => {
    tc.classList.toggle('active', tc.id === `tab-${name}`);
  });
}
