<!-- markdownlint-disable MD013 -->

# Relatório de Conclusão e Entrega do MVP Web Funcional — TrAcEs (EP3)

**Projeto:** TrAcEs — Trilha de Acompanhamento Estudantil  
**Entregável:** Modelo MVP (Minimum Viable Product) Web Funcional  
**Disciplina:** Projeto Integrado 3  
**Instituição:** Universidade Federal do Cariri (UFCA)  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz  
**Data:** 19/08/2026  
**Status da Entrega:** ✅ HOMOLOGADO COM SUCESSO (79 Testes Aprovados · Backend Python 3.12 · Frontend React 18 · SQLite 3 · Swagger UI Live · Clean Architecture 4 Camadas · Monorepo Desacoplado)

---

## 1. Resumo Executivo da Entrega

O **TrAcEs (Trilha de Acompanhamento Estudantil)** é uma plataforma digital integrada de acompanhamento escolar projetada para aproximar famílias e escolas, simplificar a rotina pedagógica dos professores e prevenir a evasão escolar e o baixo rendimento por meio de alertas em tempo real.

O desenvolvimento do **MVP Web Funcional (EP3)** foi concluído com rigor, integrando uma arquitetura em 4 camadas no backend (Clean Architecture em Python 3.12 em `backend/`), uma API RESTful nativa com 18 endpoints documentados no Swagger UI (OpenAPI 3.0.3), um banco relacional transacional SQLite 3 (12 tabelas físicas e 11 índices) e uma Single Page Application (SPA) reativa em React 18, TypeScript 5, Vite 6 e Tailwind CSS v4 em `frontend/`.

---

## 2. Destaques das Funcionalidades Entregues

### 2.1 Módulo do Responsável Legal (Família)

- **Gestão de Múltiplos Dependentes:** Seletor universal permitindo alternar de forma instantânea entre os 3 dependentes cadastrados (*João Silva Oliveira* ID 1, *Ana Silva Oliveira* ID 2 e *Pedro Costa Santos* ID 3).
- **Dashboard de Alertas Preventivos:** Exibição de médias gerais, assiduidade e sinalizadores automáticos de risco de reprovação.
- **Boletim Escolar Oficial:** Tabela consolidada dos 4 bimestres com cálculo de aprovação e folha de estilos otimizada para impressão física (`@media print`).
- **Notas Detalhadas (100% Somente Leitura):** Consulta analítica de notas por avaliação (`Avaliação 1`, `Avaliação 2`), pesos e fórmula de média ponderada, com proteção estrita contra alterações por responsáveis.
- **Frequência e Calendário Completo dos Pais:**
  - **Seletor de Todos os Meses Letivos:** Permite aos responsáveis consultar a assiduidade em qualquer mês do ano (`Fevereiro` a `Dezembro`) e ano letivo.
  - **Sincronização em Tempo Real:** Atualização automática com os diários de classe publicados pelo professor.
  - **Nova Seção de Grade Curricular, Horários e Vigência:** Exibição estruturada logo abaixo do resumo mensal com datas de vigência do bimestre, duração dos tempos (minutos), grade semanal de aulas (07:00 às 22:00) e exceções do calendário escolar (feriados, recessos e reposições extras com justificativa).
- **Mural de Avisos e Comunicados:** Comunicados institucionais com categorização por criticidade, remetente formal com cargo, tags temáticas coloridas, confirmação instantânea de leitura (etiqueta `✓ Lido` com layout preservado) e ordenação padrão cronológica decrescente + alfabética.

### 2.2 Módulo do Corpo Docente (Professor)

- **Seleção Dinâmica de Escopo:** Seletores interdependentes de Turma, Disciplina, Tipo de Registro (*Notas*, *Frequência*, *Avisos*), Bimestre/Visão (*1º BM*, *2º BM*, *3º BM*, *4º BM*, *Consolidado*), Avaliação e **Seletor de Ano** (*2026 padrão*).
- **Painel de Alertas Pedagógicos de Frequência:**
  - *Lembrete de Meses Pendentes:* Identifica meses vigentes ou passados do ano letivo sem chamada lançada/publicada.
  - *Alertas Preventivos de Infrequência Crítica:* Notifica alunos com **mais de 10 faltas** no mês ou com **frequência projetada < 40%** (considerando presença nas aulas futuras do mês).
