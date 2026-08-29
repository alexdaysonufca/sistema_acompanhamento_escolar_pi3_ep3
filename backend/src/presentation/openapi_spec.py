"""
Especificação OpenAPI 3.0 para a API RESTful do Sistema TrAcEs.
"""

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "TrAcEs — Trilha de Acompanhamento Estudantil API",
        "description": (
            "API RESTful do sistema **TrAcEs (Trilha de Acompanhamento Escolar)**.\n\n"
            "Desenvolvida sob os princípios da **Clean Architecture (4 Camadas: Domain, Application, Infrastructure, Presentation)** e padrão **MVC** em monorepo desacoplado, conecta o frontend SPA em React 18 / TypeScript 5 / Vite 6 / Tailwind CSS v4 (`frontend/`) "
            "ao servidor backend em Python 3.10+ e banco de dados relacional SQLite 3 (`backend/`).\n\n"
            "A Camada de Apresentação (`backend/src/presentation/`) isola os controladores REST e adaptadores HTTP dos casos de uso de aplicação (`backend/src/application/`) e da persistência (`backend/src/infrastructure/`), preservando a integridade das regras de negócio puras (`backend/src/domain/`).\n\n"
            "Suporta operações completas de autenticação com Controle de Acesso Baseado em Papéis (RBAC com 3 Modos: Modo Pais com navegação familiar; Modo Docente exclusivo para lançamento acadêmico; Modo Desenvolvedor com menus para Documentação da API [Swagger UI], Documentação Técnica na íntegra com renderização interativa Mermaid e caixas de código JSON com syntax highlighting e cópia, Integrantes da Equipe e Sobre o Projeto), "
            "Acessibilidade Digital Universal de padrão SPA (WCAG 2.1 Nível AA: Gerenciamento Ativo de Foco via refs e tabindex programático, Anúncios Dinâmicos via ARIA Live Regions, Sincronização com History API do navegador e document.title dinâmico, Focus Trap e Restauração de Foco em todos os modais, Indicadores aria-busy=\"true\" e sr-only em requisições assíncronas, Suporte a prefers-reduced-motion e prefers-contrast, Alvos de Toque mínimos de 44x44px e Barra de Acessibilidade universal fixa e permanente no topo sticky top-0 z-50), "
            "acompanhamento escolar para pais e responsáveis (Boletim, Notas Detalhadas, Calendário de Frequência cobrindo todos os meses letivos de Fevereiro a Dezembro com seção de Grade Curricular, Horários e Vigência, Mural de Avisos com confirmação de leitura) "
            "e operações operacionais do corpo docente (Lançamento de notas em lote, chamadas mensais dinâmicas com seletores de escopo [Turma, Disciplina, Tipo, Bimestre, Ano], "
            "botão de coluna alternável [✓ Total ↔ ✖ Limpar], suporte a campos em branco [\"\" / sem nada dentro], 3º e 4º bimestres em branco por padrão [\"— Sem registro\"], "
            "modal de Configuração de Vigência, Grade Horária (07:00 às 22:00) e Exceções do Calendário, painel de Alertas Pedagógicos do docente [meses pendentes, infrequência crítica > 10 faltas ou < 40% projetado], "
            "restauração automática de dados no useEffect do ProfessorScreen, criação dinâmica de avaliações com recálculo e gestão completa de Avisos e Comunicados com tags personalizadas)."
        ),
        "version": "1.0.0",
        "contact": {
            "name": "Equipe de Engenharia TrAcEs — ADS UFCA",
            "email": "traces@escola.edu.br"
        },
        "license": {
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT"
        }
    },
    "servers": [
        {
            "url": "/",
            "description": "API RESTful TrAcEs"
        }
    ],
    "tags": [
        {"name": "Sistema", "description": "Status, integridade e verificação da API"},
        {"name": "Autenticação", "description": "Autenticação e controle de sessão de usuários"},
        {"name": "Módulo Responsável", "description": "Consultas acadêmicas para pais e tutores legais (Boletim, Notas, Frequência e Avisos)"},
        {"name": "Módulo Docente", "description": "Lançamento em lote de notas e frequências, gestão de avaliações e publicação de avisos"}
    ],
    "paths": {
        "/api/health": {
            "get": {
                "tags": ["Sistema"],
                "summary": "Healthcheck do Servidor",
                "description": "Verifica a integridade e disponibilidade do servidor backend e da API REST.",
                "responses": {
                    "200": {
                        "description": "Servidor operando normalmente",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "ok",
                                    "system": "TrAcEs — Trilha de Acompanhamento Estudantil API",
                                    "version": "1.0.0"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/auth/login": {
            "post": {
                "tags": ["Autenticação"],
                "summary": "Autenticação de Usuário (Login)",
                "description": "Autentica um usuário (Responsável ou Docente) e retorna token e perfil de acesso.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["email", "role"],
                                "properties": {
                                    "email": {"type": "string", "example": "maria.silva@email.com"},
                                    "role": {"type": "string", "enum": ["PARENT", "TEACHER"], "example": "PARENT"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Autenticação realizada com sucesso",
                        "content": {
                            "application/json": {
                                "example": {
                                    "token": "jwt_mock_parent_1",
                                    "user": {
                                        "id": 1,
                                        "name": "Maria Silva Oliveira",
                                        "email": "maria.silva@email.com",
                                        "role": "PARENT",
                                        "dependents": [1, 2]
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Usuário não encontrado"
                    }
                }
            }
        },
        "/api/parent/dependents": {
            "get": {
                "tags": ["Módulo Responsável"],
                "summary": "Listar Estudantes Dependentes",
                "description": "Retorna o resumo sintético de médias, faltas e alertas preventivos dos dependentes do responsável.",
                "parameters": [
                    {
                        "name": "parent_id",
                        "in": "query",
                        "description": "ID do responsável",
                        "required": False,
                        "schema": {"type": "integer", "default": 1}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Lista de dependentes com indicadores pedagógicos",
                        "content": {
                            "application/json": {
                                "example": [
                                    {
                                        "student_id": 1,
                                        "name": "João Silva Oliveira",
                                        "registration": "2024001",
                                        "email": "joao.silva@aluno.escola.edu.br",
                                        "classroom": "9º Ano A",
                                        "shift": "MANHA",
                                        "average_grade": 7.25,
                                        "attendance_rate": 90.0,
                                        "total_absences": 2,
                                        "alerts": {
                                            "critical_attendance": False,
                                            "low_grades": False
                                        }
                                    },
                                    {
                                        "student_id": 2,
                                        "name": "Ana Silva Oliveira",
                                        "registration": "2024002",
                                        "email": "ana.silva@aluno.escola.edu.br",
                                        "classroom": "6º Ano B",
                                        "shift": "MANHA",
                                        "average_grade": 5.8,
                                        "attendance_rate": 72.0,
                                        "total_absences": 8,
                                        "alerts": {
                                            "critical_attendance": True,
                                            "low_grades": True
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        "/api/students/{student_id}/report-card": {
            "get": {
                "tags": ["Módulo Responsável"],
                "summary": "Emitir Boletim Escolar Consolidado",
                "description": "Retorna o boletim acadêmico do estudante com as notas dos 4 bimestres, média anual e status de aprovação.",
                "parameters": [
                    {
                        "name": "student_id",
                        "in": "path",
                        "description": "ID do estudante",
                        "required": True,
                        "schema": {"type": "integer", "example": 1}
                    },
                    {
                        "name": "year",
                        "in": "query",
                        "description": "Ano letivo",
                        "required": False,
                        "schema": {"type": "integer", "default": 2026}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Boletim escolar consolidado",
                        "content": {
                            "application/json": {
                                "example": {
                                    "student_id": 1,
                                    "student_name": "João Silva Oliveira",
                                    "registration": "2024001",
                                    "classroom": "9º Ano A",
                                    "academic_year": 2026,
                                    "report": [
                                        {
                                            "subject": "Matemática",
                                            "teacher": "Prof. Carlos Mendes",
                                            "bimester_grades": {"1": 8.75, "2": 7.5, "3": None, "4": None},
                                            "final_average": 8.13,
                                            "status": "Aprovado"
                                        },
                                        {
                                            "subject": "Português",
                                            "teacher": "Prof. Carlos Mendes",
                                            "bimester_grades": {"1": 7.75, "2": None, "3": None, "4": None},
                                            "final_average": 7.75,
                                            "status": "Aprovado"
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/students/{student_id}/assessments": {
            "get": {
                "tags": ["Módulo Responsável"],
                "summary": "Consultar Notas Detalhadas por Avaliação",
                "description": "Retorna a composição analítica de cada avaliação com tipo, peso pedagógico e média ponderada por bimestre.",
                "parameters": [
                    {
                        "name": "student_id",
                        "in": "path",
                        "required": True,
                        "schema": {"type": "integer", "example": 1}
                    },
                    {
                        "name": "subject",
                        "in": "query",
                        "required": False,
                        "schema": {"type": "string", "default": "Matemática"}
                    },
                    {
                        "name": "year",
                        "in": "query",
                        "required": False,
                        "schema": {"type": "integer", "default": 2026}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Composição detalhada de avaliações e média ponderada",
                        "content": {
                            "application/json": {
                                "example": {
                                    "student_id": 1,
                                    "student_name": "João Silva Oliveira",
                                    "subject": "Matemática",
                                    "academic_year": 2026,
                                    "annual_average": 8.13,
                                    "formula": "Σ(nota × peso) / Σ(peso)",
                                    "bimesters": [
                                        {
                                            "bimester": "PRIMEIRO",
                                            "bimester_name": "1º Bimestre",
                                            "average": 8.75,
                                            "assessments": [
                                                {
                                                    "id": 1,
                                                    "title": "Prova Bimestral 1",
                                                    "type": "PROVA",
                                                    "weight": 2.0,
                                                    "score": 8.5,
                                                    "status": "Aprovado"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/students/{student_id}/attendance": {
            "get": {
                "tags": ["Módulo Responsável"],
                "summary": "Consultar Calendário de Frequência e Assiduidade",
                "description": "Retorna a grade diária de presenças e faltas do mês com marcações de atestado médico e extrato percentual.",
                "parameters": [
                    {
                        "name": "student_id",
                        "in": "path",
                        "required": True,
                        "schema": {"type": "integer", "example": 1}
                    },
                    {
                        "name": "subject",
                        "in": "query",
                        "schema": {"type": "string", "default": "Matemática"}
                    },
                    {
                        "name": "month",
                        "in": "query",
                        "schema": {"type": "integer", "default": 3}
                    },
                    {
                        "name": "year",
                        "in": "query",
                        "schema": {"type": "integer", "default": 2026}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Calendário tátil de frequência e extrato de assiduidade",
                        "content": {
                            "application/json": {
                                "example": {
                                    "student_id": 1,
                                    "student_name": "João Silva Oliveira",
                                    "subject": "Matemática",
                                    "month": 3,
                                    "year": 2026,
                                    "summary": {
                                        "total_classes": 20,
                                        "presences": 18,
                                        "absences": 2,
                                        "justified_absences": 1,
                                        "attendance_rate": 90.0,
                                        "minimum_rate": 75.0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/parent/announcements": {
            "get": {
                "tags": ["Módulo Responsável"],
                "summary": "Consultar Mural de Avisos e Comunicados",
                "description": "Retorna comunicados emitidos pela coordenação escolar com status de leitura e urgência.",
                "responses": {
                    "200": {
                        "description": "Lista de comunicados institucionais",
                        "content": {
                            "application/json": {
                                "example": [
                                    {
                                        "id": 101,
                                        "title": "IMPORTANTE: Reunião de Pais e Mestres",
                                        "content": "Prezados responsáveis...",
                                        "category": "URGENT",
                                        "date_published": "2026-06-20",
                                        "is_read": False
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        "/api/teacher/classes": {
            "get": {
                "tags": ["Módulo Docente"],
                "summary": "Consultar Turmas e Estudantes do Professor",
                "description": "Retorna as turmas, disciplinas e alunos matriculados atribuídos ao docente.",
                "parameters": [
                    {
                        "name": "teacher_id",
                        "in": "query",
                        "schema": {"type": "integer", "default": 1}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Escopo de turmas e lista de estudantes matriculados",
                        "content": {
                            "application/json": {
                                "example": [
                                    {
                                        "classroom_id": 1,
                                        "name": "9º Ano A - Manhã",
                                        "subjects": ["Matemática", "Português"],
                                        "students": [
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        "/api/teacher/assessments": {
            "get": {
                "tags": ["Módulo Docente"],
                "summary": "Listar Avaliações por Escopo/Bimestre",
                "description": "Retorna a listagem de avaliações criadas com títulos sequenciais para uma disciplina e bimestre.",
                "parameters": [
                    {
                        "name": "subject",
                        "in": "query",
                        "description": "Nome da disciplina",
                        "schema": {"type": "string", "default": "Matemática"}
                    },
                    {
                        "name": "bimester",
                        "in": "query",
                        "description": "Bimestre (1º BM, 2º BM, 3º BM, 4º BM ou Todos)",
                        "schema": {"type": "string"}
                    },
                    {
                        "name": "year",
                        "in": "query",
                        "description": "Ano letivo",
                        "schema": {"type": "integer", "default": 2026}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Lista de avaliações",
                        "content": {
                            "application/json": {
                                "example": [
                                    {
                                        "assessment_id": 1,
                                        "seq_title": "Avaliação 1",
                                        "title": "Avaliação 1",
                                        "type": "PROVA",
                                        "weight": 1.0,
                                        "bimester": "PRIMEIRO"
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        "/api/teacher/assessments/{id}": {
            "put": {
                "tags": ["Módulo Docente"],
                "summary": "Editar Avaliação Existente",
                "description": "Atualiza os atributos de uma avaliação existente (título, tipo, peso, descrição).",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": True,
                        "description": "ID da avaliação",
                        "schema": {"type": "integer"}
                    }
                ],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string", "example": "Avaliação 1"},
                                    "assessment_type": {"type": "string", "example": "PROVA"},
                                    "weight": {"type": "number", "example": 2.0},
                                    "description": {"type": "string", "example": "Álgebra Linear e Geometria"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Avaliação atualizada com sucesso",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "success",
                                    "assessment_id": 1,
                                    "title": "Avaliação 1",
                                    "weight": 2.0,
                                    "type": "PROVA"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/teacher/grades/bulk": {
            "post": {
                "tags": ["Módulo Docente"],
                "summary": "Lançamento de Notas em Lote (Docente)",
                "description": "Grava e publica notas em lote para uma avaliação, validando o intervalo de 0.0 a 10.0.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["assessment_id", "graded_by", "grades"],
                                "properties": {
                                    "assessment_id": {"type": "integer", "example": 1},
                                    "graded_by": {"type": "string", "example": "Prof. Carlos Mendes"},
                                    "grades": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "required": ["student_id", "score"],
                                            "properties": {
                                                "student_id": {"type": "integer", "example": 1},
                                                "score": {"type": "number", "minimum": 0.0, "maximum": 10.0, "example": 9.5}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Notas registradas com sucesso no banco SQLite",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "success",
                                    "message": "2 notas registradas e publicadas com sucesso!",
                                    "records_created": 2
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Dados de nota inválidos (fora do intervalo de 0.0 a 10.0)"
                    }
                }
            }
        },
        "/api/teacher/attendance/bulk": {
            "post": {
                "tags": ["Módulo Docente"],
                "summary": "Registro de Chamada Diária em Lote (Docente)",
                "description": "Registra presenças e faltas da turma para uma data no formato ISO-8601.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["date", "subject", "records"],
                                "properties": {
                                    "date": {"type": "string", "format": "date", "example": "2026-03-25"},
                                    "subject": {"type": "string", "example": "Matemática"},
                                    "classroom_id": {"type": "integer", "example": 1},
                                    "records": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "required": ["student_id", "is_present"],
                                            "properties": {
                                                "student_id": {"type": "integer", "example": 1},
                                                "is_present": {"type": "boolean", "example": True},
                                                "justification": {"type": "string", "example": "Atestado médico"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Chamada gravada com sucesso",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "success",
                                    "message": "Chamada registrada com sucesso para o dia 2026-03-25.",
                                    "records_count": 2
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/teacher/assessments/add": {
            "post": {
                "tags": ["Módulo Docente"],
                "summary": "Adicionar Nova Avaliação Sequencial",
                "description": "Cria uma nova avaliação sequencial (Avaliação N) para uma disciplina e bimestre com peso e nota opcional.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["subject", "bimester"],
                                "properties": {
                                    "student_id": {"type": "integer", "example": 1},
                                    "subject": {"type": "string", "example": "Matemática"},
                                    "bimester": {"type": "string", "example": "PRIMEIRO"},
                                    "academic_year": {"type": "integer", "default": 2026},
                                    "title": {"type": "string", "example": "Avaliação 2"},
                                    "assessment_type": {"type": "string", "enum": ["PROVA", "TRABALHO", "ATIVIDADE_PRATICA", "SEMINARIO"], "default": "TRABALHO"},
                                    "weight": {"type": "number", "default": 1.0},
                                    "score": {"type": "number", "example": 8.5},
                                    "description": {"type": "string", "example": "Trabalho de Geometria em Grupo"},
                                    "graded_by": {"type": "string", "default": "Prof. Carlos Mendes"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Avaliação criada com sucesso",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "success",
                                    "assessment_id": 15,
                                    "title": "Avaliação 2",
                                    "seq_title": "Avaliação 2",
                                    "bimester": "PRIMEIRO",
                                    "weight": 1.0,
                                    "message": "Avaliação 2 criada com sucesso para o 1º Bimestre!"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/parent/announcements/{id}/read": {
            "post": {
                "tags": ["Módulo Responsável"],
                "summary": "Marcar Aviso / Comunicado como Lido",
                "description": "Atualiza o status do aviso para lido pelo responsável com timestamp de confirmação.",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": True,
                        "description": "ID único do aviso",
                        "schema": {"type": "integer", "example": 101}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Status de leitura atualizado com sucesso",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "success",
                                    "announcement_id": 101,
                                    "is_read": True,
                                    "message": "Aviso marcado como lido com sucesso."
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/teacher/announcements": {
            "get": {
                "tags": ["Módulo Docente"],
                "summary": "Listar Avisos e Comunicados da Turma",
                "description": "Retorna todos os comunicados gerados pelo corpo docente, coordenação ou secretaria com status de leitura pelos responsáveis.",
                "parameters": [
                    {
                        "name": "classroom_id",
                        "in": "query",
                        "required": False,
                        "description": "Filtrar por ID da turma",
                        "schema": {"type": "integer", "example": 1}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Lista de avisos gerenciados pelo docente",
                        "content": {
                            "application/json": {
                                "example": [
                                    {
                                        "id": 1,
                                        "title": "Plantão de Dúvidas de Álgebra",
                                        "content": "Plantão especial às terças-feiras.",
                                        "category": "GENERAL",
                                        "sender_role": "PROFESSOR",
                                        "sender_name": "Prof. Carlos Mendes",
                                        "sender": "Prof. Carlos Mendes — Matemática (9º Ano A)",
                                        "target_type": "CLASSROOM",
                                        "classroom_id": 1,
                                        "tags": [{"label": "Plantão", "color": "#D97706", "bg": "#FFFBEB"}],
                                        "date_published": "2026-06-05",
                                        "is_read": True,
                                        "read_at": "2026-06-06 10:15:00"
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": ["Módulo Docente"],
                "summary": "Criar Novo Aviso / Comunicado",
                "description": "Cadastra um novo comunicado para toda a turma ou estudante específico, com remetente formal, prioridade e tags personalizadas.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["title", "content"],
                                "properties": {
                                    "title": {"type": "string", "example": "Inscrições da OBMEP"},
                                    "content": {"type": "string", "example": "Inscrições abertas para a olimpíada de matemática."},
                                    "category": {"type": "string", "enum": ["GENERAL", "IMPORTANT", "URGENT", "EVENT"], "default": "GENERAL"},
                                    "sender_role": {"type": "string", "enum": ["COORDENACAO", "DIRECAO", "SECRETARIA", "PROFESSOR"], "default": "PROFESSOR"},
                                    "sender_name": {"type": "string", "example": "Prof. Carlos Mendes"},
                                    "target_type": {"type": "string", "enum": ["ALL", "CLASSROOM", "STUDENT"], "default": "CLASSROOM"},
                                    "classroom_id": {"type": "integer", "example": 1},
                                    "student_id": {"type": "integer", "example": 1},
                                    "subject": {"type": "string", "example": "Matemática"},
                                    "tags": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "label": {"type": "string"},
                                                "color": {"type": "string"},
                                                "bg": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Aviso criado com sucesso",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "success",
                                    "message": "Aviso criado e publicado com sucesso no mural!",
                                    "announcement": {
                                        "id": 5,
                                        "title": "Inscrições da OBMEP",
                                        "sender": "Prof. Carlos Mendes — Matemática (9º Ano A)",
                                        "is_read": False
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/teacher/announcements/{id}": {
            "put": {
                "tags": ["Módulo Docente"],
                "summary": "Editar Aviso / Comunicado Existente",
                "description": "Atualiza os dados de um aviso previamente publicado (título, conteúdo, tags, categoria e emissor).",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": True,
                        "description": "ID único do aviso",
                        "schema": {"type": "integer", "example": 5}
                    }
                ],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string", "example": "OBMEP 2026 — Prorrogado"},
                                    "content": {"type": "string", "example": "Inscrições prorrogadas até sexta-feira."},
                                    "category": {"type": "string", "enum": ["GENERAL", "IMPORTANT", "URGENT", "EVENT"]},
                                    "tags": {"type": "array"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Aviso atualizado com sucesso",
                        "content": {
                            "application/json": {
                                "example": {
                                    "status": "success",
                                    "message": "Aviso atualizado com sucesso!"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


def get_swagger_html(spec_url: str = "/openapi.json") -> str:
    """Gera o HTML interativo com o Swagger UI embedado."""
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Swagger UI — TrAcEs API RESTful</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>">
  <style>
    body {{
      margin: 0;
      padding: 0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }}
    .swagger-ui .topbar {{
      background-color: #1B4F8A;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }}
    .swagger-ui .topbar .wrapper .topbar-wrapper a span {{
      color: #FFFFFF;
      font-weight: bold;
      font-size: 1.1rem;
    }}
    .custom-header {{
      background: linear-gradient(135deg, #1B4F8A 0%, #0F3B6C 100%);
      color: white;
      padding: 24px;
      text-align: center;
      border-bottom: 3px solid #FEF08A;
    }}
    .custom-header h1 {{
      margin: 0 0 8px 0;
      font-size: 1.8rem;
    }}
    .custom-header p {{
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }}
    .badge {{
      display: inline-block;
      background: #FEF08A;
      color: #1A2332;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      margin-left: 8px;
      text-transform: uppercase;
    }}
  </style>
</head>
<body>
  <header class="custom-header">
    <h1>TrAcEs — Documentação Interativa da API <span class="badge">Swagger UI / OpenAPI 3.0</span></h1>
    <p>Trilha de Acompanhamento Estudantil · Clean Architecture + Python 3.10+ + SQLite 3 + React 18</p>
  </header>

  <div id="swagger-ui"></div>

  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = function() {{
      window.ui = SwaggerUIBundle({{
        url: "{spec_url}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        supportedSubmitMethods: ["get", "post", "put", "delete", "options"]
      }});
    }};
  </script>
</body>
</html>
"""
