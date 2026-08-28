<!-- markdownlint-disable MD013 -->

# Entregável Parcial 2 (EP2) - Modelo Arquitetural do MVP Web

**Status:** ✅ COMPLETO

**Data:** 26/06/2026

**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz

---

## 📦 O Que Foi Entregue

A **Etapa 2** consiste na especificação técnica e na elaboração da arquitetura de software para o **TrAcEs - Trilha de Acompanhamento Escolar**.

### ✅ Documentos Criados e Atualizados

#### 1. [EP2_ARQUITETURA.md](EP2_ARQUITETURA.md) (Novo)

**Conteúdo:**

- Visão Geral da Arquitetura (problema, objetivo do MVP, usuários e arquitetura cliente-servidor).
- Estrutura em camadas do sistema com foco no desacoplamento Frontend/Backend e na Clean Architecture do Python.
- Descrição detalhada dos componentes lógicos (Autenticação, Secretaria, Painel do Docente e Painel do Responsável).
- Justificativa técnica detalhada das tecnologias escolhidas (Python, React 18, Vite, Shadcn UI, TailwindCSS e SQLite).
- **Manual de Engenharia da API:** modelagem completa de contratos de APIs REST com payloads de requisição/resposta em JSON.
- Integrações com SQLite, serviços SMTP de e-mail, logs de auditoria e exportação física (PDF e impressão).
- Justificativa técnica das decisões arquiteturais (de desempenho, escalabilidade, segurança e portabilidade).
- Aplicação das diretrizes globais de Acessibilidade Web (WCAG 2.1 AA) e das 10 Heurísticas de Nielsen.

**Diagramas Mermaid Inclusos:**

```text
1. Diagrama de Arquitetura Geral do Sistema (Comunicação física e de rede)
2. Diagrama de Camadas do Backend (Clean Architecture)
3. Diagrama de Componentes da Aplicação (Dependências lógicas)
4. Diagrama do Fluxo de Comunicação do Sistema (Conexões e APIs externas)
5. Diagrama de Fluxo de Requisições / Sequência (Lançamento de notas em lote)
```

---

#### 2. [schema.sql](../../src/infrastructure/schema.sql) (Recuperado / Atualizado)

**Conteúdo:**

- Reconstrução da estrutura relacional DDL em SQL puro para SQLite.
- Definição detalhada de 11 tabelas físicas com restrições e constraints.
- Criação de 10 índices relacionais para otimização de buscas.
- Restabelecimento da persistência transacional que valida o backend.

---

#### 3. [main.py](../../main.py) (Validado)

**Conteúdo:**

- Script executável principal contendo a simulação pedagógica em Python de ponta a ponta.
- Reset e inicialização automática do banco de dados relacional local `school.db` executando o `schema.sql`.
- Testes manuais do fluxo escolar (cadastros, matrículas, lançamentos de notas/frequência, cálculo de médias bimestrais ponderadas e desvinculação).

---

#### 4. [Diagramas Arquiteturais (PNG)](../assets/diagramas_arquitetura/) (Novos)

**Localização:** [docs/assets/diagramas_arquitetura/](../assets/diagramas_arquitetura/)

**Arquivos de Imagem:**

- [diagrama-1-arquitetura-geral-do-sistema.png](../assets/diagramas_arquitetura/diagrama-1-arquitetura-geral-do-sistema.png) - Representa a comunicação física e de rede em modelo Cliente-Servidor.
- [diagrama-2-camadas-de-backend.png](../assets/diagramas_arquitetura/diagrama-2-camadas-de-backend.png) - Detalha a divisão de responsabilidades da Clean Architecture (Domain, Application, Infrastructure).
- [diagrama-3-componentes-e-modulos-de-aplicacao.png](../assets/diagramas_arquitetura/diagrama-3-componentes-e-modulos-de-aplicacao.png) - Mostra os componentes React do frontend conectando aos controllers, services e repositórios do backend.
- [diagrama-4-fluxo-de-comunicacao-e-integracao-do-sistema.png](../assets/diagramas_arquitetura/diagrama-4-fluxo-de-comunicacao-e-integracao-do-sistema.png) - Ilustra os fluxos com bancos de dados, serviços de email (SMTP) e impressora.
- [diagrama-5-sequencia-fluxo-de-lancamento-de-notas.png](../assets/diagramas_arquitetura/diagrama-5-sequencia-fluxo-de-lancamento-de-notas.png) - Descreve a sequência de mensagens do lançamento de notas em lote.

