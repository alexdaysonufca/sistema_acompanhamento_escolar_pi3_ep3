<!-- markdownlint-disable MD013 -->

# Entregável Parcial 3 (EP3) — MVP Web Funcional Integrado

**Projeto:** TrAcEs — Trilha de Acompanhamento Estudantil  
**Entregável:** Modelo MVP (Minimum Viable Product) Web Funcional  
**Disciplina:** Projeto Integrado 3  
**Instituição:** Universidade Federal do Cariri (UFCA)  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz  
**Data:** 19/08/2026  
**Status do Projeto:** ✅ 100% CONCLUÍDO E HOMOLOGADO (79 Testes Aprovados · Backend RESTful · Frontend SPA React 18 · SQLite 3 · Swagger UI Live)

---

## 📦 1. O Que É o Entregável Parcial 3 (EP3)

O **Entregável Parcial 3 (EP3)** concretiza a evolução integral do projeto **TrAcEs**, entregando uma **Aplicação Web Completa e Funcional de Alta Fidelidade**, orientada a Acessibilidade (WCAG 2.1 AA) e Usabilidade (10 Heurísticas de Nielsen), com arquitetura desacoplada Cliente-Servidor.

### 🌟 Pilares do MVP Web Entregue

1. **Backend em Clean Architecture 4 Camadas (Python 3.12 em `backend/`):**
   - Camadas estritas de **Domínio** (`src/domain/models.py`), **Aplicação** (`src/application/services.py`), **Infraestrutura** (`src/infrastructure/database.py`) e **Apresentação / API REST** (`src/presentation/server.py`, `src/presentation/controllers.py`, `src/presentation/openapi_spec.py`).
   - Persistência física em **SQLite 3** transacional (`src/infrastructure/schema.sql` com 12 tabelas e 11 índices).
   - Validações invariantes no domínio (CPFs com cálculo de dígitos verificadores, notas entre 0.0 e 10.0, e-mails formatados).
2. **API RESTful Nativa & Swagger UI Live (OpenAPI 3.0.3):**
   - Servidor HTTP nativo assíncrono com suporte a CORS e tratamento global de erros em JSON.
   - **18 Endpoints Documentados e Funcionais** acessíveis interativamente em `http://localhost:5173/docs` (ou direto em `:8000/docs`).
   - Suporte a operações de Consulta (`GET`), Criação (`POST`) e Atualização (`PUT`).
3. **Frontend SPA de Alta Fidelidade (React 18 + TypeScript 5 + Vite 6 + Tailwind CSS v4 em `frontend/`):**
   - Interface com 10 telas dinâmicas cobrindo 3 Modos RBAC: *Pais* (Dashboard, Boletim, Notas, Frequência, Avisos), *Docente* (Lançamento em lote, chamada dinâmica e avisos) e *Desenvolvedor* (**1. Documentação da API**, **2. Documentação Técnica** com diagramas Mermaid e syntax highlighting JSON, **3. Integrantes** e **4. Sobre**).
   - **Controle de Acesso Baseado em Papéis (RBAC):** Alternância instantânea de perfis (Responsável, Docente e Desenvolvedor).
   - Suporte aos **3 Dependentes da Família:** *João Silva Oliveira* (ID 1), *Ana Silva Oliveira* (ID 2) e *Pedro Costa Santos* (ID 3).
   - **Área do Docente Avançada:** 5 seletores de escopo, 5 modos de tabela acadêmica, botão de coluna alternável `✓ Total` $\leftrightarrow$ `✖ Limpar`, botão `+ Adicionar Avaliação para a Turma`, botão `✏️ Editar Avaliação` e botão `+ Novo Aviso / Comunicado`.
4. **Garantia de Qualidade e Acessibilidade:**
   - Suíte de **79 Testes Automatizados no pytest** (100% de sucesso em ~3.0s).
   - Barra de Acessibilidade com Alto Contraste nativo (7:1), zoom A+/A- (80% a 140%), Skip Links, codificação semântica tripla e Heurística #7 com cópia instantânea de código.

---

## 🗂️ 2. Catálogo da Documentação Técnica (`docs/pi3-ep3-atual/`)

Todos os documentos deste diretório foram auditados e atualizados para refletir o estado do software:

