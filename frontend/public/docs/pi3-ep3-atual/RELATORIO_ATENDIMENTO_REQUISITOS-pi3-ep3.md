<!-- markdownlint-disable MD013 -->

# Relatório de Atendimento aos Requisitos — TrAcEs (EP3)

**Projeto:** TrAcEs — Trilha de Acompanhamento Estudantil  
**Entregável:** Entregável Parcial 3 (EP3) — Relatório de Conformidade de Requisitos  
**Disciplina:** Projeto Integrado 3  
**Instituição:** Universidade Federal do Cariri (UFCA)  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz  
**Data:** 19/08/2026  
**Status de Atendimento:** ✅ 100% DOS REQUISITOS ATENDIDOS E SUPERADOS (79 Testes Aprovados · Backend Clean Architecture · Frontend React 18 SPA · SQLite 3 · Swagger UI Live)

---

## 1. Introdução e Compreensão do Escopo do EP3

A equipe compreendeu que o **Entregável Parcial 3 (EP3)** representa a consolidação e entrega do **MVP (Minimum Viable Product) Web Funcional**, integrando a base arquitetural e de dados construída nas etapas anteriores a uma interface gráfica web moderna, responsiva, acessível e conectada via API RESTful nativa.

O objetivo foi entregar um sistema **robusto, auditável, resiliente e inclusivo**, com rigorosa separação de responsabilidades (SoC), persistência relacional transacional e conformidade com padrões internacionais de acessibilidade digital (WCAG 2.1 AA) e usabilidade (10 Heurísticas de Nielsen).

---

## 2. Matriz de Rastreabilidade e Atendimento aos Requisitos

