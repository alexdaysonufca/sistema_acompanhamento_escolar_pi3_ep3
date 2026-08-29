<!-- markdownlint-disable MD013 -->

# Relatório de Tecnologias do Frontend — TrAcEs (MVP Web EP3)

**Projeto:** TrAcEs — Trilha de Acompanhamento Estudantil  
**Entregável:** Entregável Parcial 3 (EP3) — Especificação Técnica da Camada de Apresentação  
**Disciplina:** Projeto Integrado 3  
**Instituição:** Universidade Federal do Cariri (UFCA)  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz  
**Data:** 19/08/2026  
**Status do Frontend:** ✅ 100% FUNCIONAL E HOMOLOGADO (React 18 + Vite 6 + Tailwind CSS v4 + TypeScript 5 + WCAG 2.1 AA)

---

## 1. Visão Geral da Camada de Apresentação

O Frontend do **TrAcEs** é uma **Single Page Application (SPA)** de alta fidelidade e acessibilidade prática, desenvolvida para fornecer uma experiência fluida, reativa e inclusiva tanto para o público familiar (responsáveis e tutores legais) quanto para o corpo docente (professores).

### Características Centrais

- **Zero Recargas de Página:** Transições de tela instantâneas gerenciadas por estado reativo do React.
- **Desacoplamento Total:** Comunicação assíncrona com a API RESTful via cliente HTTP tipado (`api.ts`).
- **Acessibilidade Universal (WCAG 2.1 AA):** Barra de Acessibilidade nativa com modo Alto Contraste (7:1), redimensionamento proporcional de fontes em `rem` (80% a 140%), *Skip Links* e codificação semântica tripla.
- **Usabilidade Heurística (Nielsen):** Prevenção de erros com modais de confirmação, feedback visual dinâmico com toasts e links de retorno consistentes.

---

## 2. Estrutura de Diretórios do Frontend

```text
frontend/
├── index.html                     # Entrypoint HTML5 semântico com meta tags e fontes
├── package.json                   # Dependências e scripts de execução (build, dev)
├── vite.config.ts                 # Configuração do Vite com host: true e proxy reverso (/api, /docs, /openapi.json)
├── postcss.config.mjs             # Configuração do Tailwind CSS
├── default_shadcn_theme.css       # Tokens e variáveis do Shadcn UI
├── public/                        # Ativos públicos e imagens vetoriais SVG
│   ├── docs/                      # Documentação técnica espelhada
│   ├── img/                       # Vetores SVG da aplicação
│   ├── avatar-docente.svg
│   ├── avatar-estudante.svg
│   ├── avatar-integrante.svg
│   ├── banner-trilha.svg
│   └── logo-traces.svg
└── src/
    ├── main.tsx                   # Ponto de inicialização do React 18 e montagem na DOM
    ├── app/
    │   ├── App.tsx                # Componente principal contendo as 6 telas, modais e acessibilidade
    │   └── components/            # Primitivas acessíveis Radix / Shadcn UI
    ├── services/
    │   └── api.ts                 # Cliente HTTP assíncrono com métodos para os endpoints REST
    ├── types/
    │   └── api.ts                 # Interfaces TypeScript estritas para contratos de requisição e resposta
    └── styles/
        ├── globals.css            # Design System, tokens Tailwind v4 e estilos de Alto Contraste
        └── theme.css              # Variáveis de tema e cores acessíveis
```

---

## 3. Tecnologias e Frameworks Utilizados

| Tecnologia / Biblioteca | Versão | Papel na Arquitetura do Frontend |
| :--- | :---: | :--- |
| **React** | `18.3.1` | Biblioteca base para criação da interface declarativa baseada em componentes. |
| **TypeScript** | `5.x` | Tipagem estática rigorosa para contratos de API, estados e propriedades de componentes. |
| **Vite** | `6.3.5` | Bundler e servidor de desenvolvimento ultrarrápido com Hot Module Replacement (HMR), `host: true` para Codespaces e proxy reverso universal (`/api`, `/docs`, `/openapi.json`). |
| **Tailwind CSS** | `4.1.12` | Framework CSS utilitário para estilização performática e design tokens. |
| **Lucide React** | `0.487.0` | Conjunto completo de ícones SVG semânticos de alta legibilidade. |
| **Radix UI Primitives** | `1.x` | Primitivas headless acessíveis (Dialog, Select, Dropdown, Tabs, Tooltip). |

---

## 4. Arquitetura de Componentes e Telas (`App.tsx`)

