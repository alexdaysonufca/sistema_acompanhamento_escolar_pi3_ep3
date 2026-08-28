-- Schema do Banco de Dados SQLite do TrAcEs

-- 1. Tabela de Estudantes
CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK (length(name) >= 3),
    registration TEXT NOT NULL UNIQUE CHECK (length(registration) >= 3),
    email TEXT UNIQUE CHECK (email LIKE '%@%'),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Responsáveis (Pais/Mães/Tutores)
CREATE TABLE IF NOT EXISTS parents (
    parent_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK (length(name) >= 3),
    email TEXT UNIQUE CHECK (email LIKE '%@%'),
    cpf TEXT UNIQUE CHECK (length(cpf) = 11),
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Vínculo Estudante-Responsável (Relacionamento N:N)
CREATE TABLE IF NOT EXISTS student_parent (
    student_id INTEGER NOT NULL,
    parent_id INTEGER NOT NULL,
    relationship_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, parent_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE
);

-- 4. Tabela de Professores
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK (length(name) >= 3),
    email TEXT UNIQUE CHECK (email LIKE '%@%'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Disciplinas que o Professor Leciona
CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    PRIMARY KEY (teacher_id, subject),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- 6. Tabela de Turmas
CREATE TABLE IF NOT EXISTS classrooms (
    classroom_id INTEGER PRIMARY KEY AUTOINCREMENT,
    year TEXT NOT NULL,
    identifier TEXT NOT NULL CHECK (length(identifier) = 1),
    shift TEXT NOT NULL CHECK (shift IN ('MANHA', 'TARDE', 'NOITE', 'INTEGRAL')),
    education_level TEXT NOT NULL CHECK (education_level IN ('INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO')),
    teacher_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (year, identifier, shift),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL
);

-- 7. Tabela de Matrículas nas Turmas
CREATE TABLE IF NOT EXISTS classroom_enrollments (
    enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    academic_year INTEGER NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'COMPLETED')),
    UNIQUE (student_id, classroom_id, academic_year),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(classroom_id) ON DELETE RESTRICT
);

-- 8. Tabela de Avaliações
CREATE TABLE IF NOT EXISTS assessments (
    assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    max_score REAL DEFAULT 10.0 CHECK (max_score BETWEEN 0.0 AND 10.0),
    weight REAL DEFAULT 1.0 CHECK (weight BETWEEN 0.0 AND 10.0),
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('PROVA', 'TRABALHO', 'SEMINARIO', 'PARTICIPACAO', 'ATIVIDADE_PRATICA', 'PROJETO')),
    bimester TEXT NOT NULL CHECK (bimester IN ('PRIMEIRO', 'SEGUNDO', 'TERCEIRO', 'QUARTO')),
    academic_year INTEGER NOT NULL,
    assessment_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela de Notas de Alunos
CREATE TABLE IF NOT EXISTS grades (
    grade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    assessment_id INTEGER NOT NULL,
    score REAL NOT NULL CHECK (score >= 0.0),
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_by TEXT,
    UNIQUE (student_id, assessment_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) ON DELETE RESTRICT
);

-- 10. Tabela de Controle de Frequência Diária
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    is_present INTEGER NOT NULL CHECK (is_present IN (0, 1)),
    is_justified INTEGER DEFAULT 0 CHECK (is_justified IN (0, 1)),
    justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, subject, attendance_date),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 11. Tabela de Boletins Consolidados
CREATE TABLE IF NOT EXISTS report_cards (
    report_card_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    bimester TEXT NOT NULL CHECK (bimester IN ('PRIMEIRO', 'SEGUNDO', 'TERCEIRO', 'QUARTO')),
    academic_year INTEGER NOT NULL,
    education_level TEXT CHECK (education_level IN ('INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO')),
    grade REAL CHECK (grade BETWEEN 0.0 AND 10.0),
    development_level TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, subject, bimester, academic_year),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 12. Tabela de Avisos e Comunicados
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(title) >= 3),
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('GENERAL', 'IMPORTANT', 'URGENT', 'EVENT')),
    sender_role TEXT NOT NULL CHECK (sender_role IN ('COORDENACAO', 'DIRECAO', 'SECRETARIA', 'PROFESSOR')),
    sender_name TEXT NOT NULL,
    sender TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('ALL', 'CLASSROOM', 'STUDENT')),
    classroom_id INTEGER,
    student_id INTEGER,
    subject TEXT,
    tags TEXT, -- JSON Array: [{"label": "Recuperação", "color": "#1B4F8A", "bg": "#EEF2F7"}]
    date_published TEXT NOT NULL,
    is_read INTEGER DEFAULT 0 CHECK (is_read IN (0, 1)),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Índices Recomendados para Otimização de Consultas
CREATE INDEX IF NOT EXISTS idx_student_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_parent_name ON parents(name);
CREATE INDEX IF NOT EXISTS idx_teacher_name ON teachers(name);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_subject ON attendance(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_grade_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_subject_bimester ON assessments(subject, bimester);
CREATE INDEX IF NOT EXISTS idx_enrollment_student ON classroom_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_classroom ON classroom_enrollments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_report_student_year ON report_cards(student_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target_type, classroom_id, student_id);

