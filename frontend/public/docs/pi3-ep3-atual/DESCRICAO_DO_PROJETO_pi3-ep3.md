<!-- markdownlint-disable MD013 -->

# Descrição do Projeto — TrAcEs (MVP Web Funcional EP3)

**Projeto:** TrAcEs — Trilha de Acompanhamento Estudantil  
**Entregável:** Entregável Parcial 3 (EP3) — Inventário do Software, Métricas e Componentes  
**Disciplina:** Projeto Integrado 3  
**Instituição:** Universidade Federal do Cariri (UFCA)  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz  
**Data:** 19/08/2026  
**Status do Projeto:** ✅ 100% CONCLUÍDO E HOMOLOGADO (79 Testes Aprovados · Backend RESTful · Frontend SPA React 18 · SQLite 3 · Swagger UI Live · Clean Architecture 4 Camadas · Monorepo Desacoplado)

---

## 1. Visão Geral do Sistema

O **TrAcEs (Trilha de Acompanhamento Escolar)** é uma aplicação Web de alta fidelidade e acessibilidade prática voltada à gestão pedagógica e comunicação entre escolas e famílias. O sistema integra a rotina do professor (lançamento em lote, chamadas diárias, criação/edição de avaliações e gestão de avisos) ao monitoramento familiar (boletins dos 4 bimestres, extrato tátil de presença, notas detalhadas somente leitura e mural de avisos com confirmação de leitura instantânea).

- **Linguagens e Tecnologias:** Python 3.12, TypeScript 5, React 18, Vite 6, Tailwind CSS v4, SQLite 3.
- **Padrões Arquiteturais:** Clean Architecture em 4 Camadas (Backend), MVC, SPA (Frontend), Repository Pattern, RESTful API com OpenAPI 3.0.3.
- **Suíte de Testes:** 79 testes automatizados no `pytest` (100% de sucesso).
- **Documentação de API:** Swagger UI interativo live em `http://localhost:5173/docs` (ou direto em `:8000/docs`) cobrindo 18 endpoints RESTful.

---

## 2. Árvore Completa de Diretórios do Workspace