| Documento | Descrição e Finalidade Técnica | Links Clicáveis |
| :--- | :--- | :--- |
| **`EP3_INDICE.md`** | **Este documento:** Sumário executivo, catálogo e guia de navegação do EP3. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/EP3_INDICE.md) |
| **`EP3_README.md`** | Guia mestre de instalação, execução, arquitetura e componente extensionista. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/EP3_README.md) |
| **`EP3_ARQUITETURA.md`** | Especificação técnica arquitetural, manual da API REST (18 endpoints) e diagramas Mermaid. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/EP3_ARQUITETURA.md) |
| **`DESCRICAO_DO_PROJETO_pi3-ep3.md`** | Inventário físico completo, árvore de diretórios, contagem de linhas e volumetria. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/DESCRICAO_DO_PROJETO_pi3-ep3.md) |
| **`RELATORIO_ATENDIMENTO_REQUISITOS-pi3-ep3.md`** | Relatório de conformidade integral com os requisitos acadêmicos e pedagógicos do EP3. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/RELATORIO_ATENDIMENTO_REQUISITOS-pi3-ep3.md) |
| **`RELATORIO_MVP_WEB_FUNCIONAL.md`** | Relatório executivo de entrega do MVP, validação dos 79 testes e evidências. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/RELATORIO_MVP_WEB_FUNCIONAL.md) |
| **`relatorio_tecnologias_frontend_projeto.md`** | Especificação do ecossistema React 18, Vite 6, Tailwind v4, WCAG 2.1 AA e Nielsen. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/relatorio_tecnologias_frontend_projeto.md) |
| **`relatorio-arquitetura-ep3-v1.txt`** | Síntese textual da arquitetura de software em ASCII para leitura rápida. | [Ver Arquivo](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/relatorio-arquitetura-ep3-v1.txt) |

---

## 📊 3. Métricas e Estatísticas Consolidadas do Sistema

```text
MÉTRICAS DO SISTEMA (EP3):
├── Testes Automatizados no pytest: 79 (100% de aprovação)
├── Endpoints na API RESTful: 18 (OpenAPI 3.0.3 / Swagger UI Live)
├── Tabelas Físicas no SQLite 3: 12 tabelas normalizadas
├── Índices Relacionais SQL: 11 índices de performance
├── Telas no Frontend SPA: 6 telas interativas de alta fidelidade
├── Estudantes Dependentes Vinculados: 3 (João Silva, Ana Silva, Pedro Costa)
├── Diretrizes de Acessibilidade Atendidas: WCAG 2.1 Nível AA (Contraste 7:1)
└── Princípios de Usabilidade Aplicados: 10 Heurísticas de Jakob Nielsen
```

---

## 🎯 4. Matriz de Endpoints da API RESTful (Swagger UI Live)

| Módulo | Método | Rota | Descrição Funcional | Status |
| :--- | :---: | :--- | :--- | :---: |
| **Sistema** | `GET` | `/api/health` | Healthcheck e diagnóstico do servidor | ✅ Ativo |
| **Autenticação** | `POST` | `/api/auth/login` | Login com geração de sessão e perfil RBAC | ✅ Ativo |
| **Responsável** | `GET` | `/api/parent/dependents` | Resumo de médias, faltas e alertas dos dependentes | ✅ Ativo |
| **Responsável** | `GET` | `/api/students/{id}/report-card` | Boletim escolar anual completo dos 4 bimestres | ✅ Ativo |
| **Responsável** | `GET` | `/api/students/{id}/assessments` | Notas detalhadas por avaliação (100% somente leitura) | ✅ Ativo |
| **Responsável** | `GET` | `/api/students/{id}/attendance` | Extrato de frequência e calendário escolar mensal | ✅ Ativo |
| **Responsável** | `GET` | `/api/parent/announcements` | Mural de avisos e comunicados com ordenação padrão | ✅ Ativo |
| **Responsável** | `POST` | `/api/parent/announcements/{id}/read` | Confirmação de leitura do aviso pelo responsável | ✅ Ativo |
| **Docente** | `GET` | `/api/teacher/classes` | Escopo de turmas, disciplinas e alunos matriculados | ✅ Ativo |
| **Docente** | `GET` | `/api/teacher/assessments` | Listagem sequencial de avaliações por escopo | ✅ Ativo |
| **Docente** | `PUT` | `/api/teacher/assessments/{id}` | Edição de título, tipo, peso e descrição de avaliação | ✅ Ativo |
| **Docente** | `POST` | `/api/teacher/assessments/add` | Criação de avaliação sequencial para toda a turma | ✅ Ativo |
| **Docente** | `POST` | `/api/teacher/grades/bulk` | Lançamento e publicação de notas em lote no SQLite | ✅ Ativo |
| **Docente** | `POST` | `/api/teacher/attendance/bulk` | Chamada diária com presença e justificativas | ✅ Ativo |
| **Docente** | `GET` | `/api/teacher/announcements` | Listagem de avisos com status de leitura pelos pais | ✅ Ativo |
| **Docente** | `POST` | `/api/teacher/announcements` | Criação de avisos com remetente formal e tags customizadas | ✅ Ativo |
| **Docente** | `PUT` | `/api/teacher/announcements/{id}` | Edição de avisos previamente publicados | ✅ Ativo |

