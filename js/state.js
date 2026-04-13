// ================================================
// Estado global da aplicação
// ================================================

// Lista de pacientes cadastrados
let patients = [];

// Resultados armazenados após execução dos algoritmos
let agResult = null;
let saResult = null;

// ================================================
// Constantes de urgência
// ================================================

// Pesos utilizados no cálculo do fitness (urgência maior = penalidade maior por espera)
const URGENCY_WEIGHTS = { 1: 1, 2: 3, 3: 7, 4: 15, 5: 30 };

// Rótulos exibidos na interface
const URGENCY_LABELS = { 1: 'Baixa', 2: 'Média', 3: 'Alta', 4: 'Crítica', 5: 'Imediata' };

// Cores visuais associadas a cada nível de urgência
const URGENCY_COLORS = { 1: '#4caf50', 2: '#ff9800', 3: '#f44336', 4: '#9c27b0', 5: '#212121' };