```text
pi_3_ep_3_-_v_1/
├── .gitignore                                 # Ignora .venv/, node_modules/, dist/, __pycache__/, *.db
├── pytest.ini                                 # Configuração unificada do Pytest
│
├── backend/                                   # BACKEND EM CLEAN ARCHITECTURE (PYTHON 3.12)
│   ├── main.py                                # Ponto de entrada do backend REST / CLI
│   ├── requirements.txt                       # Dependências Python documentadas
│   │
│   ├── scripts/                               # SCRIPTS DE DEMONSTRAÇÃO E TESTES AO VIVO
│   │   ├── run_swagger_live_tests.py          # Relatório interativo de operações Swagger
│   │   ├── test_crud_demonstracao.py          # Demonstração completa das operações CRUD
│   │   ├── test_swagger_api_live.py           # Validador de 100% dos endpoints HTTP ao vivo
│   │   └── test_swagger_db_persistence.py     # Verificador de consistência física no SQLite
│   │
│   ├── src/                                   # CÓDIGO-FONTE DO BACKEND (4 CAMADAS)
│   │   ├── __init__.py                        # Inicializador do pacote raiz
│   │   ├── utils.py                           # Validação de CPF, e-mail e regras de entrada
│   │   │
│   │   ├── domain/                            # [MODEL] CAMADA DE DOMÍNIO & REGRAS PURAS
│   │   │   ├── __init__.py                    # Exportações de domínio
│   │   │   └── models.py                      # Entidades (Student, Teacher, Parent, etc.) e Enums
│   │   │
│   │   ├── application/                       # [USE CASES] CAMADA DE APLICAÇÃO & CASOS DE USO
│   │   │   ├── __init__.py                    # Exportações de serviços
│   │   │   └── services.py                    # ServicosDoAluno e ServicosSecretaria
│   │   │
│   │   ├── infrastructure/                    # [PERSISTÊNCIA] CAMADA DE INFRAESTRUTURA
│   │   │   ├── __init__.py                    # Exportações de infraestrutura
│   │   │   ├── database.py                    # DatabaseManager e 7 Repositórios SQL transacionais
│   │   │   ├── schema.sql                     # DDL SQLite: 12 tabelas físicas e 11 índices
│   │   │   └── school.db                      # Banco de dados relacional embarcado SQLite 3 (*.db ignorado no git)
│   │   │
│   │   └── presentation/                      # [CONTROLLER] CAMADA DE APRESENTAÇÃO & API REST
│   │       ├── __init__.py                    # Exportador do módulo de apresentação
│   │       ├── api.py                         # Instanciação da API e CORS
│   │       ├── server.py                      # Servidor HTTP multithreaded (18 rotas)
│   │       ├── controllers.py                 # AuthController, ParentController, TeacherController
│   │       ├── openapi_spec.py                # Especificação OpenAPI 3.0.3 e Swagger UI
│   │       ├── serializers.py                 # Serialização customizada para JSON
│   │       └── seed_data.py                   # Carga inicial de dados pedagógicos (Seed Data)
│   │
│   └── tests/                                 # SUÍTE DE TESTES AUTOMATIZADOS (PYTEST - 79 TESTES)
│       ├── __init__.py
│       ├── unit/                              # Testes unitários (40 testes)
│       │   ├── test_cpf_validation.py         # Validação de CPFs com dígitos verificadores
│       │   ├── test_entities.py               # Testes unitários das entidades e invariantes
│       │   └── test_passing_grade.py          # Regras pedagógicas de aprovação
│       └── integration/                       # Testes de integração com SQLite e API (39 testes)
│           ├── test_api_endpoints.py          # Testes de contrato dos 18 endpoints REST
│           ├── test_2nd_bimester_launch.py    # Lançamento e cálculo do 2º bimestre
│           ├── test_4_bimesters_launch.py     # Fechamento anual dos 4 bimestres
│           ├── test_integrity.py              # Integridade relacional e foreign keys
│           └── test_manual_repositories.py    # Operações diretas nos repositórios SQL
│
├── frontend/                                  # [VIEW] FRONTEND SPA REACT 18
│   ├── index.html                             # Entrypoint HTML5 semântico com meta tags e fontes
│   ├── package.json                           # Dependências (React 18, Vite 6, Tailwind v4, Radix, Lucide)
│   ├── vite.config.ts                         # Configuração do Vite com host: true e proxy (/api, /docs, /openapi.json)
│   ├── postcss.config.mjs                     # Processamento de estilos Tailwind CSS
│   ├── default_shadcn_theme.css               # Variáveis e temas do Shadcn UI
│   ├── ATTRIBUTIONS.md                        # Licenças e atribuições de ativos
│   ├── guidelines/                            # Diretrizes de design do projeto
│   ├── public/                                # Ativos públicos da aplicação
│   │   ├── docs/                              # Documentação técnica espelhada
│   │   ├── img/                               # Centralização exclusiva de imagens vetoriais SVG
│   │   │   ├── avatar-docente.svg
│   │   │   ├── avatar-estudante.svg
│   │   │   ├── avatar-integrante.svg
│   │   │   ├── banner-trilha.svg
│   │   │   └── logo-traces.svg
│   │   └── swagger.html                       # Visualizador estático Swagger UI
│   └── src/
│       ├── main.tsx                           # Ponto de montagem da raiz React
│       ├── app/
│       │   ├── App.tsx                        # Componente mestre com as 6 telas e acessibilidade WCAG
│       │   └── components/                    # Primitivas acessíveis Radix / Shadcn UI
│       ├── services/
│       │   └── api.ts                         # Cliente HTTP assíncrono tipado com a API REST
│       ├── types/
│       │   └── api.ts                         # Interfaces e tipos TypeScript correspondentes aos contratos
│       └── styles/
│           ├── globals.css                    # Design System, tokens Tailwind e modo Alto Contraste
│           └── theme.css                      # Variáveis de tema e cores acessíveis
│
└── docs/                                      # DOCUMENTAÇÃO TÉCNICA OFICIAL DO PROJETO
    ├── swagger.html                           # Interface visual da documentação OpenAPI/Swagger
    ├── assets/                                # Diagramas e prints de telas
    ├── pi2-ep2/                               # Artefatos da Etapa 2 (Banco de Dados / CLI)
    ├── pi2-ep3/                               # Artefatos da Etapa 2 (Protótipo Funcional)
    ├── pi3-ep1/                               # Artefatos da Etapa 3 (Engenharia de Requisitos)
    ├── pi3-ep2/                               # Artefatos da Etapa 3 (Modelo Arquitetural)
    └── pi3-ep3-atual/                         # Documentação técnica completa da sprint corrente
        ├── EP3_INDICE.md                      # Sumário executivo e catálogo de navegação
        ├── EP3_README.md                      # Guia mestre de instalação, execução e visão geral
        ├── EP3_ARQUITETURA.md                 # Especificação arquitetural e manual da API
        ├── DESCRICAO_DO_PROJETO_pi3-ep3.md    # Este documento de inventário físico e volumetria
        ├── RELATORIO_ATENDIMENTO_REQUISITOS-pi3-ep3.md # Matriz de conformidade dos requisitos
        ├── RELATORIO_MVP_WEB_FUNCIONAL.md     # Relatório executivo de entrega e testes
        ├── relatorio_tecnologias_frontend_projeto.md # Especificação do ecossistema Frontend SPA
        └── relatorio-arquitetura-ep3-v1.txt   # Síntese arquitetural em texto ASCII puro
```

---

## 3. Inventário Físico e Volumetria de Código

```text
VOLUMETRIA DO CÓDIGO-FONTE (EP3):
├── Backend Python (backend/src/ e backend/scripts/): ~3.800 linhas de código
├── Frontend TypeScript/React (frontend/src/): ~4.200 linhas de código
├── Suíte de Testes Automatizados (backend/tests/): ~1.800 linhas (79 testes)
├── Documentação Técnica (docs/pi3-ep3-atual/): ~2.500 linhas de documentação
└── Banco de Dados (SQLite 3): 12 tabelas normalizadas, 11 índices
```

---

## 4. Conclusão do Inventário

A estrutura de diretórios e o inventário de arquivos confirmam a integridade e conformidade absoluta do sistema **TrAcEs (EP3)** com os princípios de **Clean Architecture (4 Camadas)**, separação **MVC** e organização canônica em **Monorepo Desacoplado**.
