// ================================================
// Gerenciamento de pacientes
// CRUD + renderização da tabela com edição inline
// ================================================

/** Lê os campos do formulário e adiciona um novo paciente. */
function addPatient() {
  const name = document.getElementById('pName').value.trim() || `P${patients.length + 1}`;
  const arrival = parseInt(document.getElementById('pArrival').value) || 0;
  const duration = parseInt(document.getElementById('pDuration').value) || 15;
  const urgency = parseInt(document.getElementById('pUrgency').value);
  patients.push({ id: Date.now(), name, arrival, duration, urgency });
  document.getElementById('pName').value = '';
  renderPatientTable();
}

/** Remove um paciente pelo id. */
function removePatient(id) {
  patients = patients.filter(p => p.id !== id);
  renderPatientTable();
}

/** Remove todos os pacientes. */
function clearPatients() {
  patients = [];
  renderPatientTable();
  document.getElementById('resultsContent').style.display = 'none';
  document.getElementById('resultsEmpty').style.display  = 'flex';
  setStatus('idle');
}

// ================================================
// Datasets de exemplo com tamanhos crescentes
// ================================================
const EXAMPLES = {
  xs: {
    label: '5 pacientes',
    data: [
      { name: 'Ana Lima',      arrival:  0, duration: 20, urgency: 3 },
      { name: 'Carlos Melo',   arrival:  5, duration: 10, urgency: 5 },
      { name: 'Beatriz Souza', arrival: 10, duration: 30, urgency: 2 },
      { name: 'Diego Ramos',   arrival: 12, duration: 15, urgency: 4 },
      { name: 'Elisa Torres',  arrival: 20, duration: 25, urgency: 1 },
    ],
  },
  sm: {
    label: '10 pacientes',
    data: [
      { name: 'Ana Lima',      arrival:  0, duration: 20, urgency: 3 },
      { name: 'Carlos Melo',   arrival:  5, duration: 10, urgency: 5 },
      { name: 'Beatriz Souza', arrival: 10, duration: 30, urgency: 2 },
      { name: 'Diego Ramos',   arrival: 12, duration: 15, urgency: 4 },
      { name: 'Elisa Torres',  arrival: 20, duration: 25, urgency: 1 },
      { name: 'Felipe Costa',  arrival: 22, duration: 10, urgency: 3 },
      { name: 'Gabi Nunes',    arrival: 25, duration: 20, urgency: 4 },
      { name: 'Hugo Pires',    arrival: 30, duration: 15, urgency: 2 },
      { name: 'Iris Viana',    arrival: 35, duration: 12, urgency: 5 },
      { name: 'João Andrade',  arrival: 40, duration: 18, urgency: 3 },
    ],
  },
  md: {
    label: '20 pacientes',
    data: [
      { name: 'Ana Lima',        arrival:  0, duration: 20, urgency: 3 },
      { name: 'Carlos Melo',     arrival:  5, duration: 10, urgency: 5 },
      { name: 'Beatriz Souza',   arrival: 10, duration: 30, urgency: 2 },
      { name: 'Diego Ramos',     arrival: 12, duration: 15, urgency: 4 },
      { name: 'Elisa Torres',    arrival: 20, duration: 25, urgency: 1 },
      { name: 'Felipe Costa',    arrival: 22, duration: 10, urgency: 3 },
      { name: 'Gabi Nunes',      arrival: 25, duration: 20, urgency: 4 },
      { name: 'Hugo Pires',      arrival: 30, duration: 15, urgency: 2 },
      { name: 'Iris Viana',      arrival: 35, duration: 12, urgency: 5 },
      { name: 'João Andrade',    arrival: 40, duration: 18, urgency: 3 },
      { name: 'Karen Oliveira',  arrival: 42, duration: 22, urgency: 1 },
      { name: 'Lucas Ferreira',  arrival: 48, duration:  8, urgency: 4 },
      { name: 'Mariana Castro',  arrival: 50, duration: 35, urgency: 2 },
      { name: 'Nelson Barros',   arrival: 55, duration: 14, urgency: 5 },
      { name: 'Olivia Martins',  arrival: 58, duration: 20, urgency: 3 },
      { name: 'Paulo Ribeiro',   arrival: 60, duration: 10, urgency: 1 },
      { name: 'Queila Santos',   arrival: 65, duration: 28, urgency: 4 },
      { name: 'Rafael Gomes',    arrival: 70, duration: 16, urgency: 2 },
      { name: 'Sabrina Lopes',   arrival: 72, duration: 12, urgency: 5 },
      { name: 'Thiago Alves',    arrival: 80, duration: 24, urgency: 3 },
    ],
  },
  lg: {
    label: '30 pacientes',
    data: [
      { name: 'Ana Lima',        arrival:  0, duration: 20, urgency: 3 },
      { name: 'Carlos Melo',     arrival:  5, duration: 10, urgency: 5 },
      { name: 'Beatriz Souza',   arrival: 10, duration: 30, urgency: 2 },
      { name: 'Diego Ramos',     arrival: 12, duration: 15, urgency: 4 },
      { name: 'Elisa Torres',    arrival: 20, duration: 25, urgency: 1 },
      { name: 'Felipe Costa',    arrival: 22, duration: 10, urgency: 3 },
      { name: 'Gabi Nunes',      arrival: 25, duration: 20, urgency: 4 },
      { name: 'Hugo Pires',      arrival: 30, duration: 15, urgency: 2 },
      { name: 'Iris Viana',      arrival: 35, duration: 12, urgency: 5 },
      { name: 'João Andrade',    arrival: 40, duration: 18, urgency: 3 },
      { name: 'Karen Oliveira',  arrival: 42, duration: 22, urgency: 1 },
      { name: 'Lucas Ferreira',  arrival: 48, duration:  8, urgency: 4 },
      { name: 'Mariana Castro',  arrival: 50, duration: 35, urgency: 2 },
      { name: 'Nelson Barros',   arrival: 55, duration: 14, urgency: 5 },
      { name: 'Olivia Martins',  arrival: 58, duration: 20, urgency: 3 },
      { name: 'Paulo Ribeiro',   arrival: 60, duration: 10, urgency: 1 },
      { name: 'Queila Santos',   arrival: 65, duration: 28, urgency: 4 },
      { name: 'Rafael Gomes',    arrival: 70, duration: 16, urgency: 2 },
      { name: 'Sabrina Lopes',   arrival: 72, duration: 12, urgency: 5 },
      { name: 'Thiago Alves',    arrival: 80, duration: 24, urgency: 3 },
      { name: 'Úrsula Campos',   arrival: 83, duration: 18, urgency: 1 },
      { name: 'Vinícius Cruz',   arrival: 85, duration: 10, urgency: 4 },
      { name: 'Wanda Freitas',   arrival: 90, duration: 30, urgency: 2 },
      { name: 'Ximena Rocha',    arrival: 92, duration: 15, urgency: 5 },
      { name: 'Yago Cardoso',    arrival: 95, duration: 20, urgency: 3 },
      { name: 'Zaira Mendes',    arrival: 100, duration: 12, urgency: 4 },
      { name: 'André Teixeira',  arrival: 102, duration: 25, urgency: 1 },
      { name: 'Bruna Figueiredo',arrival: 108, duration:  9, urgency: 5 },
      { name: 'Cássio Moreira',  arrival: 110, duration: 18, urgency: 2 },
      { name: 'Daniela Pinto',   arrival: 115, duration: 22, urgency: 3 },
    ],
  },
};

