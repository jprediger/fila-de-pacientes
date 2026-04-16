// ================================================
// Presets de configuração para AG e SA
// Fonte única: usada pela UI (applyPreset) e pelo benchmark.js Node.js
// ================================================

const PRESETS_GA = {
  padrao: {
    popSize: 30, generations: 60, mutRate: 10, crossRate: 80, eliteSize: 10,
  },
  explorador: {
    popSize: 100, generations: 200, mutRate: 30, crossRate: 70, eliteSize: 10,
  },
  intensivo: {
    popSize: 200, generations: 500, mutRate: 20, crossRate: 85, eliteSize: 5,
  },
};

const PRESETS_SA = {
  padrao: {
    tempInit: 800, tempMin: 1.00, coolRate: 970, iterTemp: 8,
  },
  lento: {
    tempInit: 1000, tempMin: 0.10, coolRate: 995, iterTemp: 20,
  },
  intensivo: {
    tempInit: 2000, tempMin: 0.01, coolRate: 999, iterTemp: 50,
  },
};

// Labels legíveis para exibição na UI e nos relatórios
const PRESET_LABELS_GA = { padrao: 'Padrão', explorador: 'Explorador', intensivo: 'Intensivo' };
const PRESET_LABELS_SA = { padrao: 'Padrão', lento: 'Lento',           intensivo: 'Intensivo' };

/**
 * Aplica um preset ao modal de configurações, atualizando os sliders e seus displays.
 * Só deve ser chamada no browser (acessa document).
 *
 * @param {'ga'|'sa'} alg  - algoritmo alvo
 * @param {string}    name - chave do preset ('padrao' | 'explorador' | 'intensivo' | 'lento')
 */
function applyPreset(alg, name) {
  const preset = alg === 'ga' ? PRESETS_GA[name] : PRESETS_SA[name];
  if (!preset) return;

  if (alg === 'ga') {
    _setSlider('popSize',     preset.popSize,     v => v);
    _setSlider('generations', preset.generations, v => v);
    _setSlider('mutRate',     preset.mutRate,     v => (v / 100).toFixed(2));
    _setSlider('crossRate',   preset.crossRate,   v => (v / 100).toFixed(2));
    _setSlider('eliteSize',   preset.eliteSize,   v => v);
  } else {
    _setSlider('tempInit', preset.tempInit, v => v);
    _setSlider('tempMin',  preset.tempMin,  v => parseFloat(v).toFixed(2));
    _setSlider('coolRate', preset.coolRate, v => (v / 1000).toFixed(3));
    _setSlider('iterTemp', preset.iterTemp, v => v);
  }
}

/**
 * Seta o valor de um slider e atualiza o span de display correspondente.
 * O mapeamento ID → span segue as convenções do HTML (eliteSize→eliteVal, iterTemp→iterTempVal).
 *
 * @param {string}   id        - id do input[type=range]
 * @param {number}   value     - valor a aplicar
 * @param {function} displayFn - formata o valor para exibição no span
 */
function _setSlider(id, value, displayFn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value;
  const spanId = id === 'eliteSize' ? 'eliteVal'
               : id === 'iterTemp'  ? 'iterTempVal'
               : id + 'Val';
  const span = document.getElementById(spanId);
  if (span) span.textContent = displayFn(value);
}
