# Fila de Pacientes — Otimização com IA

Aplicação web que otimiza a ordem de atendimento de pacientes em uma fila hospitalar utilizando dois algoritmos de inteligência artificial: **Algoritmo Genético (AG)** e **Simulated Annealing (SA)**.

## Sobre o Projeto

O sistema recebe uma lista de pacientes com horário de chegada, duração estimada do atendimento e nível de urgência. A partir desses dados, os algoritmos buscam a sequência de atendimento que minimize o tempo de espera ponderado pela urgência de cada paciente — priorizando os casos mais críticos sem ignorar quem chegou mais cedo.

Os resultados são comparados entre si e contra duas estratégias de referência (baselines):
- **FCFS** (First Come, First Served): atendimento na ordem de chegada
- **Prioridade pura**: atendimento do mais urgente para o menos urgente

## Funcionalidades

- Cadastro manual de pacientes ou carregamento de exemplos pré-definidos (5, 10, 20 ou 30 pacientes)
- Execução simultânea do AG e do SA com parâmetros configuráveis
- Visualização dos resultados em abas: comparação geral, AG e SA individualmente
- Cronograma de atendimento em formato Gantt para cada algoritmo
- Métricas: fitness (espera ponderada), espera média e comparação de desempenho
- Log de execução com tempos e resultados em tempo real

## Algoritmos

### Algoritmo Genético (AG)
Mantém uma população de ordens de atendimento e a evolui por gerações via seleção por torneio, cruzamento OX e mutação por troca de posições. Parâmetros configuráveis: tamanho da população, número de gerações, taxa de mutação, taxa de cruzamento e percentual de elitismo.

### Simulated Annealing (SA)
Parte de uma solução aleatória e explora trocas de pares de pacientes. A temperatura controla a aceitação de soluções piores, decaindo geometricamente a cada iteração. Parâmetros configuráveis: temperatura inicial, temperatura mínima, taxa de resfriamento e iterações por temperatura.

## Tecnologias

- HTML5, CSS3 e JavaScript puro (sem frameworks ou dependências externas)
- Aplicação 100% client-side, sem necessidade de servidor

## Como Usar

1. Abra o arquivo `index.html` em um navegador
2. Adicione pacientes manualmente ou selecione um exemplo no menu
3. Ajuste os parâmetros dos algoritmos em **Configurações** (opcional)
4. Clique em **Executar** para rodar a otimização
5. Analise os resultados nas abas de Comparação, AG e SA

## Estrutura do Projeto

```
fila-de-pacientes/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── state.js           # Estado global da aplicação
    ├── fitness.js         # Função de avaliação (fitness)
    ├── patients.js        # Gerenciamento da lista de pacientes
    ├── baselines.js       # Cálculo das referências FCFS e prioridade pura
    ├── logger.js          # Log de execução
    ├── main.js            # Orquestrador principal
    ├── algorithms/
    │   ├── genetic.js     # Algoritmo Genético
    │   └── annealing.js   # Simulated Annealing
    └── ui/
        ├── results.js     # Renderização dos resultados
        ├── gantt.js       # Gráfico de Gantt
        ├── charts.js      # Gráficos de convergência
        ├── tabs.js        # Navegação por abas
        └── progress.js    # Barra de progresso
```
