// ================================================
// Utilitário de pausa assíncrona
// Mantido para compatibilidade — não usado no auto-run
// ================================================

/** Pausa assíncrona que permite ao browser atualizar o DOM entre etapas. */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