- **Cinco Modos Especializados de Tabela:**
  1. *Modo Avaliação Específica:* Lançamento e edição de notas de 0.0 a 10.0 com validação visual imediata.
  2. *Modo Todas as Avaliações com Peso:* Exibição das colunas no formato padronizado **`Avaliação N (Peso: X.X)`**, cálculo de média ponderada e situação bimestral (`APROVADO` ou `RECUPERAÇÃO`).
  3. *Modo Consolidado de Notas:* Médias dos 4 bimestres, média geral e situação final do aluno.
  4. *Modo Chamada Mensal Dinâmica:*
     - *Títulos Padronizados:* `Chamada Mensal — Xº BM (Nome da Disciplina)` / Subtítulo `Turma: Yº Ano Z – Turno · Ano Letivo: Ano`.
     - *Modal "⚙️ Configurar Horários e Vigência":* Período do bimestre, duração por tempo (40, 45, 50, 60 min), dias/horários da semana (07:00 às 22:00) e gerenciador de exceções.
     - *Ações por Coluna:* Botão alternável `✓ Total` $\leftrightarrow$ `✖ Limpar` (aplica presença integral em todos ou limpa presenças tornando o campo em branco `""`).
     - *Ciclo com Campo em Branco:* Ciclo interativo (`""` $\rightarrow$ `2P` $\rightarrow$ `1P 1F` $\rightarrow$ `2F` $\rightarrow$ `2FJ` $\rightarrow$ `""`), mantendo os quadros limpos quando não lançados.
     - *3º e 4º Bimestres Vazio por Padrão:* Inicializados zerados em branco (`""`) aguardando lançamento futuro pelo docente.
     - *Restauração Automática (useEffect):* Manutenção e recarregamento automático dos dados publicados ao navegar entre telas ou sair da área docente.
  5. *Modo Consolidado de Frequência:* Exibição dos 4 bimestres com **3º e 4º bimestres indicados como `— Sem registro`**, apuração consolidada sobre bimestres lançados, `% Frequência Geral` e badges de situação (`✓ Aprovado por Frequência` para $\ge 75\%$ e `⚠️ Reprovado por Falta` para $< 75\%$).
