<!-- markdownlint-disable MD013 -->

# TrAcEs — Trilha de Acompanhamento Escolar

**Projeto:** TrAcEs — Trilha de Acompanhamento Estudantil  
**Entregável:** Entregável Parcial 3 (EP3) — MVP Web Funcional  
**Disciplina:** Projeto Integrado 3  
**Instituição:** Universidade Federal do Cariri (UFCA)  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz  
**Data:** 19/08/2026  
**Status do Projeto:** ✅ 100% FUNCIONAL E OPERACIONAL (79 Testes Aprovados · Backend Python 3.12 · Frontend React 18 · SQLite 3 · Swagger UI Live · Clean Architecture 4 Camadas · Monorepo Desacoplado)

---

## 📌 a) Descrição do Projeto

### 1.1 Visão Geral da Aplicação

O **TrAcEs (Trilha de Acompanhamento Escolar)** é uma plataforma digital integrada de gestão acadêmica e acompanhamento pedagógico projetada para aproximar instituições de ensino e lares familiares, promovendo o monitoramento em tempo real do desempenho escolar e assiduidade dos estudantes, com foco na **prevenção precoce da evasão escolar e do baixo rendimento acadêmico**.

### 1.2 Objetivo do Sistema

Oferecer um ambiente digital centralizado, seguro e inclusivo que simplifique a rotina operacional docente (lançamentos de notas em lote, chamadas diárias por tempos de aula e comunicação institucional) e democratize o acesso das famílias às informações escolares dos estudantes através de uma interface web responsiva, acessível e transparente.

### 1.3 Problema que Busca Resolver

Muitas escolas públicas de pequeno porte, projetos comunitários, ONGs e cursos livres enfrentam severos gargalos gerenciais decorrentes do uso de planilhas manuais ou anotações físicas isoladas. Essa dispersão de dados resulta em:

- **Falhas e atrasos no cálculo de médias bimestrais ponderadas** decorrentes de erros manuais em fórmulas de notas.
- **Dificuldade na identificação precoce de padrões de faltas consecutivas** antes que o aluno atinja o limite crítico de reprovação por frequência (LDB 75%).
- **Exclusão digital de familiares e responsáveis** que enfrentam barreiras de acessibilidade ao tentar consultar notas e boletins escolares.
- **Falta de um canal formal de comunicação** com comprovação de leitura para recados, advertências e convocações institucionais.

### 1.4 Público-Alvo

1. **Responsáveis Legais e Familiares:** Mães, pais, tutores e avós que necessitam acompanhar o rendimento escolar, notas de avaliações, histórico de presenças e avisos da escola de múltiplos dependentes em um único acesso.
2. **Corpo Docente (Professores):** Educadores que necessitam de uma ferramenta ágil para registrar avaliações, lançar notas em lote, realizar chamadas diárias por tempos de aula e emitir comunicados segmentados.
3. **Equipes Pedagógicas e Gestores:** Coordenadores e diretores que utilizam indicadores preventivos de infrequência e baixo rendimento para intervenções pedagógicas tempestivas.

### 1.5 Principais Funcionalidades Implementadas