/**
 * Carrega um dataset de exemplo pelo identificador.
 * @param {string} id - chave do exemplo: 'xs' | 'sm' | 'md' | 'lg'
 */
function loadExample(id) {
  const ex = EXAMPLES[id];
  if (!ex) return;
  patients = ex.data.map((p, i) => ({ ...p, id: i + 1 }));
  renderPatientTable();
  log(`Exemplo "${ex.label}" carregado. Clique em "Executar" para rodar os algoritmos.`, 'good');
}

/**
 * Atualiza um campo de um paciente após edição inline.
 * Apenas campos que afetam o fitness (arrival, duration, urgency) disparam recálculo.
 *
 * @param {number} id    - id único do paciente
 * @param {string} field - campo a atualizar ('name' | 'arrival' | 'duration' | 'urgency')
 * @param {string} value - novo valor (como string)
 */
function updatePatient(id, field, value) {
  const p = patients.find(p => p.id === id);
  if (!p) return;

  if (field === 'name') {
    p.name = value.trim() || p.name;
    return; // nome não afeta fitness
  }

  if (field === 'arrival' || field === 'duration') {
    const v = parseInt(value);
    if (!isNaN(v) && v >= 0) p[field] = v;
  }

  if (field === 'urgency') {
    p.urgency = parseInt(value);
  }
}

/** Renderiza a tabela de pacientes com células editáveis inline. */
function renderPatientTable() {
  const tbody = document.getElementById('patientRows');
  if (patients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum paciente. Use "Exemplo" ou adicione abaixo.</td></tr>';
    return;
  }

  tbody.innerHTML = patients.map(p => `
    <tr>
      <td contenteditable="true"
          onblur="updatePatient(${p.id}, 'name', this.textContent)">${p.name}</td>
      <td contenteditable="true"
          onblur="updatePatient(${p.id}, 'arrival', this.textContent)">${p.arrival}</td>
      <td contenteditable="true"
          onblur="updatePatient(${p.id}, 'duration', this.textContent)">${p.duration}</td>
      <td>
        <select class="urgency-select"
                onchange="updatePatient(${p.id}, 'urgency', this.value)">
          ${[1, 2, 3, 4, 5].map(v =>
            `<option value="${v}"${p.urgency === v ? ' selected' : ''}>${URGENCY_LABELS[v]}</option>`
          ).join('')}
        </select>
      </td>
      <td><button class="remove-btn" onclick="removePatient(${p.id})">&#215;</button></td>
    </tr>
  `).join('');
}