| Requisito / Dimensão | Descrição do Requisito | Como Foi Atendido no TrAcEs | Evidências no Código-Fonte | Status |
| :--- | :--- | :--- | :--- | :---: |
| **1. Persistência Relacional** | Banco de dados relacional físico com DDL normalizado, constraints e integridade. | SQLite 3 com 12 tabelas físicas, 11 índices de busca, chaves estrangeiras com `ON DELETE CASCADE` e restrições `CHECK`. | [`backend/src/infrastructure/schema.sql`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/infrastructure/schema.sql) | ✅ Atendido |
| **2. Clean Architecture** | Arquitetura em camadas com inversão de dependência e regras puras. | Divisão estrita em 4 camadas: Domínio (invariantes), Aplicação (serviços), Infraestrutura (repositórios) e Apresentação (controladores e rotas). | [`backend/src/domain/`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/domain/), [`backend/src/application/`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/application/), [`backend/src/infrastructure/`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/infrastructure/), [`backend/src/presentation/`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/presentation/) | ✅ Atendido |
| **3. API RESTful Nativa** | Exposição de endpoints HTTP com payloads JSON e documentação viva. | Servidor HTTP multithreaded com CORS e **18 endpoints documentados no padrão OpenAPI 3.0.3 / Swagger UI**. | [`backend/src/presentation/server.py`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/presentation/server.py), [`backend/src/presentation/openapi_spec.py`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/presentation/openapi_spec.py) | ✅ Atendido |
| **4. Frontend SPA Moderno** | Interface de alta fidelidade desacoplada, responsiva e reativa em monorepo. | SPA em React 18, TypeScript 5, Vite 6, Tailwind CSS v4, Radix UI e Lucide Icons com 6 telas dinâmicas. | [`frontend/src/app/App.tsx`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/frontend/src/app/App.tsx) | ✅ Atendido |
| **5. Controle de Acesso (RBAC)** | Segregação estrita de perfis em 3 Modos (Pais, Docente e Desenvolvedor) com navegação isolada. | Segregação de menus na navbar: Modo Pais (menus da família); Modo Docente (exclusivamente Área Docente); Modo Desenvolvedor (Documentação da API / Swagger UI, Integrantes, Sobre o Projeto e Documentação Técnica na íntegra). | [`backend/src/presentation/controllers.py`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/src/presentation/controllers.py), [`frontend/src/app/App.tsx`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/frontend/src/app/App.tsx) | ✅ Atendido |
| **6. Acessibilidade (WCAG)** | Diretrizes WCAG 2.1 Nível AA para inclusão digital de todos os usuários. | Contraste 7:1 (Alto Contraste nativo), zoom A+/A- em `rem`, *Skip Links* e **Codificação Semântica Tripla**. | [`frontend/src/app/App.tsx`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/frontend/src/app/App.tsx), [`frontend/src/styles/globals.css`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/frontend/src/styles/globals.css) | ✅ Atendido |
| **7. Usabilidade (Nielsen)** | Aplicação prática das 10 Heurísticas de Usabilidade de Jakob Nielsen. | Modais de confirmação prévia (#5), validação de notas em tempo real (#9), links de retorno (#3) e toasts (#1). | [`frontend/src/app/App.tsx`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/frontend/src/app/App.tsx) | ✅ Atendido |
| **8. Qualidade e Testes** | Suíte de testes automatizados unitários e de integração. | **79 testes no `pytest`** cobrindo entidades, validação matemática de CPF, cálculo de médias, banco real, avisos com confirmação de leitura e endpoints. | [`backend/tests/`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/backend/tests/) | ✅ Atendido |
| **9. Extensão Universitária** | Conexão do projeto com demandas sociais e comunitárias reais. | Casos de uso práticos para escolas de pequeno porte do interior, ONGs socioeducativas e inclusão de famílias. | [`docs/pi3-ep3-atual/EP3_README.md`](file:///c:/Users/Dayson/Documents/pi_3_ep_3_-_v_1/docs/pi3-ep3-atual/EP3_README.md) | ✅ Atendido |

---

## 3. Detalhamento Técnico das Evidências de Atendimento

### 3.1 Projeto Físico de Banco de Dados e Integridade (Requisito 1)

- **Normalização e Tipagem Rigorosa:** 12 tabelas físicas implementadas sem ORMs pesados. As notas e pesos utilizam `DECIMAL(5,2)` para exatidão matemática, evitando erros de ponto flutuante.
- **Travas de Segurança:**
  - *Integridade de Domínio:* `CHECK (score >= 0.0 AND score <= 10.0)` e `CHECK (weight >= 0.1 AND weight <= 10.0)`.
  - *Integridade Referencial:* Chaves estrangeiras com `ON DELETE CASCADE` garantem que a exclusão de um estudante limpe notas e frequências associadas.
  - *Unicidade:* `UNIQUE(email)` e `UNIQUE(cpf)` impedem duplicidades.
- **Otimização de Consultas:** 11 índices relacionais (`idx_grades_student_bimester`, `idx_attendance_date`, `idx_announcements_target`, etc.).

### 3.2 Clean Architecture e Qualidade de Código (Requisito 2)

- **Independência de Frameworks:** O núcleo de regras acadêmicas (`src/domain/models.py` e `src/application/services.py`) não importa bibliotecas externas ou drivers de banco de dados.
- **Padrão Repository:** O arquivo `src/infrastructure/database.py` encapsula as operações SQL dos 9 repositórios, permitindo portabilidade futura para outros SGBDs (PostgreSQL, MySQL).

### 3.3 API RESTful Nativa e OpenAPI 3.0.3 (Requisito 3)

- **18 Endpoints Completos:** Suporte a operações `GET`, `POST` e `PUT`.
- **Documentação Swagger UI Live:** Acesso interativo em `http://127.0.0.1:8000/docs`, permitindo testar requisições diretamente pelo navegador.
- **Tratamento de Erros:** Respostas com status HTTP semânticos (200, 201, 400, 404, 500) e corpo JSON padronizado.

### 3.4 Interface Web SPA e Usabilidade (Requisitos 4 e 7)

- **6 Telas Funcionais:** Dashboard, Boletim Oficial (@media print), Notas Detalhadas, Frequência/Calendário Completo (todos os meses letivos de Fevereiro a Dezembro com seção de Grade Curricular, Horários e Vigência), Mural de Avisos e Área do Docente.
- **Área do Docente Avançada:**
  - Seletores interdependentes de Turma, Disciplina, Tipo de Registro (*Notas*, *Frequência*, *Avisos*), Bimestre/Visão (*1º BM*, *2º BM*, *3º BM*, *4º BM*, *Consolidado*), Avaliação e Ano (*2026 padrão*).
  - 5 Modos de Tabela (*Avaliação Específica*, *Todas com Peso `(Peso: X.X)`*, *Consolidado de Notas*, *Chamada Mensal Dinâmica* e *Consolidado de Frequência*).
  - **Módulo de Frequência e Vigência Completo:**
    - Modal *"⚙️ Configurar Horários e Vigência"* com período de vigência, duração por tempo (40, 45, 50, 60 min), dias e horários da semana (07:00 às 22:00) e exceções do calendário escolar (feriados/aulas extras).
    - Botão de coluna alternável `✓ Total` $\leftrightarrow$ `✖ Limpar` (aplica presença integral ou limpa presenças tornando os campos em branco `""`).
    - Ciclo interativo com suporte a campos em branco (`""` / sem nada dentro).
    - Restauração automática de dados salvos ao navegar ou re-entrar na Área Docente via `useEffect`.
    - 3º e 4º bimestres em branco por padrão (`""`) e exibidos como `"— Sem registro"` no Consolidado.
    - Painel de Alertas Pedagógicos do docente (lembrete de meses pendentes, infrequência crítica > 10 faltas ou < 40% projetado).
  - Botões `+ Adicionar Avaliação para a Turma`, `✏️ Editar Avaliação` e `+ Novo Aviso / Comunicado`.
- **Aplicação das Heurísticas de Nielsen:**
  - *#1 Visibilidade:* Toasts dinâmicos de sucesso e erro.
  - *#3 Liberdade:* Links "Voltar ao Painel" e tecla `Escape`.
  - *#5 Prevenção de Erros:* Modal de confirmação antes de gravar no banco.
  - *#9 Recuperação:* Borda verde/vermelha imediata em inputs de nota.

### 3.5 Acessibilidade Digital WCAG 2.1 Nível AA em SPA (Requisito 6)

- **Codificação Semântica Tripla:** A informação é transmitida por cor contrastante, ícone SVG e texto explicativo, garantindo compreensão para pessoas com daltonismo.
- **Alto Contraste Nativo e Detecção Automática:** Tema com razão de contraste $\ge 7:1$ com listener automático para `prefers-contrast: more`.
- **Redimensionamento Tipográfico e Zoom:** Seletor A+/A- na Barra de Acessibilidade com escala relativa em `rem` (80% a 140%) e viewport livre com `user-scalable=yes`.
- **Gerenciamento Ativo de Foco e History API:** Foco programático transferido para o elemento `<main id="main-content">` a cada rota e sincronização com `pushState` / `popstate` para botões Voltar/Avançar.
- **Focus Trap e Restauração de Foco:** Aprisionamento cíclico por `Tab`/`Shift+Tab` em todos os 5 modais e restauração automática ao botão de disparo.
- **Região Ativa Global (ARIA Live Region):** Notificação em áudio de transições de rota via `aria-live="polite"` e sinalização de carregamento com `aria-busy="true"`.
- **Alvos de Toque:** Dimensões mínimas de **44×44px** (`min-h-[44px]`) em todos os controles interativos (Critério 2.5.5).
- **Redução de Movimento:** Respeito à preferência `@media (prefers-reduced-motion: reduce)`.
- **Skip Links e Fixidez:** Atalhos em alto destaque para `#main-content`, `#main-nav` e `#footer`, com a **Barra de Acessibilidade mantida sempre visível e fixa no topo (`sticky top-0 z-50`)** durante toda a rolagem da página.

### 3.6 Testes Automatizados e Confiabilidade (Requisito 8)

- **79 Testes no `pytest`:** 100% de aprovação cobrindo validação de CPF, invariantes de domínio, aprovação pedagógica, integridade relacional com banco real, todos os endpoints REST, operações de edição (`PUT`) e confirmação de leitura de avisos (`POST`).

---

## 4. Conclusão

A equipe conclui que todos os requisitos estabelecidos para o **Entregável Parcial 3 (EP3)** foram plenamente atendidos e superados. O **TrAcEs** é entregue como uma solução completa de engenharia de software, pronta para uso, auditoria acadêmica e impacto social inclusivo.