- **Gestão de Múltiplos Dependentes:** Alternância instantânea entre estudantes vinculados (*João Silva*, *Ana Silva*, *Pedro Costa*).
- **Boletim Escolar Anual Consolidado:** Matriz completa dos 4 bimestres com cálculo de aprovação e suporte nativo a impressão física (`@media print`).
- **Notas Detalhadas (100% Somente Leitura):** Discriminação analítica de avaliações com pesos e fórmula pedagógica $\frac{\sum (\text{nota} \times \text{peso})}{\sum \text{peso}}$.
- **Extrato Mensal de Frequência e Calendário Tátil:** Grade de assiduidade de Fevereiro a Dezembro com categorização tátil (`[P]`, `[F]`, `[F*]` justificada) e grade de horários semanais (07:00 às 22:00).
- **Mural de Avisos com Confirmação de Leitura:** Emissão de comunicados institucionais com tags temáticas, remetente formal (`sender_role`) e carimbo de data/hora de leitura pelo responsável.
- **Lançamento Ágil Docente:** Seletores de escopo em cascata, 4 modos de tabela, suporte a campos em branco para bimestres futuros e alternância de presença (`✓ Total ↔ ✖ Limpar`).
- **Barra Universal de Acessibilidade WCAG 2.1 AA:** Tema de Alto Contraste nativo (7:1), redimensionamento proporcional de fontes em `rem` (80% a 140%), Skip Links e gerenciamento ativo de foco.
- **Controle de Acesso RBAC com 3 Modos:** Perfis segregados para Família (`Modo: Pais`), Professor (`Modo: Docente`) e Engenharia (`Modo: Desenvolvedor`).

---

## 🛠️ b) Tecnologias Utilizadas e Justificativas de Engenharia

A seleção da stack tecnológica do **TrAcEs** priorizou confiabilidade, portabilidade, acessibilidade estrita e ausência de dependências proprietárias pesadas:

| Categoria | Tecnologia / Ferramenta | Versão | Justificativa Técnica da Escolha |
| :--- | :--- | :---: | :--- |
| **Linguagem Backend** | **Python** | `3.12+` | Sintaxe expressiva, tipagem estática com `dataclasses` e robustez nativa para implementação pura de Clean Architecture sem dependência de frameworks externos pesados. |
| **Banco de Dados** | **SQLite 3** | `3.x` | Banco relacional embarcado serverless, transacional (ACID), com suporte nativo a chaves estrangeiras (`CASCADE`), restrições `CHECK` e índices de alta performance sem sobrecarga operacional. |
| **Framework Frontend** | **React** | `18.3.1` | Biblioteca declarativa baseada em componentes reativos, permitindo renderização SPA ultrarrápida, controle de estado desacoplado e gerenciamento acessível da DOM. |
| **Linguagem Frontend** | **TypeScript** | `5.x` | Segurança de tipos em tempo de compilação, prevenindo erros de tipagem entre as respostas JSON da API REST e os componentes visuais. |
| **Build Tool / Bundler** | **Vite** | `6.3.5` | Ferramenta de build de última geração com Hot Module Replacement (HMR) instantâneo e geração de bundles de produção otimizados e minificados. |
| **Estilização e Tokens** | **Tailwind CSS** | `v4.0` | Framework CSS utilitário para design system consistente, suporte completo a tokens de acessibilidade, temas de alto contraste e layout responsivo. |
| **Primitivas UI Acessíveis** | **Radix UI Primitives** | `1.x` | Componentes *headless* semânticos em conformidade com WAI-ARIA (Dialog, Select, Dropdown, Tabs, Focus Trap e restauração de foco). |
| **Ícones Semânticos** | **Lucide React** | `0.487.0` | Conjunto leve de ícones vetoriais SVG de alta legibilidade para codificação semântica tripla (cor + ícone + texto). |
| **Especificação de API** | **OpenAPI / Swagger UI** | `3.0.3` | Padronização internacional de documentação de endpoints REST com interface visual interativa para experimentação ao vivo (*Try-it-Out*). |
| **Framework de Testes** | **Pytest** | `9.0.2` | Framework avançado para testes automatizados unitários e de integração com asserções detalhadas e suporte a fixtures. |

---

## 🏗️ c) Estrutura do Projeto e Arquitetura