---

## 🧭 5. Guia de Leitura Orientada por Perfil

### Para o Avaliador Acadêmico / Professor

1. Inicie por este índice ([`EP3_INDICE.md`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/EP3_INDICE.md)) para ter a visão geral do entregável.
2. Consulte o [`RELATORIO_ATENDIMENTO_REQUISITOS-pi3-ep3.md`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/RELATORIO_ATENDIMENTO_REQUISITOS-pi3-ep3.md) para verificar como cada item da ementa foi cumprido.
3. Leia o [`RELATORIO_MVP_WEB_FUNCIONAL.md`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/RELATORIO_MVP_WEB_FUNCIONAL.md) para auditar a suíte de testes e métricas.

### Para o Desenvolvedor Backend / Engenheiro de Dados

1. Consulte o [`EP3_ARQUITETURA.md`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/EP3_ARQUITETURA.md) para entender a divisão de camadas na Clean Architecture.
2. Acesse o Swagger UI interativo em `http://localhost:5173/docs` (ou direto em `:8000/docs`) para testar os endpoints.
3. Inspecione a estrutura SQL em [`backend/src/infrastructure/schema.sql`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/infrastructure/schema.sql) e os repositórios em [`backend/src/infrastructure/database.py`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/infrastructure/database.py).

### Para o Desenvolvedor Frontend / Designer UX

1. Consulte o [`relatorio_tecnologias_frontend_projeto.md`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/relatorio_tecnologias_frontend_projeto.md) para compreender o Design System, Tailwind v4 e os componentes de `App.tsx`.
2. Verifique o cliente de API desacoplado em [`frontend/src/services/api.ts`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/frontend/src/services/api.ts).
3. Audite a acessibilidade WCAG 2.1 AA na Barra de Acessibilidade e na codificação semântica tripla.

---

## 🚀 6. Guia Rápido de Execução da Aplicação

1. Executar a suíte de 79 testes automatizados no Backend:

```powershell
python -m pytest
```

2. Iniciar o Servidor Backend da API REST (com auto-reload ativo na porta 8000):

```powershell
cd backend
python main.py
```

*(Opcional) Executar simulação de demonstração no terminal:*

```powershell
python main.py --demo
```

3. Iniciar o Frontend React SPA (Porta 5173):

```powershell
cd frontend
npm run dev
```

4. Acessar no Navegador:

- **Frontend:** `http://localhost:5173`
- **Swagger UI Live:** `http://localhost:5173/docs` (ou `http://127.0.0.1:8000/docs`)

---

## 🏆 7. Autoavaliação e Declaração de Integridade

O projeto **TrAcEs (EP3)** reflete as melhores práticas de Engenharia de Software:

- **Separação de Preocupações (SoC):** Total desacoplamento entre camada visual (SPA) e persistência (API RESTful + SQLite 3).
- **Segregação de Papéis (RBAC):** Proteção de escrita restrita aos docentes e transparência de leitura para as famílias.
- **Inclusão Digital Real:** Conformidade estrita com padrões internacionais de acessibilidade digital (WCAG 2.1 AA).
- **Qualidade Testável:** 100% dos fluxos cobertos por 79 testes automatizados com execução em menos de 3.5 segundos.
