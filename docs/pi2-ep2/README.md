# Painel de Acompanhamento Escolar

**Disciplina:** Projeto Integrado - Entregável Parcial 2  
**Curso:** Análise e Desenvolvimento de Sistemas (UFCA)  
**Estudantes:** Antonio Alex Dayson Tomaz e Maria Alexsandra Tomaz

---

## 📌 Visão Geral

Este projeto é um sistema de gestão acadêmica desenvolvido em Python, focado em simplicidade e robustez. Ele permite gerenciar todo o ciclo escolar: desde o cadastro de alunos, professores e responsáveis, até a organização de turmas, lançamento de notas, controle de frequência e geração de boletins.

Nosso objetivo foi criar um código limpo, fácil de entender e que utilize boas práticas de engenharia de software, separando as regras de negócio (domínio) da persistência de dados (banco de dados).

---

## 🌟 O que é o "Projeto Físico" de um Banco de Dados?
*(Componente Extensionista — Para estudantes e comunidade)*

Podemos comparar a cosntrução de um banco de dados à construção de uma casa:

O **Projeto Lógico** é a Planta Baixa: É o desenho conceitual onde decidimos que a casa terá sala, quartos e cozinha. É onde definimos as relações entre as "peças" (ex: o quarto deve ter acesso ao corredor).

O **Projeto Físico** é a Obra Real: É o momento de "sujar as mãos" e decidir os materiais. Vamos usar tijolo ou concreto? Qual a espessura exata dos canos para não haver vazamento? Como as trancas das portas serão instaladas?.

## 🛠️ Traduzindo para o Código
No desenvolvimento de software, o projeto físico é a tradução dos nossos diagramas para comandos reais de SQL (Structured Query Language) que o computador consegue executar. Neste sistema, implementamos o projeto físico manualmente em SQLite 3.0+, sem usar ferramentas automáticas (ORMs), para garantir controle total sobre a fundação dos dados.

**Este processo define detalhes vitais como:**

**Tipagem de Dados:** Garantir que datas sigam o padrão internacional ISO-8601 e que notas sejam números reais precisos.

**Vínculos Seguros:** O uso de Chaves Estrangeiras (Foreign Keys) para criar elos inquebráveis entre alunos, professores e responsáveis.

**Trancas de Segurança (Constraints):** São as regras de ouro. Se o código Python falhar e tentar salvar uma nota "11" ou um CPF inválido, o banco de dados bloqueia a ação.

## 💡 Por que isso é importante para o programador?
O banco de dados é a "última linha de defesa" de um sistema. Um projeto físico bem estruturado garante que, mesmo após anos de uso ou erros inesperados na interface, as informações da escola continuem íntegras, organizadas e protegidas. Aprender a construir essa base manualmente é o que diferencia um programador comum de um desenvolvedor que realmente entende como os dados sobrevivem ao tempo.

## 🏗️ Detalhamento do Projeto Físico

O banco de dados foi estruturado manualmente em **SQLite 3.0+**, utilizando SQL explícito (sem bibliotecas automáticas/ORM) para garantir total controle sobre a integridade acadêmica.

### 1. Tabelas e Tipos de Dados
Implementamos **11 tabelas** organizadas para evitar repetição de informação (Normalização):

- **Atores (students, teachers, parents):** Usam identificadores únicos (`INTEGER PRIMARY KEY AUTOINCREMENT`) para rapidez e facilidade de consulta manual.
- **Datas:** Armazenadas como strings no formato **ISO-8601 (YYYY-MM-DD)** para garantir que as buscas por período funcionem em qualquer sistema.
- **Notas e Pesos:** Definidos como `REAL`/`DECIMAL` para permitir cálculos matemáticos precisos de média ponderada.

### 2. Chaves e Relacionamentos
**Foreign Keys (Chaves Estrangeiras):** Criam os "vínculos" entre tabelas.

- **ON DELETE CASCADE:** Aplicado em vínculos familiares e de frequência. Se um aluno é removido, o sistema apaga automaticamente seus vínculos, evitando "lixo" no banco.
- **ON DELETE RESTRICT:** Aplicado em turmas e notas. O sistema impede a exclusão de uma turma se houver alunos matriculados nela, preservando o histórico escolar.

### 3. Restrições (Constraints) - A Proteção dos Dados
O projeto utiliza **18 restrições de verificação (CHECK)** e **11 de unicidade (UNIQUE)**:

- **Notas:** Uma regra impede que qualquer nota seja menor que 0 ou maior que 10.
- **Documentos:** O campo de CPF e Email exige formatos válidos e impede que dois responsáveis usem o mesmo CPF.
- **Lógica de Frequência:** Uma restrição impede que um aluno seja marcado como "Presente" e, ao mesmo tempo, possua uma "Justificativa de Falta".

---

## 📂 Estrutura do Projeto

Mantivemos uma estrutura organizada para facilitar a navegação:

```
etapa_2-v2/
├── main.py                     # Script principal de demonstração (Ponto de entrada)
├── DESCRICAO_DO_PROJETO.md     # Detalhes técnicos completos
├── src/
│   ├── domain/models.py        # As classes (Aluno, Professor, Nota...)
│   ├── application/services.py # As regras (Cálculo de média, Matrícula...)
│   └── infrastructure/         # Onde o SQL vive
│       ├── database.py         # Código Python que fala com o banco
│       └── schema.sql          # O script de criação do banco físico
└── tests/                      # Testes automatizados para garantir qualidade
```

---

## 🚀 Como Executar o Projeto

Para testar nosso sistema, siga os passos abaixo no terminal:

1. **Prepare o ambiente:**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # No Windows
   pip install -r requirements.txt
   ```

2. **Rode a demonstração completa:**
   O arquivo `main.py` cria um cenário real: cadastra alunos, turmas, lança notas e gera boletins.
   ```bash
   python main.py
   ```

3. **Verifique os testes:**
   Cobrimos o sistema com 60 testes automatizados para garantir que tudo funciona.
   ```bash
   pytest tests/ -v
   ```

---

## 🛠️ Tecnologias Utilizadas

- **Python 3.12**
- **SQLite**
- **pytest**

---
*Este projeto foi desenvolvido para a disciplina de Projeto Integrado 2 do Curso de Análise e Desenvolvimento de Sistemas da UFCA.*