O sistema adota a **Clean Architecture (4 Camadas no Backend)** e o padrão **MVC (Model-View-Controller)** em um **Monorepo Desacoplado**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│               FRONTEND / VIEW (Single Page Application - React 18)      │
│  - Diretório: frontend/                                                 │
│  - TypeScript 5, Vite 6, Tailwind CSS v4, Lucide Icons, Radix UI        │
│  - 6 Telas: Dashboard, Boletim, Notas Detalhadas, Frequência, Avisos,   │
│    Área Docente (com seletores, notas e chamadas em lote)               │
│  - Acessibilidade Digital: WCAG 2.1 AA (Contraste 7:1, Zoom A+/A-,      │
│    Gerenciamento Ativo de Foco, ARIA Live Regions, Focus Trap)          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Chamadas HTTP REST (JSON)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           BACKEND / CONTROLLER (Camada Presentation - Python 3.12)      │
│  - Diretório: backend/src/presentation/                                 │
│  - Servidor HTTP multithreaded (server.py) na porta 8000                │
│  - Controladores REST (controllers.py): Auth, Parent, Teacher           │
│  - Serializadores JSON (serializers.py) e OpenAPI 3.0.3 (openapi_spec.py│
│  - Documentação viva no Swagger UI (/docs)                              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Invocação de Casos de Uso
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           APPLICATION / USE CASES (Regras de Aplicação)                 │
│  - Diretório: backend/src/application/ (services.py)                    │
│  - ServicosDoAluno: Médias ponderadas, boletins e frequência            │
│  - ServicosSecretaria: Matrículas e vínculos socioafetivos N:N          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Invocação de Entidades
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           DOMAIN / MODEL (Regras de Negócio e Entidades Puras)          │
│  - Diretório: backend/src/domain/ (models.py)                           │
│  - Entidades: Student, Teacher, Parent, Classroom, Assessment, Grade    │
│  - Enums: Bimester, Shift, EducationLevel, AssessmentType               │
│  - Invariantes: Validador algorítmico de CPF e regex de e-mail          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Padrão Repository
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           INFRASTRUCTURE / PERSISTÊNCIA (SQLite 3 Local)                │
│  - Diretório: backend/src/infrastructure/                               │
│  - database.py: DatabaseManager thread-safe e 7 Repositórios SQL        │
│  - schema.sql: 12 Tabelas Físicas, 11 Índices e Constraints CHECK/FKs   │
│  - school.db: Banco de dados relacional embarcado                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Estrutura Oficial de Diretórios do Repositório

```text
pi_3_ep_3_-_v_1/
├── .gitignore                         # Ignora .venv/, node_modules/, dist/, __pycache__/, *.db
├── pytest.ini                         # Configuração unificada do Pytest
├── docs/                              # Histórico de entregáveis e artefatos de engenharia
│   ├── swagger.html                   # Interface visual da documentação OpenAPI/Swagger
│   ├── assets/                        # Diagramas e prints de telas
│   ├── pi2-ep2/                       # Artefatos da Etapa 2 (Banco de Dados / CLI)
│   ├── pi2-ep3/                       # Artefatos da Etapa 2 (Protótipo Funcional)
│   ├── pi3-ep1/                       # Artefatos da Etapa 3 (Engenharia de Requisitos)
│   ├── pi3-ep2/                       # Artefatos da Etapa 3 (Modelo Arquitetural)
│   └── pi3-ep3-atual/                 # Artefatos da sprint corrente
│
├── backend/                           # Servidor Python sob Clean Architecture
│   ├── main.py                        # Ponto de entrada do servidor REST / CLI
│   ├── requirements.txt               # Dependências do backend (pytest, etc.)
│   │
│   ├── scripts/                       # SCRIPTS DE DEMONSTRAÇÃO E VALIDAÇÃO INTERATIVA
│   │   ├── run_swagger_live_tests.py      # Relatório interativo de operações Swagger
│   │   ├── test_crud_demonstracao.py      # Demonstração completa das operações CRUD
│   │   ├── test_swagger_api_live.py       # Validador de 100% dos endpoints HTTP ao vivo
│   │   └── test_swagger_db_persistence.py # Verificador de consistência física no SQLite
│   │
│   ├── src/                           # CÓDIGO-FONTE DO BACKEND (4 CAMADAS)
│   │   ├── __init__.py
│   │   ├── utils.py                   # Validadores de CPF, e-mail e regras de entrada
│   │   ├── domain/                    # [MODEL] Entidades puras e Enums de negócio
│   │   │   ├── __init__.py
│   │   │   └── models.py              # Student, Teacher, Parent, Classroom, Grade, Attendance
│   │   ├── application/               # [USE CASES] Casos de uso e orquestração
│   │   │   ├── __init__.py
│   │   │   └── services.py            # ServicosDoAluno, ServicosSecretaria
│   │   ├── infrastructure/            # [PERSISTÊNCIA] Banco de dados e Repositórios
│   │   │   ├── __init__.py
│   │   │   ├── database.py            # DatabaseManager e os 7 Repositórios SQL
│   │   │   ├── schema.sql             # DDL de criação das 11 tabelas e índices
│   │   │   └── school.db              # Banco SQLite de persistência local (*.db ignorado no git)
│   │   └── presentation/              # [CONTROLLER] Controladores e rotas da API REST
│   │       ├── __init__.py
│   │       ├── api.py                 # Instanciação da API e políticas de CORS
│   │       ├── controllers.py         # Handlers dos endpoints (Auth, Docente, Responsável)
│   │       ├── serializers.py         # Formatação JSON (Decimal, ISO-8601, Enums)
│   │       ├── server.py              # Servidor HTTP multithreaded
│   │       ├── openapi_spec.py        # Especificação OpenAPI 3.0.3
│   │       └── seed_data.py           # Carga inicial de dados de demonstração
│   │
│   └── tests/                         # SUÍTE AUTOMATIZADA DO PYTEST (79 TESTES)
│       ├── __init__.py
│       ├── unit/                      # Testes unitários (40 testes)
│       │   ├── test_cpf_validation.py # Validação algorítmica de CPF (6 testes)
│       │   ├── test_entities.py       # Regras de entidades e modelos (30 testes)
│       │   └── test_passing_grade.py  # Regras de aprovação escolar (3 testes)
│       └── integration/               # Testes de integração com SQLite e API (39 testes)
│           ├── test_api_endpoints.py          # Contratos dos endpoints REST (17 testes)
│           ├── test_2nd_bimester_launch.py    # Lançamento e cálculo do 2º bimestre (1 teste)
│           ├── test_4_bimesters_launch.py     # Fechamento anual dos 4 bimestres (1 teste)
│           ├── test_integrity.py              # Integridade relacional e foreign keys (5 testes)
│           └── test_manual_repositories.py    # Operações diretas nos repositórios (16 testes)
│
└── frontend/                          # [VIEW] Client SPA React 18 + Vite + TypeScript
    ├── package.json                   # Dependências e scripts do Node.js
    ├── vite.config.ts                 # Configuração do bundler Vite
    ├── postcss.config.mjs             # Configuração de processamento do Tailwind CSS
    ├── default_shadcn_theme.css       # Tokens e variáveis do Shadcn UI
    ├── ATTRIBUTIONS.md                # Licenças e atribuições de ativos
    ├── guidelines/                    # Diretrizes de design do projeto
    ├── public/                        # Ativos públicos e imagens da aplicação
    │   ├── docs/                      # Documentação técnica na íntegra sincronizada
    │   ├── img/                       # Centralização exclusiva de imagens vetoriais SVG
    │   │   ├── avatar-docente.svg
    │   │   ├── avatar-estudante.svg
    │   │   ├── avatar-integrante.svg
    │   │   ├── banner-trilha.svg
    │   │   └── logo-traces.svg
    │   └── swagger.html               # Visualizador estático Swagger UI
    ├── index.html                     # Ponto de entrada HTML5 com viewport acessível
    └── src/
        ├── main.tsx                   # Bootstrap da aplicação React
        ├── types/                     # [CONTRATOS] Tipagem estática da API REST (api.ts)
        ├── services/                  # [CLIENTE HTTP] Chamadas assíncronas para a API (api.ts)
        ├── styles/                    # Folhas de estilo (globals.css, fonts.css, theme.css)
        └── app/
            ├── App.tsx                # Orquestrador de telas, rotas e acessibilidade WCAG
            └── components/
                ├── figma/             # ImageWithFallback e componentes auxiliares
                └── ui/                # 48 primitivas acessíveis Radix / Shadcn UI
```

### 3.2 Justificativa Técnica da Coexistência das Pastas `docs/` e `frontend/public/docs/`

A existência das duas pastas `pi3-ep3-atual` ocorre devido ao funcionamento de aplicações web estáticas (**React + Vite**) e cumpre finalidades distintas e complementares:

#### 📂 1. `docs/pi3-ep3-atual/` (Na Raiz do Repositório)

- **Função:** **Fonte da Verdade da Documentação Técnica Oficial**.
- **Objetivo:** É o repositório principal de documentação do projeto, versionado no Git para leitura no GitHub, avaliação acadêmica e consultas no editor de código.
- **Quem consome:** Os desenvolvedores, os avaliadores e a documentação do repositório.

#### 🌐 2. `frontend/public/docs/pi3-ep3-atual/` (Dentro de `frontend/public/`)

- **Função:** **Ativos Estáticos Públicos Servidos pelo Vite**.
- **Objetivo:** O Vite só disponibiliza arquivos para o navegador via requisições HTTP (`fetch()`) se eles estiverem dentro do diretório `public/`.
- **Quem consome:** A tela **Modo Desenvolvedor $\rightarrow$ Documentação Técnica** dentro da própria SPA React (`App.tsx`), que executa:

```typescript
// Trecho em frontend/src/app/App.tsx:
const response = await fetch(`/docs/pi3-ep3-atual/${docKey}`);
const text = await response.text();
```

Isso permite que qualquer usuário/avaliador abra a aplicação no navegador em `http://localhost:5173` e leia todos os 8 documentos técnicos renderizados com formatação Markdown e LaTeX diretamente pela interface gráfica.

#### 💡 Tabela Comparativa e Sincronização Criptográfica

| Diretório | Natureza | Papel | Hash SHA-256 |
| :--- | :--- | :--- | :---: |
| **`docs/pi3-ep3-atual/`** | Documentação do Repositório | **Fonte da Verdade** oficial do projeto (arquivos mestre). | ✅ 100% Sincronizado |
| **`frontend/public/docs/pi3-ep3-atual/`** | Ativo Estático da Web | **Cópia de Distribuição** para o leitor de documentação da interface web React. | ✅ 100% Sincronizado |

---

## 🚀 d) Instalação e Execução do Projeto

### 4.1 Pré-requisitos de Ambiente

> **Para avaliação completa (Interface Web + API):** **Node.js 18+** (com gerenciador `npm`) e **Python 3.10+** (recomendado `3.12+`).

- **Node.js:** Versão `18.x` ou superior (com gerenciador `npm` para execução do Frontend SPA).
- **Python:** Versão `3.10` ou superior (para o servidor RESTful e suíte de testes no Backend).
- **Git:** Para clonagem e versionamento do repositório.

### 4.2 Passo a Passo de Instalação e Configuração

#### 1. Configuração do Backend (Python 3.12)

Em um terminal aberto na raiz do projeto:

```powershell
# 1. Criar e ativar o ambiente virtual:
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (Git Bash):
source .venv/Scripts/activate
# Linux/macOS:
source .venv/bin/activate

# 2. Acessar a pasta do backend:
cd backend

# 3. Instalar as dependências do Python:
pip install -r requirements.txt

# 4. Iniciar o servidor da API REST (modo contínuo na porta 8000):
python main.py

# (Opcional) Executar simulação de demonstração no terminal:
python main.py --demo
```

#### 2. Configuração do Frontend SPA (React 18 + Vite)

Em um **segundo terminal** aberto na raiz do projeto:

```powershell
# 1. Acessar a pasta do frontend:
cd frontend

# 2. Instalar as dependências do Node.js:
npm install

# 3. Compilar o bundle de produção (validação estática de TypeScript):
npm run build

# 4. Iniciar o servidor de desenvolvimento Vite:
npm run dev
```

### 4.3 Acesso ao Sistema e URLs Homologadas

Após a inicialização dos dois serviços, os seguintes acessos estarão disponíveis no navegador:

- **Aplicação Web Principal (Frontend SPA):** `http://localhost:5173`
- **Documentação Interativa Swagger UI:** `http://127.0.0.1:8000/docs`
- **Especificação OpenAPI JSON:** `http://127.0.0.1:8000/openapi.json`
- **Diagnóstico do Servidor (Healthcheck):** `http://127.0.0.1:8000/api/health`

---

## 🧪 4.4 Garantia da Qualidade e Suíte de Testes

O projeto conta com **79 testes automatizados** executados via `pytest` com 100% de aprovação:

```powershell
# Execução a partir da raiz:
python -m pytest

# Ou execução dentro da pasta backend:
cd backend
python -m pytest tests
```

### Resultado da Suíte de Testes:

```text
============================= test session starts =============================
platform win32 -- Python 3.12.6, pytest-9.0.2, pluggy-1.6.0
rootdir: C:\Users\Dayson\Documents\pi_3_ep_3_-_v_1
configfile: pytest.ini
testpaths: backend/tests
plugins: anyio-4.14.2
collected 79 items

backend\tests\integration\test_2nd_bimester_launch.py .                  [  1%]
backend\tests\integration\test_4_bimesters_launch.py .                   [  2%]
backend\tests\integration\test_api_endpoints.py .................        [ 24%]
backend\tests\integration\test_integrity.py .....                        [ 30%]
backend\tests\integration\test_manual_repositories.py ................   [ 50%]
backend\tests\unit\test_cpf_validation.py ......                         [ 58%]
backend\tests\unit\test_entities.py ..............................       [ 96%]
backend\tests\unit\test_passing_grade.py ...                             [100%]

============================= 79 passed in 3.15s ==============================
```

### Justificativa Técnica do `pytest.ini` na Raiz do Repositório

A manutenção do arquivo de configuração [`pytest.ini`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/pytest.ini) na raiz do monorepo é uma decisão de engenharia fundamentada em 3 pilares técnicos:

1. **Proteção e Isolamento do Frontend:** A diretiva `norecursedirs = .venv node_modules frontend .git` impede que o mecanismo de descoberta do Pytest escaneie recursivamente a pasta do React/Node.js, evitando a criação indevida de caches temporários (`.pytest_cache`) dentro de `frontend/`.
2. **Resolução Universal de Imports com `pythonpath = backend`:** Ao registrar o diretório `backend` no `sys.path`, o Python resolve nativamente as importações absolutas (`from src.domain import ...`, `from src.application import ...`) tanto na execução do Pytest quanto em scripts avulsos, eliminando conflitos de caminhos relativos.
3. **Padrão Monorepo e Avaliação Acadêmica Direta:** Permite que avaliadores, professores e ferramentas de Integração Contínua (CI/CD) executem a suíte completa de **79 testes de primeira diretamente a partir da raiz** (`python -m pytest`), sem exigir navegação prévia entre diretórios (`cd backend`).

---

## 👥 e) Processo de Desenvolvimento do MVP (Sprint EP3)

### 5.1 Divisão de Tarefas na Equipe Discente

O desenvolvimento do MVP do **TrAcEs** foi conduzido em regime colaborativo de *Pair Programming* e divisão especializada de responsabilidades entre os estudantes:

- **Antonio Alex Dayson Tomaz:**
  - **Foco Técnico:** Arquitetura do Backend em Clean Architecture (4 Camadas), modelagem relacional do SQLite 3 (`schema.sql`), implementação dos 7 repositórios SQL transacionais e motor de cálculo pedagógico ponderado (`services.py`).
  - **Exposição da API:** Desenvolvimento do servidor multithreaded assíncrono nativo (`server.py`), controladores REST (`controllers.py`), serializadores e especificação OpenAPI 3.0.3 / Swagger UI (`openapi_spec.py`).
  - **Qualidade e Testes:** Estruturação da suíte de 79 testes automatizados no Pytest e scripts operacionais de validação ao vivo.
- **Maria Alexsandra Tomaz:**
  - **Foco Técnico:** Desenvolvimento da interface Single Page Application (SPA) em React 18 com TypeScript e Tailwind CSS v4, integrando as 6 telas e 5 modais de diálogo.
  - **Engenharia de Acessibilidade e Usabilidade:** Implementação das diretrizes WCAG 2.1 AA (Barra de Acessibilidade, tema de Alto Contraste nativo 7:1, zoom em `rem` de 80% a 140%, Skip Links e gerenciamento ativo de foco) e aplicação das 10 Heurísticas de Nielsen.
  - **Documentação e Engenharia de Requisitos:** Redação e auditoria dos relatórios técnicos, matriz de rastreabilidade de requisitos e documentação acadêmica da disciplina.

### 5.2 Uso do GitHub e Estratégia de Versionamento

- **Repositório Centralizado:** Controle de versão hospedado no GitHub para rastreabilidade de todas as alterações do código-fonte e documentos.
- **Fluxo de Branches (Feature Branching):**
  - `main`: Branch estável contendo os entregáveis oficiais homologados.
  - `feature/clean-architecture-4-layers`: Reestruturação do backend nas camadas `domain`, `application`, `infrastructure` e `presentation`.
  - `feature/frontend-wcag-accessibility`: Implementação dos recursos de acessibilidade e integração dos 3 modos RBAC.
  - `feature/swagger-live-tests`: Implementação dos testes e documentação OpenAPI 3.0.3.
- **Commits Semânticos:** Adoção de prefixos padronizados para histórico legível (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **Rastreabilidade de Entregáveis:** Organização cronológica das entregas em pastas versionadas (`pi2-ep2/`, `pi2-ep3/`, `pi3-ep1/`, `pi3-ep2/`, `pi3-ep3-atual/`).

### 5.3 Dificuldades Encontradas Durante a Sprint EP3

1. **Separação Estrita de Camadas sem Frameworks Pesados:** O desafio de implementar um servidor HTTP REST multithreaded nativo em Python 3.12 sem recorrer a frameworks pesados (como Django ou FastAPI), mantendo a independência absoluta das regras de domínio (`models.py`) e orquestração (`services.py`).
2. **Cálculo de Médias com Pesos Variáveis e Campos Futuros em Branco:** Lidar com cenários reais onde professores criam avaliações com pesos distintos (ex: pesos 1.5, 2.0, 3.0) e bimestres futuros (3º e 4º) ainda não foram lançados, exigindo que o sistema diferencie "nota zero" de "campo não avaliado" (`""` / `None`), evitando distorções no cálculo da média anual.
3. **Acessibilidade Digital Estrita em SPA (WCAG 2.1 AA):** Garantir que transições de tela assíncronas em React sem recarga de página fossem anunciadas por leitores de tela (ARIA Live Regions) e que a navegação por teclado não ficasse perdida na DOM (Focus Trap em modais e foco programático em `<main id="main-content">`).
4. **Sincronização de Leitura de Avisos com Preservação de Layout:** Implementar a confirmação de leitura instantânea pelo responsável que sincroniza fisicamente no SQLite e atualiza a badge visual para `✓ Lido`, sem que a tela do docente sofra quebras de paginação.

### 5.4 Soluções Adotadas de Engenharia

1. **Camada de Apresentação Desacoplada (`src/presentation/`):** Criação de uma camada dedicada contendo `server.py`, `controllers.py` e `serializers.py` que traduz payloads JSON em tipos nativos do Python (Decimal, date, Enums) antes de invocar a camada de aplicação.
2. **Modelo Híbrido de Avaliação e Suporte a Strings Vazias:** Implementação de normalização robusta no frontend e backend que trata strings vazias (`""`) como ausência de registro (`None`), permitindo que a média ponderada calcule apenas sobre os pesos efetivamente avaliados e exiba `"— Sem registro"` nos bimestres futuros.
3. **Hooks Customizados de Acessibilidade:** Desenvolvimento de hooks e componentes reutilizáveis (`useFocusTrap`, `useAccessibilityAnnouncer`, `SkipLinks`) integrados ao ciclo de vida do React, com listener automático para `prefers-contrast: more` e `prefers-reduced-motion`.
4. **Endpoint Específico de Confirmação de Leitura (`POST /api/parent/announcements/{id}/read`):** Gravação atômica de `is_read = 1` e `read_at = datetime.now()` no SQLite com atualização otimista na interface React.

---

## 🌐 6. Componente Extensionista e Impacto Social

O **TrAcEs** foi concebido não apenas como um projeto acadêmico, mas como uma ferramenta de utilidade social e extensão comunitária:

### 1. Escolas de Pequeno Porte e Cursos Livres

Permite a digitalização imediata do histórico escolar de pequenas escolas e centros educacionais do interior (como a região do Cariri cearense), eliminando o extravio de diários físicos e garantindo boletins confiáveis com cálculo automático de médias ponderadas.

### 2. ONGs e Projetos Socioeducativos

Projetos sociais que oferecem reforço escolar e atividades no contraturno necessitam comprovar a assiduidade dos alunos perante financiadores e conselhos tutelares. O extrato de frequência detalhado com categorização de faltas justificadas profissionaliza essa prestação de contas.

### 3. Inclusão Digital de Famílias

A conformidade estrita com as diretrizes **WCAG 2.1 Nível AA** assegura que mães, pais e avós com diferentes graus de letramento digital ou deficiências visuais consigam acompanhar o rendimento escolar dos filhos sem barreiras cognitivas ou visuais.

---

## ♿ 7. Acessibilidade Digital SPA (WCAG 2.1 Nível AA e Nielsen)

A aplicação SPA foi integralmente auditada e atende rigorosamente aos critérios de acessibilidade:

1. **Barra de Acessibilidade Fixa (`sticky top-0 z-50`):** Permanece permanentemente visível no topo de todas as telas com controles de Alto Contraste, aumento e redução de fonte (A+/A-) e Skip Link (`Saltar para o Conteúdo Principal`).
2. **Gerenciamento Ativo de Foco:** Foco programático restaurado após cada transição de tela e após o fechamento de modais.
3. **ARIA Live Regions (`role="status"`, `aria-live="polite"`):** Anúncio em tempo real para tecnologias assistivas de mensagens de sucesso, confirmações de leitura e retornos de validação.
4. **Alvos Mínimos de Toque de 44×44px:** Todos os botões, links e campos interativos respeitam o padrão mínimo de acessibilidade motora.
5. **Suporte a Preferências do Sistema:** Classes utilitárias que respeitam automaticamente `prefers-reduced-motion` e `prefers-contrast`.

---

## 🏆 8. Conclusão

O **TrAcEs (EP3)** cumpre com rigor acadêmico todos os critérios de qualidade de software:

1. **Funcionalidade:** MVP Web completo com sincronização instantânea entre professor e família.
2. **Arquitetura:** Clean Architecture desacoplada em 4 camadas (`domain`, `application`, `infrastructure`, `presentation`) com persistência transacional em SQLite 3.
3. **Padrões de Mercado:** API RESTful OpenAPI 3.0.3 com Swagger UI interativo.
4. **Inclusão:** Acessibilidade universal WCAG 2.1 AA e Usabilidade Heurística de Nielsen.
5. **Confiabilidade:** 100% dos 79 testes automatizados aprovados no Pytest.
