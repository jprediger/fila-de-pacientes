# Benchmark — Fila de Pacientes

**Data:** 2026-04-16  
**Iterações por preset:** 5  
**Datasets:** xs (5 pac.), sm (10 pac.), md (20 pac.), lg (30 pac.)  
**Presets AG:** Padrão, Explorador, Intensivo  
**Presets SA:** Padrão, Lento, Intensivo  

---

## Dataset: 5 pacientes

**Baselines (determinísticos):** FCFS fitness = 1285 · Prioridade fitness = 435

| Preset AG | Preset SA | AG Melhor | AG Média | AG DP | AG Espera | SA Melhor | SA Média | SA DP | SA Espera | Melhor |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| Padrão | Padrão | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Padrão | Lento | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Padrão | Intensivo | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Explorador | Padrão | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Explorador | Lento | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Explorador | Intensivo | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Intensivo | Padrão | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Intensivo | Lento | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |
| Intensivo | Intensivo | **435** | 435 | 0 | 26.6min | **435** | 435 | 0 | 26.6min | **AG** |

> **Melhor combo:** AG Padrão + SA Padrão — AG fitness 435 (66.1% vs FCFS) · SA fitness 435 (66.1% vs FCFS)

---

## Dataset: 10 pacientes

**Baselines (determinísticos):** FCFS fitness = 7525 · Prioridade fitness = 3623

| Preset AG | Preset SA | AG Melhor | AG Média | AG DP | AG Espera | SA Melhor | SA Média | SA DP | SA Espera | Melhor |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| Padrão | Padrão | **2230** | 2350 | 63 | 53.6min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Padrão | Lento | **2230** | 2295 | 63 | 51.5min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Padrão | Intensivo | **2230** | 2336 | 89 | 52.3min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Explorador | Padrão | **2230** | 2286 | 68 | 51.6min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Explorador | Lento | **2230** | 2230 | 0 | 49.5min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Explorador | Intensivo | **2230** | 2258 | 56 | 50.5min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Intensivo | Padrão | **2230** | 2230 | 0 | 49.5min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Intensivo | Lento | **2230** | 2230 | 0 | 49.5min | **2230** | 2230 | 0 | 49.5min | **AG** |
| Intensivo | Intensivo | **2230** | 2230 | 0 | 49.5min | **2230** | 2230 | 0 | 49.5min | **AG** |

> **Melhor combo:** AG Padrão + SA Padrão — AG fitness 2230 (70.4% vs FCFS) · SA fitness 2230 (70.4% vs FCFS)

---

## Dataset: 20 pacientes

**Baselines (determinísticos):** FCFS fitness = 31005 · Prioridade fitness = 13300

| Preset AG | Preset SA | AG Melhor | AG Média | AG DP | AG Espera | SA Melhor | SA Média | SA DP | SA Espera | Melhor |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| Padrão | Padrão | **11030** | 12375 | 1136 | 129.6min | **8642** | 9095 | 227 | 116.8min | **SA** |
| Padrão | Lento | **10172** | 11310 | 1195 | 128.5min | **8639** | 8639 | 0 | 111.5min | **SA** |
| Padrão | Intensivo | **9459** | 10355 | 797 | 120.7min | **8639** | 8639 | 0 | 112.0min | **SA** |
| Explorador | Padrão | **9201** | 9205 | 8 | 118.5min | **8639** | 8978 | 275 | 116.0min | **SA** |
| Explorador | Lento | **9201** | 9331 | 162 | 116.4min | **8639** | 8639 | 0 | 112.0min | **SA** |
| Explorador | Intensivo | **9201** | 9201 | 0 | 119.2min | **8639** | 8639 | 0 | 111.3min | **SA** |
| Intensivo | Padrão | **9201** | 9205 | 8 | 118.5min | **8639** | 9164 | 299 | 116.3min | **SA** |
| Intensivo | Lento | **8639** | 9089 | 225 | 118.1min | **8639** | 8639 | 0 | 111.3min | **AG** |
| Intensivo | Intensivo | **8639** | 9090 | 225 | 117.0min | **8639** | 8639 | 0 | 111.8min | **AG** |

> **Melhor combo:** AG Intensivo + SA Lento — AG fitness 8639 (72.1% vs FCFS) · SA fitness 8639 (72.1% vs FCFS)

---

## Dataset: 30 pacientes

**Baselines (determinísticos):** FCFS fitness = 70264 · Prioridade fitness = 27770

| Preset AG | Preset SA | AG Melhor | AG Média | AG DP | AG Espera | SA Melhor | SA Média | SA DP | SA Espera | Melhor |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| Padrão | Padrão | **27472** | 30147 | 1987 | 194.5min | **19547** | 20274 | 534 | 176.6min | **SA** |
| Padrão | Lento | **32348** | 34888 | 2216 | 217.7min | **18176** | 18700 | 428 | 169.4min | **SA** |
| Padrão | Intensivo | **29924** | 31863 | 1911 | 202.5min | **18176** | 18299 | 246 | 167.2min | **SA** |
| Explorador | Padrão | **19050** | 19504 | 480 | 174.4min | **21117** | 22661 | 1892 | 186.6min | **AG** |
| Explorador | Lento | **19050** | 20321 | 1287 | 178.6min | **18176** | 18749 | 477 | 168.6min | **SA** |
| Explorador | Intensivo | **19050** | 19469 | 744 | 174.5min | **18176** | 18176 | 0 | 167.8min | **SA** |
| Intensivo | Padrão | **19050** | 19050 | 0 | 171.8min | **19065** | 19856 | 490 | 174.5min | **AG** |
| Intensivo | Lento | **19050** | 19800 | 1363 | 175.8min | **19050** | 19090 | 79 | 172.6min | **AG** |
| Intensivo | Intensivo | **19050** | 19412 | 629 | 172.7min | **18176** | 18176 | 0 | 167.6min | **SA** |

> **Melhor combo:** AG Explorador + SA Padrão — AG fitness 19050 (72.9% vs FCFS) · SA fitness 21117 (69.9% vs FCFS)

---

## Resumo Geral

| Dataset | Melhor combo | AG Melhor | SA Melhor | FCFS ref | Melhoria AG vs FCFS | Melhoria SA vs FCFS |
|---|---|---:|---:|---:|---:|---:|
| 5 pacientes | AG Padrão + SA Padrão | 435 | 435 | 1285 | **66.1%** | **66.1%** |
| 10 pacientes | AG Padrão + SA Padrão | 2230 | 2230 | 7525 | **70.4%** | **70.4%** |
| 20 pacientes | AG Intensivo + SA Lento | 8639 | 8639 | 31005 | **72.1%** | **72.1%** |
| 30 pacientes | AG Explorador + SA Padrão | 19050 | 21117 | 70264 | **72.9%** | **69.9%** |

---
*Gerado por `node benchmark.js 5`*