- **Criação Sequencial de Avaliações (`+ Adicionar Avaliação para a Turma`):** Criação unificada da avaliação para todos os alunos da turma.
- **Edição Dinâmica de Parâmetros (`✏️ Editar Avaliação`):** Botão contextual que abre modal pré-preenchido permitindo alterar título, tipo, peso e descrição, sincronizando com o SQLite via `PUT /api/teacher/assessments/{id}` e recalculando as médias em tempo real.
- **Cadastro e Publicação de Avisos (`+ Novo Aviso / Comunicado`):** Modal de criação sem tags pré-selecionadas, criador de tags customizadas com paleta de 7 cores, emissor formal e retorno direto ao mural.
- **Prevenção de Erros (Nielsen #5):** Modal de confirmação obrigatório antes de gravar permanentemente no banco de dados.

### 2.3 Módulo do Desenvolvedor (Equipe Dev)

- **1. Documentação da API:** Acesso direto e integrado ao Swagger UI via rota relativa (`/docs`) ou direta (`http://127.0.0.1:8000/docs`) com suporte a execução assíncrona multithread (`ThreadingHTTPServer`) e compatibilidade universal com Codespaces/Docker.
- **2. Documentação Técnica:** Visualizador interativo e responsivo que carrega e renderiza na íntegra todos os documentos técnicos do projeto com tratamento tipográfico, suporte a LaTeX, renderização visual interativa de diagramas Mermaid e caixas isoladas de código com syntax highlighting JSON e botão de cópia instantânea.
- **3. Integrantes:** Apresentação acadêmica oficial dos integrantes da equipe discente da Universidade Federal do Cariri (UFCA).
- **4. Sobre:** Painel analítico detalhando a Clean Architecture, utilidade social e componente extensionista.

---

## 3. Conformidade com Acessibilidade (WCAG 2.1 AA) e Usabilidade (Nielsen) em SPA

| Diretriz / Heurística | Implementação Concreta no TrAcEs |
| :--- | :--- |
| **WCAG 1.4.1 (Uso da Cor)** | **Codificação Semântica Tripla:** toda informação possui cor de alto contraste, ícone representativo (`✓`, `⚠️`, `✕`) e texto explícito. |
| **WCAG 1.4.3 / 1.4.11 (Contraste)** | Relação de contraste mínima de `4,5:1` para texto normal, `7:1` para modo Alto Contraste nativo e suporte a `prefers-contrast: more`. |
| **WCAG 1.4.4 (Redimensionamento)** | Magnificação proporcional de fontes (`80%` a `140%`) no seletor global A+/A- em `rem` e zoom livre sem restrições (`user-scalable=yes`). |
| **WCAG 2.1.2 (Focus Trap)** | Aprisionamento cíclico por `Tab` e `Shift + Tab` dentro de todos os modais e devolução de foco ao elemento de origem ao fechar. |
| **WCAG 2.3.3 (Redução de Movimento)** | Suporte à diretiva `@media (prefers-reduced-motion: reduce)` simplificando e zerando transições. |
| **WCAG 2.4.1 (Bypass Blocks & Fixidez)** | *Skip Links* em alto contraste ao foco e Barra de Acessibilidade universal fixa permanente (`sticky top-0 z-50`). |
| **WCAG 2.4.3 (Gerenciamento de Foco SPA)** | Foco programático para `<main id="main-content">` na troca de rotas e sincronização bidirecional com a History API (`pushState` / `popstate`). |
| **WCAG 2.5.5 (Alvos de Toque)** | Tamanho mínimo de toque de **44×44px** (`min-h-[44px]`) em todos os controles interativos. |
| **WCAG 4.1.3 (Live Regions & Busy)** | **ARIA Live Region Global** (`role="status" aria-live="polite"`) e indicador `aria-busy="true"` em requisições assíncronas. |
| **Heurística #1 (Visibilidade)** | Toasts de confirmação imediata para operações assíncronas e contadores em tempo real. |
| **Heurística #3 (Liberdade)** | Links de retorno "⬅️ Voltar ao Painel" em todas as telas e fechamento universal com tecla `Escape`. |
| **Heurística #5 (Prevenção de Erros)** | Modal de confirmação obrigatório com resumo dos dados antes de gravar no banco SQLite. |
| **Heurística #6 (Reconhecimento)** | Legendas fixas de faixas de notas e status em todas as tabelas. |
| **Heurística #7 (Eficiência de Uso)** | Caixas isoladas de código com syntax highlighting, preservação de indentação e botão de cópia instantânea de payloads e comandos. |
| **Heurística #9 (Recuperação de Erros)** | Inputs de notas com validação em tempo real, `aria-invalid` dinâmico e mensagens contextuais de erro. |

---

## 4. Resultados e Métricas de Validação da Qualidade

### 4.1 Suíte de Testes Automatizados no Backend (79 Testes)

A suíte completa de testes automatizados no framework **pytest** foi executada com **100% de aprovação (79 testes)**:

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

- **Testes Unitários:** Validação algorítmica de CPFs válidos/inválidos, entidades de domínio, regras de aprovação pedagógica e enums.
- **Testes de Integração:** Repositórios SQL transacionais com banco de dados real em memória, integridade referencial com `ON DELETE CASCADE` e restrições `CHECK`.
- **Testes de API REST:** 18 endpoints testados, incluindo validação da especificação OpenAPI 3.0.3, lançamentos em lote nos 4 bimestres, edição de avaliações via `PUT` e fluxo de avisos (`GET/POST/PUT`).

### 4.2 Compilação e Validação do Frontend

- **Compilação TypeScript:** `npm run build` executado com **0 erros e 0 avisos** em 5.87s.
- **Performance do Bundle:** Bundle JS de 316.81 kB (84.53 kB gzipped) e CSS de 108.19 kB (17.95 kB gzipped), gerando carregamento inicial quase instantâneo.

---

## 5. Guia de Execução Rápida

### 1. Iniciar o Servidor Backend REST (Porta 8000)

No diretório raiz do projeto:

```powershell
cd backend
python main.py
```

* API REST (Local): `http://127.0.0.1:8000`
* Swagger UI Live: `http://localhost:5173/docs` (ou `http://127.0.0.1:8000/docs`)

### 2. Iniciar a Aplicação Frontend SPA (Porta 5173)

Em um novo terminal:

```powershell
cd frontend
npm run dev
```

* Acesso no navegador: `http://localhost:5173`

---

## 6. Conclusão e Entrega

O **MVP Web Funcional (EP3)** do **TrAcEs** representa a entrega de um produto de software completo, estável, escalável e acessível, cumprindo integralmente todos os requisitos pedagógicos, técnicos e extensionistas do Projeto Integrado 3.