O arquivo [`frontend/src/app/App.tsx`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/frontend/src/app/App.tsx) encapsula as 6 visualizações da aplicação:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ BARRA DE ACESSIBILIDADE FIXA (sticky top-0 z-50): Alto Contraste, Zoom  │
├─────────────────────────────────────────────────────────────────────────┤
│ HEADER & NAVBAR: Logo, Navegação RBAC (Pais / Docente / Dev), Usuário   │
├─────────────────────────────────────────────────────────────────────────┤
│ CONTEÚDO DINÂMICO DA TELA (Renderização Condicional SPA):               │
│  ├── 1. DashboardScreen: Resumo de médias, faltas e alertas preventivos │
│  ├── 2. BoletimScreen: Tabela anual dos 4 bimestres + @media print      │
│  ├── 3. NotasScreen: Composição analítica de notas (100% Somente Leitura)│
│  ├── 4. FrequenciaScreen: Calendário tátil [P], [F], [F*] e extrato     │
│  ├── 5. AvisosScreen: Mural de comunicados com filtros de urgência      │
│  ├── 6. ProfessorScreen: 5 seletores, 3 modos de tabela, + e ✏️ Edição  │
│  ├── 7. SwaggerApiScreen: Visualizador e link interativo Swagger UI     │
│  ├── 8. IntegrantesScreen: Apresentação da equipe discente da UFCA      │
│  ├── 9. SobreScreen: Visão geral, Clean Architecture e extensão social  │
│  └── 10. DocsMarkdownScreen: Documentação Técnica na íntegra formatada  │
├─────────────────────────────────────────────────────────────────────────┤
│ FOOTER ACESSÍVEL: Copyright, informações institucionais e links úteis   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Mapeamento das Telas do Sistema

1. **`DashboardScreen` (Visão da Família):**
   - Cartões com média geral, taxa de presença e alertas pedagógicos.
   - Gráficos e indicadores visuais com codificação semântica tripla.
2. **`BoletimScreen` (Boletim Escolar Oficial):**
   - Tabela semântica estruturada com as notas dos `1º BM`, `2º BM`, `3º BM`, `4º BM`, média anual e situação final (`APROVADO`, `RECUPERAÇÃO`, `REPROVADO`).
   - Botão "Imprimir Boletim" estilizado com folha de estilos dedicada para impressão `@media print`.
3. **`NotasScreen` (Notas Detalhadas por Avaliação):**
   - Composição de notas analíticas (`Avaliação 1`, `Avaliação 2`), pesos e fórmula de média ponderada.
   - **Regra de Negócio RBAC:** Totalmente protegida como **100% Somente Leitura** para familiares.
4. **`FrequenciaScreen` (Frequência e Calendário Escolar):**
   - **Seletor de Todos os Meses:** Seletor com todos os meses letivos do ano (`Fevereiro` a `Dezembro`) e ano letivo.
   - **Sincronização em Tempo Real com o Diário Docente:** Integração automática com lançamentos de frequência diária publicados pelo professor na Área do Docente (`traces_published_attendance` + backend SQLite).
   - **Grade Tátil de Frequência:** Calendário mensal codificado (`[P]` Presente, `[F]` Falta não justificada, `[F*]` Falta Justificada com atestado).
   - **Extrato Consolidado:** Resumo mensal com total de aulas, presenças, faltas registradas, faltas justificadas e percentual de assiduidade com referência ao limite legal de 75% da LDB Art. 24, VI.
   - **Nova Seção de Grade Curricular, Horários e Vigência:** Exibição detalhada das informações cadastradas pelo docente em "Configurar Horários e Vigência" (Período de Vigência, Carga Horária/Duração por Tempo, Dias de Aula na Semana, Disposição de Horários das 07:00 às 22:00 e Exceções do Calendário Escolar com Feriados, Recessos e Aulas Extras).
5. **`AvisosScreen` (Mural de Avisos e Comunicados):**
   - Lista de avisos institucionais direcionados ao estudante ativo com categorização de urgência (*Geral*, *Importante*, *Urgente*, *Evento*), remetente formal com cargo, tags temáticas coloridas, botão "Marcar Como Lido" $\rightarrow$ etiqueta `✓ Lido` com layout preservado e ordenação padrão cronológica decrescente + alfabética.
