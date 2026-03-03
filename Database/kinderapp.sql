-- Creeaza baza de date daca nu exista deja
CREATE DATABASE IF NOT EXISTS KinderApp;
USE KinderApp;

-- 1. Parents
-- Stocheaza conturile parintilor (utilizatorii principali).
-- Parintele este singurul care se inregistreaza cu email + parola.
-- Copiii nu au cont propriu - ei se identifica prin PIN.

CREATE TABLE Parents (
    Id_parent INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Password_p VARCHAR(255) NOT NULL,
    First_name VARCHAR(100) NOT NULL,
    Last_name VARCHAR(100) NOT NULL,
    Is_active TINYINT(1) NOT NULL DEFAULT 1, -- 1 = cont activ, 0 = cont dezactivat
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Children
-- Profilul copilului, creat si gestionat de parinte.
-- Un parinte poate avea mai multi copii (relatie 1:N cu Parents).
-- Copilul nu are email - se logheaza prin emailul parintelui + PIN.

CREATE TABLE Children (
    Id_child INT AUTO_INCREMENT PRIMARY KEY,
    Id_parent INT NOT NULL,
    First_name VARCHAR(100) NOT NULL,
    Last_name VARCHAR(100) NOT NULL,
    Birth_date DATE NULL,
    Description_child VARCHAR(255) NULL,
    Pin_child VARCHAR(255) NOT NULL, -- PIN-ul copilului
    Avatar VARCHAR(500) NULL, -- URL imagine profil
    Is_active TINYINT(1) NOT NULL DEFAULT 1,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_parent) REFERENCES Parents(Id_parent) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Sessions
-- Gestioneaza sesiunile active de autentificare.
-- O sesiune poate apartine unui PARINTE sau unui COPIL, nu ambilor.
-- Type_session determina ce pagini si actiuni sunt permise in aplicatie.
-- Sesiunile pot fi invalidate prin Is_active = 0.

CREATE TABLE Sessions (
    Id_session INT AUTO_INCREMENT PRIMARY KEY,
    Token_session VARCHAR(500) NOT NULL UNIQUE,
    Type_session ENUM('parent','child') NOT NULL,
    Id_parent INT NULL,
    Id_child INT NULL,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Expires_at DATETIME NOT NULL,
    Is_active TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (Id_parent) REFERENCES Parents(Id_parent) ON DELETE CASCADE,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child),
    CHECK (
        (Type_session='parent' AND Id_parent IS NOT NULL AND Id_child IS NULL) OR
        (Type_session='child' AND Id_child IS NOT NULL AND Id_parent IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. LoginAttempts
-- Inregistreaza toate incercarile de autentificare (reusit + esuat).
-- Folosit pentru protectie anti-brute-force si audit.
-- Type_attempt:
--   'parent'      = login parinte
--   'child_pin'   = login copil cu PIN
--   'child_trick' = copil incearca sa intre ca parinte

CREATE TABLE LoginAttempts (
    Id_attempt INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(150) NOT NULL,
    Id_child INT NULL,
    Type_attempt ENUM('parent','child_pin','child_trick') NOT NULL,
    Success TINYINT(1) NOT NULL DEFAULT 0,
    Ip_address VARCHAR(45) NULL,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SkillCategories
-- Categoriile de abilitati/comportamente.
-- Exemple: Responsabilitate, Disciplina, Citit, Sport.

CREATE TABLE SkillCategories (
    Id_category INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(500) NULL,
    Icon VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ChildSkillGoals
-- Ce doreste parintele sa imbunatateasca la copil.
-- Priority: 1 = cel mai important, 5 = mai putin important.

CREATE TABLE ChildSkillGoals (
    Id_goal INT AUTO_INCREMENT PRIMARY KEY,
    Id_child INT NOT NULL,
    Id_category INT NOT NULL,
    Priority TINYINT NOT NULL DEFAULT 1,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child) ON DELETE CASCADE,
    FOREIGN KEY (Id_category) REFERENCES SkillCategories(Id_category),
    CHECK (Priority BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Rewards
-- Recompensa stabilita de parinte pentru copil.
-- Este acordata doar daca pragul de succes este atins.

CREATE TABLE Rewards (
    Id_reward INT AUTO_INCREMENT PRIMARY KEY,
    Id_child INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NULL,
    Image_url VARCHAR(500) NULL,
    Is_claimed TINYINT(1) NOT NULL DEFAULT 0, -- 0 = neacordata, 1 = acordata
    Claimed DATETIME NULL,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Cycles
-- Perioada de evaluare definita de parinte.
-- Daca copilul atinge Success_threshold %, primeste recompensa.

CREATE TABLE Cycles (
    Id_cycle INT AUTO_INCREMENT PRIMARY KEY,
    Id_child INT NOT NULL,
    Id_reward INT NULL,
    Start_date DATE NOT NULL,
    End_date DATE NOT NULL,
    Success_threshold DECIMAL(5,2) NOT NULL DEFAULT 85.00,
    Status ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
    Final_score DECIMAL(5,2) NULL,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child) ON DELETE CASCADE,
    FOREIGN KEY (Id_reward) REFERENCES Rewards(Id_reward),
    CHECK (End_date > Start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. TaskTemplates
-- Sablon predefinit de task.
-- System_is = 1 = sablon sistem, 0 = sablon custom creat de parinte.

CREATE TABLE TaskTemplates (
    Id_template INT AUTO_INCREMENT PRIMARY KEY,
    Id_category INT NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NULL,
    Frequency ENUM('daily','weekly') NOT NULL DEFAULT 'daily',
    Difficulty TINYINT NOT NULL DEFAULT 1,
    System_is TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (Id_category) REFERENCES SkillCategories(Id_category),
    CHECK (Difficulty BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Tasks
-- Taskuri asignate copilului in cadrul unui ciclu.
-- Pot fi generate automat sau adaugate manual de parinte.

CREATE TABLE Tasks (
    Id_task INT AUTO_INCREMENT PRIMARY KEY,
    Id_cycle INT NOT NULL,
    Id_child INT NOT NULL,
    Id_template INT NULL,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NULL,
    Frequency ENUM('daily','weekly') NOT NULL DEFAULT 'daily',
    Due_date DATE NULL,
    Created_by INT NOT NULL,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_cycle) REFERENCES Cycles(Id_cycle) ON DELETE CASCADE,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child),
    FOREIGN KEY (Id_template) REFERENCES TaskTemplates(Id_template),
    FOREIGN KEY (Created_by) REFERENCES Parents(Id_parent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. TaskCompletions
-- Inregistreaza cand copilul marcheaza taskul ca realizat.
-- Un task poate fi marcat o singura data pe zi.

CREATE TABLE TaskCompletions (
    Id_completion INT AUTO_INCREMENT PRIMARY KEY,
    Id_task INT NOT NULL,
    Date_completion DATE NOT NULL DEFAULT (CURRENT_DATE),
    Id_child INT NOT NULL,
    Verified INT NULL,
    Status ENUM('pending','completed','rejected') NOT NULL DEFAULT 'pending',
    Notes VARCHAR(500) NULL,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (Id_task, Date_completion),
    FOREIGN KEY (Id_task) REFERENCES Tasks(Id_task) ON DELETE CASCADE,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child),
    FOREIGN KEY (Verified) REFERENCES Parents(Id_parent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Notifications
-- Notificari trimise parintelui sau copilului.
-- O notificare poate apartine doar unuia dintre ei.

CREATE TABLE Notifications (
    Id_note INT AUTO_INCREMENT PRIMARY KEY,
    Id_parent INT NULL,
    Id_child INT NULL,
    Title VARCHAR(200) NOT NULL,
    Message VARCHAR(1000) NOT NULL,
    Type ENUM('info','success','warning','alert') NOT NULL DEFAULT 'info',
    Read_is TINYINT(1) NOT NULL DEFAULT 0,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_parent) REFERENCES Parents(Id_parent) ON DELETE CASCADE,
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child),
    CHECK (
        (Id_parent IS NOT NULL AND Id_child IS NULL) OR
        (Id_child IS NOT NULL AND Id_parent IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. EvaluationReports
-- Raport generat la finalul unui ciclu.
-- Folosit pentru statistici.

CREATE TABLE EvaluationReports (
    Id_report INT AUTO_INCREMENT PRIMARY KEY,
    Id_cycle INT NOT NULL,
    Total_tasks INT NOT NULL,
    Completed_tasks INT NOT NULL,
    Score_percent DECIMAL(5,2) NOT NULL,
    Reward_earned TINYINT(1) NOT NULL DEFAULT 0,
    Generated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_cycle) REFERENCES Cycles(Id_cycle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. AuditLog
-- Inregistreaza actiunile importante pentru audit si securitate.

CREATE TABLE AuditLog (
    Id_log INT AUTO_INCREMENT PRIMARY KEY,
    Table_name VARCHAR(100) NOT NULL,
    Action ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    Record_id INT NOT NULL,
    Id_parent INT NULL,
    Id_child INT NULL,
    Details TEXT NULL,
    Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_parent) REFERENCES Parents(Id_parent),
    FOREIGN KEY (Id_child) REFERENCES Children(Id_child)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;