---

## 📊 Estatísticas de Entrega

ARQUIVOS ENTREGUES:

- [docs/pi3-ep2/EP2_ARQUITETURA.md](EP2_ARQUITETURA.md) (Novo)
- [docs/pi3-ep2/EP2_INDICE.md](EP2_INDICE.md) (Novo)
- [src/infrastructure/schema.sql](../../src/infrastructure/schema.sql) (Recuperado)
- [docs/assets/diagramas_arquitetura/](../assets/diagramas_arquitetura/) (Pasta com 5 diagramas em formato PNG)

MÉTRICAS DO SISTEMA:

- Tabelas de Banco de Dados: 11
- Índices de Otimização SQL: 10
- Endpoints Modelados na API REST: 7
- Diagramas Arquiteturais Totais: 5 (disponíveis em código Mermaid e exportados em PNG)
- Testes Automatizados no Backend: 60 (100% aprovados)

---

## 🎯 Requisitos Atendidos

| Requisito | Descrição | Status |
| :--- | :--- | :--- |
| **Visão Geral** | Descrição do problema, usuários e organização | ✅ Completo |
| **Arquitetura** | Camadas estruturadas e diagramadas | ✅ Completo |
| **Componentes** | Mapeamento lógico de módulos e fluxos | ✅ Completo |
| **Tecnologias** | Justificativa técnica e manual das APIs JSON | ✅ Completo |
| **Integrações** | Mapeamento com SMTP, PDFs, DB e logs | ✅ Completo |
| **Decisões** | Justificativas para manutenibilidade e desempenho | ✅ Completo |
| **Acessibilidade** | Diretrizes WCAG 2.1 AA no frontend | ✅ Completo |
| **Heurísticas** | Aplicação das 10 Heurísticas de Nielsen | ✅ Completo |
| **Repositório** | Organizado, funcional e com testes passando | ✅ Concluído |

---

## 🚀 Como Usar os Artefatos

### Para Desenvolvedores Frontend

```bash
# Para consultar as especificações de componentes e acessibilidade:
cat docs/pi3-ep2/EP2_ARQUITETURA.md

# Para entender os payloads JSON e endpoints REST a serem consumidos:
cat docs/pi3-ep2/EP2_ARQUITETURA.md # Consulte "Manual de Engenharia"
```

### Para Desenvolvedores Backend

```bash
# Para verificar a estrutura física de dados SQL:
cat src/infrastructure/schema.sql

# Para rodar as validações e simulações pedagógicas:
.venv/Scripts/python main.py

# Para executar a suíte de testes unitários e de integração:
.venv/Scripts/python -m pytest
```

---

## 📋 Checklist de Verificação do Projeto

- O documento arquitetural aborda todas as seções solicitadas.
- Todos os 5 diagramas técnicos estão inclusos no formato Mermaid e exportados em PNG.
- O manual de engenharia descreve as assinaturas e estruturas JSON da API.
- As decisões técnicas estão justificadas perfeitamente em relação à qualidade do software.
- A acessibilidade (WCAG 2.1 AA) e a usabilidade (Nielsen) estão documentadas.
- O arquivo `schema.sql` está recuperado e funcional.
- Todos os 60 testes automatizados passam com sucesso no pytest.
- O documento cumpre com todas as regras do `markdownlint` (0 erros).

---

## 🏆 AutoAvaliação

Este entregável buscou aplicar os seguintes conceitos de engenharia de software:

- Arquitetura em Camadas e Clean Architecture no Backend.
- Separação de Preocupações (SoC) com modelo Cliente-Servidor.
- Acessibilidade digital integrada ao design de arquitetura de software (WCAG).
- Padronização de integrações via APIs sem estado (REST).