6. **`ProfessorScreen` (Área do Docente — Lançamento Acadêmico):**
   - **Seletores de Escopo Dinâmicos:**
      - *Frequência Diária:* `[Turma]`, `[Disciplina]`, `[Tipo de Registro]`, `[Bimestre / Visão]` (`1º BM`, `2º BM`, `3º BM`, `4º BM`, `Consolidado`), `[Ano]` (*2026 padrão*).
    - **Painel de Alertas Pedagógicos de Frequência do Docente:**
      - *Lembrete de Meses Pendentes:* Avisos em destaque para meses vigentes ou passados do ano letivo sem registro de chamada publicado.
      - *Alertas Preventivos de Infrequência Crítica:* Monitoramento automático de estudantes com **mais de 10 faltas** no mês ou com **menos de 40% de frequência projetada** (considerando presença nas aulas futuras do mês).
    - **Gestão de Frequência e Chamada Mensal Dinâmica:**
      - *Cabeçalho Padronizado:* `Chamada Mensal — Xº BM (Nome da Disciplina)` / Subtítulo `Turma: Yº Ano Z – Turno · Ano Letivo: Ano`.
      - *Modal de Configuração de Horários e Vigência:* Início/fim do bimestre, duração da aula (40, 45, 50, 60 min), dias de aula (segunda a sábado), tempos de aula (1º tempo, 2 tempos seguidos/alternados, 3 tempos), horários (7h às 22h) e gerenciador de exceções (dias sem aula/feriados e aulas extras/reposição com justificativa).
      - *Grade Mensal com Ações em Coluna:* Navegação entre os meses do bimestre, colunas dos dias letivos com botão alternável `✓ Total` $\leftrightarrow$ `✖ Limpar` (aplica presença integral em todos ou limpa presenças tornando os campos em branco `""`), suporte a ciclo com campos em branco (`""` $\rightarrow$ `2P` $\rightarrow$ `1P 1F` $\rightarrow$ `2F` $\rightarrow$ `2FJ` $\rightarrow$ `""`), 3º e 4º bimestres em branco por padrão (`""`) e restauração automática via `useEffect`.
      - *Modo Consolidado Anual:* Exibição dos 4 bimestres, com **3º e 4º bimestres explicitamente indicados como `— Sem registro`** e cálculo consolidado apurado estritamente sobre os bimestres já lançados, total de aulas, total de faltas, `% Frequência Geral` e badge de situação (`✓ Aprovado por Frequência` para $\ge 75\%$ e `⚠️ Reprovado por Falta` para $< 75\%$).
      - *Legenda Explicativa:* Rodapé com todos os símbolos e menção ao critério legal de 75% da LDB Art. 24, VI.
    - **Gestão de Notas e Avaliações:**
      - *Modo Avaliação Específica:* Edição de notas de 0.0 a 10.0 com validação visual imediata.
      - *Modo Todas as Avaliações com Peso:* Exibição de colunas no formato `Avaliação N (Peso: X.X)` e cálculo de média ponderada.
      - *Modo Consolidado Anual:* Médias dos 4 bimestres e situação anual.
      - *Botões de Ação:* `+ Adicionar Avaliação para a Turma`, `✏️ Editar Avaliação`.
    - **Gestão de Avisos e Comunicados:**
      - *Mural Docente:* Tabela com colunas de resumo, destinatário, emissor formal com cargo, tags, data, status de leitura e ações (`✏️ Editar`).
      - *Modal de Avisos:* Criação/edição sem tags pré-selecionadas, paleta com 7 cores para tags personalizadas e integração direta com o mural dos pais.
    - **Prevenção de Erros (Nielsen #5):** Modal de confirmação obrigatório antes de gravar permanentemente no SQLite.
7. **`SwaggerApiScreen` (Documentação da API RESTful):**
   - Visualizador integrado do Swagger UI via rota relativa (`/docs`) e botão para abertura instantânea em nova aba, com suporte total a execução local e remota (Codespaces / Docker).
8. **`DocsMarkdownScreen` (Documentação Técnica):**
   - Leitor interativo com seletor *dropdown* para renderização na íntegra de todos os arquivos de documentação técnica do diretório `docs/pi3-ep3-atual/`, incluindo formatação de itálico (*texto*), negrito (**texto**), expressões matemáticas LaTeX limpas ($...$), tabelas estruturadas, caixas isoladas com syntax highlighting/cópia de código e **renderização visual interativa de diagramas Mermaid** (arquitetura, fluxo de integração e sequência).
9. **`IntegrantesScreen` (Integrantes da Equipe):**
   - Apresentação acadêmica dos discentes Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz da Universidade Federal do Cariri (UFCA).
10. **`SobreScreen` (Sobre o Projeto):**
    - Apresentação técnica do projeto TrAcEs, Clean Architecture, suíte de 79 testes automatizados e utilidade social.

---

## 5. Camada de Comunicação com a API (`src/services/api.ts`)

A camada de serviços desacopla as chamadas HTTP dos componentes React, cobrindo os 18 endpoints REST:

```typescript
// Exemplo de métodos disponíveis em src/services/api.ts:
tracesApi.login(email: string, role?: "PARENT" | "TEACHER");
tracesApi.getDependents(parentId?: number);
tracesApi.getReportCard(studentId: number, year?: number);
tracesApi.getDetailedAssessments(studentId: number, subject: string, year?: number);
tracesApi.getAttendanceCalendar(studentId: number, subject: string, month: number, year?: number);
tracesApi.getAnnouncements(studentId?: number, parentId?: number);
tracesApi.markAnnouncementAsRead(announcementId: number);
tracesApi.getTeacherClasses(teacherId?: number);
tracesApi.getAssessments(subject: string, bimester?: string, year?: number);
tracesApi.updateAssessment(assessmentId: number, payload: UpdateAssessmentPayload);
tracesApi.addAssessment(payload: AddAssessmentPayload);
tracesApi.saveBulkGrades(payload: BulkGradesPayload);
tracesApi.saveBulkAttendance(payload: BulkAttendancePayload);
tracesApi.getTeacherAnnouncements(classroomId?: number, teacherId?: number);
tracesApi.createAnnouncement(payload: CreateAnnouncementPayload);
tracesApi.updateAnnouncement(announcementId: number, payload: UpdateAnnouncementPayload);
```

---

## 6. Acessibilidade Digital (WCAG 2.1 AA) e Usabilidade (Nielsen) em SPA

| Critério | Solução Implementada no Frontend |
| :--- | :--- |
| **WCAG 1.4.3 / 1.4.11 (Contraste)** | Relação de contraste $\ge 4,5:1$ no tema padrão e $\ge 7:1$ no tema de Alto Contraste com suporte automático a `prefers-contrast: more`. |
| **WCAG 1.4.1 (Uso da Cor)** | **Codificação Semântica Tripla:** toda informação visual combina cor de alto contraste, ícone SVG (`Check`, `AlertTriangle`, `XCircle`) e texto explicativo. |
| **WCAG 1.4.4 (Redimensionamento)** | Seletor A+/A- na Barra de Acessibilidade com escala relativa em `rem` (80% a 140%) e viewport livre com `user-scalable=yes`. |
| **WCAG 2.1.2 (Focus Trap em Modais)** | Aprisionamento de teclado estrito por `Tab` e `Shift + Tab` dentro de modais e restauração automática ao elemento de origem ao fechar. |
| **WCAG 2.3.3 (Redução de Movimento)** | Respeito automático à diretiva `@media (prefers-reduced-motion: reduce)` desativando animações bruscas. |
| **WCAG 2.4.1 (Bypass Blocks & Fixidez)** | Links no topo da DOM (*Skip Links*) em alto contraste ao foco e **Barra de Acessibilidade mantida em posição fixa permanente (`sticky top-0 z-50`)**, permanecendo visível durante toda a rolagem da página e ao saltar para o rodapé (`#footer`). |
| **WCAG 2.4.3 (Gerenciamento Ativo de Foco SPA)** | Foco programático transferido para o elemento `<main id="main-content">` a cada transição de rota e sincronização com a History API (`pushState` / `popstate`). |
| **WCAG 2.5.5 (Alvos de Toque)** | Dimensões mínimas de **44×44px** (`min-h-[44px]`) em todos os botões, links e seletores interativos. |
| **WCAG 4.1.3 (Live Regions & Busy)** | **ARIA Live Region Global** (`role="status" aria-live="polite"`) e indicador `aria-busy="true"` com `<span className="sr-only">` em chamadas assíncronas. |
| **Heurística #1 (Visibilidade)** | Notificações do tipo Toast informam imediatamente o sucesso ou erro de operações assíncronas. |
| **Heurística #3 (Controle e Liberdade)** | Links "Voltar ao Painel" em todas as telas e suporte à tecla `Escape` para fechar diálogos modais. |
| **Heurística #5 (Prevenção de Erros)** | Modal de confirmação com resumo dos dados antes de qualquer gravação permanente no banco SQLite. |
| **Heurística #9 (Recuperação de Erros)** | Inputs de notas com validação em tempo real, `aria-invalid` dinâmico e mensagens contextuais de erro via `aria-errormessage`. |

---

## 7. Validação de Build e Performance

- **Compilação de Produção:** `npm run build` executado com 100% de sucesso sem nenhum aviso ou erro de TypeScript.
- **Tamanho dos Bundles:** Bundle JavaScript de ~248 kB (69 kB gzipped) e CSS de 102 kB (17 kB gzipped).
- **Tempo de Build:** ~5.5 segundos com Vite 6.
