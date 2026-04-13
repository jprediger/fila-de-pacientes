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
  scheduleAutoRun();
}

/** Remove um paciente pelo id. */
function removePatient(id) {
  patients = patients.filter(p => p.id !== id);
  renderPatientTable();
  scheduleAutoRun();
}

/** Remove todos os pacientes. */
function clearPatients() {
  patients = [];
  renderPatientTable();
  scheduleAutoRun();
}

/** Carrega 10 pacientes de exemplo. */
function loadExample() {
  patients = [
    { id: 1,  name: 'Ana Lima',      arrival: 0,  duration: 20, urgency: 3 },
    { id: 2,  name: 'Carlos Melo',   arrival: 5,  duration: 10, urgency: 5 },
    { id: 3,  name: 'Beatriz Souza', arrival: 10, duration: 30, urgency: 2 },
    { id: 4,  name: 'Diego Ramos',   arrival: 12, duration: 15, urgency: 4 },
    { id: 5,  name: 'Elisa Torres',  arrival: 20, duration: 25, urgency: 1 },
    { id: 6,  name: 'Felipe Costa',  arrival: 22, duration: 10, urgency: 3 },
    { id: 7,  name: 'Gabi Nunes',    arrival: 25, duration: 20, urgency: 4 },
    { id: 8,  name: 'Hugo Pires',    arrival: 30, duration: 15, urgency: 2 },
    { id: 9,  name: 'Iris Viana',    arrival: 35, duration: 12, urgency: 5 },
    { id: 10, name: 'João Andrade',  arrival: 40, duration: 18, urgency: 3 },
  ];
  renderPatientTable();
  log('Dados de exemplo carregados (10 pacientes)', 'good');
  scheduleAutoRun();
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

  scheduleAutoRun();
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
