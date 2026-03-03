-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gazdă: 127.0.0.1
-- Timp de generare: mart. 03, 2026 la 10:38 PM
-- Versiune server: 10.4.32-MariaDB
-- Versiune PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Bază de date: `kinderapp`
--

DELIMITER $$
--
-- Proceduri
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_AddChild` (IN `p_id_parent` INT, IN `p_first_name` VARCHAR(100), IN `p_last_name` VARCHAR(100), IN `p_birth_date` DATE, IN `p_description` VARCHAR(255), IN `p_pin_hash` VARCHAR(255), IN `p_avatar` VARCHAR(500), OUT `p_new_id` INT, OUT `p_result` INT)   sp_AddChild: BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_new_id = 0; SET p_result = 1;
    IF (SELECT COUNT(*) FROM Parents WHERE Id_parent = p_id_parent AND Is_active = 1) = 0 THEN
        SET p_result = 1; LEAVE sp_AddChild;
    END IF;
    START TRANSACTION;
    INSERT INTO Children (Id_parent, First_name, Last_name, Birth_date, Description_child, Pin_child, Avatar)
    VALUES (p_id_parent, p_first_name, p_last_name, p_birth_date, p_description, p_pin_hash, p_avatar);
    SET p_new_id = LAST_INSERT_ID();
    INSERT INTO AuditLog (Table_name, Action, Record_id, Id_parent, Id_child, Details)
    VALUES ('Children','INSERT', p_new_id, p_id_parent, p_new_id,
            CONCAT('Copil adaugat: ', p_first_name,' ',p_last_name));
    COMMIT; SET p_result = 0;
END sp_AddChild$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ChildAttemptParentLogin` (IN `p_parent_email` VARCHAR(150), IN `p_pass_hash` VARCHAR(255), IN `p_id_child` INT, IN `p_ip` VARCHAR(45), OUT `p_token` VARCHAR(500), OUT `p_result` INT)   sp_ChildAttemptParentLogin:BEGIN
    DECLARE v_id_parent   INT DEFAULT NULL;
    DECLARE v_stored_hash VARCHAR(255) DEFAULT NULL;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_token = NULL; SET p_result = 2;
    SELECT Id_parent, Password_p INTO v_id_parent, v_stored_hash
    FROM Parents WHERE Email = p_parent_email AND Is_active = 1 LIMIT 1;
    IF v_id_parent IS NULL THEN SET p_result = 2; LEAVE sp_ChildAttemptParentLogin; END IF;
    INSERT INTO LoginAttempts (Email,Id_child,Type_attempt,Success,Ip_address)
    VALUES (p_parent_email,p_id_child,'child_trick',0,p_ip);
    IF v_stored_hash <> p_pass_hash THEN
        INSERT INTO Notifications (Id_parent, Title, Message, Type)
        VALUES (v_id_parent,'Tentativa de acces suspecta!',
                CONCAT('Cineva a incercat sa se logheze ca tine. IP: ',IFNULL(p_ip,'necunoscut')),
                'alert');
        SET p_result = 1; LEAVE sp_ChildAttemptParentLogin;
    END IF;
    START TRANSACTION;
    UPDATE Sessions SET Is_active = 0 WHERE Id_parent = v_id_parent AND Type_session = 'parent';
    SET p_token = CONCAT(REPLACE(UUID(),'-',''), REPLACE(UUID(),'-',''));
    INSERT INTO Sessions (Token_session, Type_session, Id_parent, Ip_address, Expires_at)
    VALUES (p_token,'parent',v_id_parent,p_ip,DATE_ADD(NOW(), INTERVAL 8 HOUR));
    COMMIT; SET p_result = 0;
END sp_ChildAttemptParentLogin$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_CompleteTask` (IN `p_id_task` INT, IN `p_id_child` INT, IN `p_notes` VARCHAR(500), OUT `p_result` INT)   sp_CompleteTask:BEGIN
    DECLARE v_id_parent  INT DEFAULT NULL;
    DECLARE v_task_title VARCHAR(200) DEFAULT '';
    DECLARE v_child_name VARCHAR(100) DEFAULT '';
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_result = 1;
    IF (SELECT COUNT(*) FROM Tasks WHERE Id_task=p_id_task AND Id_child=p_id_child) = 0 THEN
        SET p_result = 1; LEAVE sp_CompleteTask;
    END IF;
    IF (SELECT COUNT(*) FROM TaskCompletions
        WHERE Id_task=p_id_task AND Date_completion=CURDATE()) > 0 THEN
        SET p_result = 2; LEAVE sp_CompleteTask;
    END IF;
    START TRANSACTION;
    INSERT INTO TaskCompletions (Id_task, Date_completion, Id_child, Status, Notes)
    VALUES (p_id_task, CURDATE(), p_id_child, 'completed', p_notes);
    SELECT Id_parent  INTO v_id_parent  FROM Children WHERE Id_child=p_id_child LIMIT 1;
    SELECT Title      INTO v_task_title FROM Tasks    WHERE Id_task=p_id_task   LIMIT 1;
    SELECT First_name INTO v_child_name FROM Children WHERE Id_child=p_id_child LIMIT 1;
    INSERT INTO Notifications (Id_parent, Title, Message, Type)
    VALUES (v_id_parent,'Task completat!',
            CONCAT(v_child_name,' a bifat: "',v_task_title,'"'),'success');
    COMMIT; SET p_result = 0;
END sp_CompleteTask$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_CreateCycleWithTasks` (IN `p_id_parent` INT, IN `p_id_child` INT, IN `p_reward_name` VARCHAR(200), IN `p_start_date` DATE, IN `p_end_date` DATE, IN `p_threshold` DECIMAL(5,2), OUT `p_new_cycle_id` INT, OUT `p_result` INT)   sp_CreateCycleWithTasks:BEGIN
    DECLARE v_id_reward INT DEFAULT NULL;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_new_cycle_id = 0; SET p_result = 1;
    IF (SELECT COUNT(*) FROM Children
        WHERE Id_child=p_id_child AND Id_parent=p_id_parent AND Is_active=1) = 0 THEN
        SET p_result = 1; LEAVE sp_CreateCycleWithTasks;
    END IF;
    IF p_end_date <= p_start_date THEN SET p_result = 2; LEAVE sp_CreateCycleWithTasks; END IF;
    START TRANSACTION;
    INSERT INTO Rewards (Id_child, Name) VALUES (p_id_child, p_reward_name);
    SET v_id_reward = LAST_INSERT_ID();
    INSERT INTO Cycles (Id_child, Id_reward, Start_date, End_date, Success_threshold)
    VALUES (p_id_child, v_id_reward, p_start_date, p_end_date, p_threshold);
    SET p_new_cycle_id = LAST_INSERT_ID();
    INSERT INTO Tasks (Id_cycle,Id_child,Id_template,Title,Description,Frequency,Created_by,Is_custom)
    SELECT p_new_cycle_id, p_id_child, tt.Id_template,
           tt.Title, tt.Description, tt.Frequency, p_id_parent, 0
    FROM TaskTemplates tt
    INNER JOIN ChildSkillGoals csg ON csg.Id_category = tt.Id_category
    WHERE csg.Id_child = p_id_child AND tt.System_is = 1;
    INSERT INTO AuditLog (Table_name,Action,Record_id,Id_parent,Id_child,Details)
    VALUES ('Cycles','INSERT',p_new_cycle_id,p_id_parent,p_id_child,
            CONCAT('Ciclu creat. Recompensa: ',p_reward_name));
    COMMIT; SET p_result = 0;
END sp_CreateCycleWithTasks$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_EvaluateCycle` (IN `p_id_cycle` INT, IN `p_id_parent` INT, OUT `p_result` INT)   sp_EvaluateCycle:BEGIN
    DECLARE v_score      DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_earned     TINYINT(1)   DEFAULT 0;
    DECLARE v_total      INT          DEFAULT 0;
    DECLARE v_completed  INT          DEFAULT 0;
    DECLARE v_id_reward  INT          DEFAULT NULL;
    DECLARE v_id_child   INT          DEFAULT NULL;
    DECLARE v_child_name VARCHAR(100) DEFAULT '';
    DECLARE v_threshold  DECIMAL(5,2) DEFAULT 85.00;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_result = 1;
    IF (SELECT COUNT(*) FROM Cycles cy
        INNER JOIN Children ch ON cy.Id_child=ch.Id_child
        WHERE cy.Id_cycle=p_id_cycle AND ch.Id_parent=p_id_parent) = 0 THEN
        SET p_result = 1; LEAVE sp_EvaluateCycle;
    END IF;
    SET v_score  = fn_GetCycleCompletionPercent(p_id_cycle);
    SET v_earned = fn_HasEarnedReward(p_id_cycle);
    SELECT COUNT(*) INTO v_total FROM Tasks WHERE Id_cycle=p_id_cycle;
    SELECT COUNT(DISTINCT tc.Id_task) INTO v_completed
    FROM TaskCompletions tc INNER JOIN Tasks t ON tc.Id_task=t.Id_task
    WHERE t.Id_cycle=p_id_cycle AND tc.Status='completed';
    SELECT Id_reward,Id_child,Success_threshold INTO v_id_reward,v_id_child,v_threshold
    FROM Cycles WHERE Id_cycle=p_id_cycle LIMIT 1;
    SELECT First_name INTO v_child_name FROM Children WHERE Id_child=v_id_child LIMIT 1;
    START TRANSACTION;
    UPDATE Cycles SET Status='completed', Final_score=v_score WHERE Id_cycle=p_id_cycle;
    INSERT INTO EvaluationReports (Id_cycle,Total_tasks,Completed_tasks,Score_percent,Reward_earned)
    VALUES (p_id_cycle,v_total,v_completed,v_score,v_earned);
    IF v_earned=1 AND v_id_reward IS NOT NULL THEN
        UPDATE Rewards SET Is_claimed=1, Claimed=NOW() WHERE Id_reward=v_id_reward;
        INSERT INTO Notifications (Id_parent,Title,Message,Type)
        VALUES (p_id_parent,'Recompensa castigata!',
                CONCAT(v_child_name,' a obtinut ',v_score,'% si a castigat recompensa!'),'success');
        INSERT INTO Notifications (Id_child,Title,Message,Type)
        VALUES (v_id_child,'Felicitari! Ai castigat!',
                CONCAT('Scor final: ',v_score,'%. Recompensa ta te asteapta!'),'success');
    ELSE
        INSERT INTO Notifications (Id_parent,Title,Message,Type)
        VALUES (p_id_parent,'Ciclu finalizat',
                CONCAT(v_child_name,' a obtinut ',v_score,'%. Pragul de ',v_threshold,'% nu a fost atins.'),
                'warning');
    END IF;
    INSERT INTO AuditLog (Table_name,Action,Record_id,Id_parent,Id_child,Details)
    VALUES ('Cycles','UPDATE',p_id_cycle,p_id_parent,v_id_child,
            CONCAT('Evaluare. Scor: ',v_score,'%, Recompensa: ',v_earned));
    COMMIT; SET p_result = 0;
END sp_EvaluateCycle$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetChildrenForLogin` (IN `p_parent_email` VARCHAR(150), OUT `p_result` INT)   sp_GetChildrenForLogin:BEGIN
    SET p_result = 1;
    IF (SELECT COUNT(*) FROM Parents WHERE Email = p_parent_email AND Is_active = 1) = 0 THEN
        SET p_result = 1; LEAVE sp_GetChildrenForLogin;
    END IF;
    SET p_result = 0;
    SELECT c.Id_child, c.First_name, c.Last_name, c.Avatar,
           fn_GetChildAge(c.Id_child) AS Age
    FROM Children c
    INNER JOIN Parents p ON c.Id_parent = p.Id_parent
    WHERE p.Email = p_parent_email AND c.Is_active = 1;
END sp_GetChildrenForLogin$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_LoginChild` (IN `p_parent_email` VARCHAR(150), IN `p_id_child` INT, IN `p_pin_hash` VARCHAR(255), IN `p_ip` VARCHAR(45), OUT `p_token` VARCHAR(500), OUT `p_result` INT)   sp_LoginChild: BEGIN
    DECLARE v_id_parent    INT DEFAULT NULL;
    DECLARE v_child_parent INT DEFAULT NULL;
    DECLARE v_stored_pin   VARCHAR(255) DEFAULT NULL;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_token = NULL; SET p_result = 1;
    SELECT Id_parent INTO v_id_parent FROM Parents
    WHERE Email = p_parent_email AND Is_active = 1 LIMIT 1;
    IF v_id_parent IS NULL THEN SET p_result = 1; LEAVE sp_LoginChild; END IF;
    SELECT Id_parent, Pin_child INTO v_child_parent, v_stored_pin
    FROM Children WHERE Id_child = p_id_child AND Is_active = 1 LIMIT 1;
    IF v_child_parent IS NULL OR v_child_parent <> v_id_parent THEN
        INSERT INTO LoginAttempts (Email,Id_child,Type_attempt,Success,Ip_address)
        VALUES (p_parent_email,p_id_child,'child_pin',0,p_ip);
        SET p_result = 3; LEAVE sp_LoginChild;
    END IF;
    IF v_stored_pin <> p_pin_hash THEN
        INSERT INTO LoginAttempts (Email,Id_child,Type_attempt,Success,Ip_address)
        VALUES (p_parent_email,p_id_child,'child_pin',0,p_ip);
        SET p_result = 2; LEAVE sp_LoginChild;
    END IF;
    START TRANSACTION;
    UPDATE Sessions SET Is_active = 0 WHERE Id_child = p_id_child AND Type_session = 'child';
    SET p_token = CONCAT(REPLACE(UUID(),'-',''), REPLACE(UUID(),'-',''));
    INSERT INTO Sessions (Token_session, Type_session, Id_child, Ip_address, Expires_at)
    VALUES (p_token,'child',p_id_child,p_ip,DATE_ADD(NOW(), INTERVAL 4 HOUR));
    INSERT INTO LoginAttempts (Email,Id_child,Type_attempt,Success,Ip_address)
    VALUES (p_parent_email,p_id_child,'child_pin',1,p_ip);
    COMMIT; SET p_result = 0;
END sp_LoginChild$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_LoginParent` (IN `p_email` VARCHAR(150), IN `p_pass_hash` VARCHAR(255), IN `p_ip` VARCHAR(45), OUT `p_token` VARCHAR(500), OUT `p_result` INT)   sp_LoginParent: BEGIN
    DECLARE v_id_parent INT DEFAULT NULL;
    DECLARE v_stored_hash VARCHAR(255) DEFAULT NULL;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_token = NULL; SET p_result = 1;
    IF fn_IsAccountLocked(p_email) = 1 THEN SET p_result = 3; LEAVE sp_LoginParent; END IF;
    SELECT Id_parent, Password_p INTO v_id_parent, v_stored_hash
    FROM Parents WHERE Email = p_email AND Is_active = 1 LIMIT 1;
    IF v_id_parent IS NULL THEN
        INSERT INTO LoginAttempts (Email, Type_attempt, Success, Ip_address) VALUES (p_email,'parent',0,p_ip);
        SET p_result = 1; LEAVE sp_LoginParent;
    END IF;
    IF v_stored_hash <> p_pass_hash THEN
        INSERT INTO LoginAttempts (Email, Type_attempt, Success, Ip_address) VALUES (p_email,'parent',0,p_ip);
        SET p_result = 2; LEAVE sp_LoginParent;
    END IF;
    START TRANSACTION;
    UPDATE Sessions SET Is_active = 0 WHERE Id_parent = v_id_parent AND Type_session = 'parent';
    SET p_token = CONCAT(REPLACE(UUID(),'-',''), REPLACE(UUID(),'-',''));
    INSERT INTO Sessions (Token_session, Type_session, Id_parent, Ip_address, Expires_at)
    VALUES (p_token, 'parent', v_id_parent, p_ip, DATE_ADD(NOW(), INTERVAL 8 HOUR));
    INSERT INTO LoginAttempts (Email, Type_attempt, Success, Ip_address) VALUES (p_email,'parent',1,p_ip);
    COMMIT; SET p_result = 0;
END sp_LoginParent$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_RegisterParent` (IN `p_email` VARCHAR(150), IN `p_pass_hash` VARCHAR(255), IN `p_first_name` VARCHAR(100), IN `p_last_name` VARCHAR(100), OUT `p_new_id` INT, OUT `p_result` INT)   sp_RegisterParent:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_result = -1; END;
    SET p_new_id = 0; SET p_result = 1;
    IF (SELECT COUNT(*) FROM Parents WHERE Email = p_email) > 0 THEN
        SET p_result = 1; LEAVE sp_RegisterParent;
    END IF;
    START TRANSACTION;
    INSERT INTO Parents (Email, Password_p, First_name, Last_name)
    VALUES (p_email, p_pass_hash, p_first_name, p_last_name);
    SET p_new_id = LAST_INSERT_ID();
    INSERT INTO AuditLog (Table_name, Action, Record_id, Id_parent, Details)
    VALUES ('Parents', 'INSERT', p_new_id, p_new_id, CONCAT('Parinte inregistrat: ', p_email));
    COMMIT; SET p_result = 0;
END sp_RegisterParent$$

--
-- Funcții
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_GetChildAge` (`p_id_child` INT) RETURNS INT(11) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_birth DATE;
    DECLARE v_age   INT DEFAULT NULL;
    SELECT Birth_date INTO v_birth FROM Children WHERE Id_child = p_id_child LIMIT 1;
    IF v_birth IS NULL THEN RETURN NULL; END IF;
    SET v_age = TIMESTAMPDIFF(YEAR, v_birth, CURDATE());
    RETURN v_age;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_GetCycleCompletionPercent` (`p_id_cycle` INT) RETURNS DECIMAL(5,2) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_total     INT DEFAULT 0;
    DECLARE v_completed INT DEFAULT 0;
    SELECT COUNT(*) INTO v_total FROM Tasks WHERE Id_cycle = p_id_cycle;
    IF v_total = 0 THEN RETURN 0.00; END IF;
    SELECT COUNT(DISTINCT tc.Id_task) INTO v_completed
    FROM TaskCompletions tc
    INNER JOIN Tasks t ON tc.Id_task = t.Id_task
    WHERE t.Id_cycle = p_id_cycle AND tc.Status = 'completed';
    RETURN ROUND((v_completed / v_total) * 100, 2);
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_GetDailyCompletedTasks` (`p_id_child` INT, `p_date` DATE) RETURNS INT(11) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_count INT DEFAULT 0;
    SELECT COUNT(*) INTO v_count
    FROM TaskCompletions tc
    INNER JOIN Tasks t ON tc.Id_task = t.Id_task
    WHERE t.Id_child = p_id_child AND tc.Date_completion = p_date AND tc.Status = 'completed';
    RETURN IFNULL(v_count, 0);
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_HasEarnedReward` (`p_id_cycle` INT) RETURNS TINYINT(1) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_score     DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_threshold DECIMAL(5,2) DEFAULT 85.00;
    SET v_score = fn_GetCycleCompletionPercent(p_id_cycle);
    SELECT Success_threshold INTO v_threshold FROM Cycles WHERE Id_cycle = p_id_cycle LIMIT 1;
    IF v_score >= v_threshold THEN RETURN 1; END IF;
    RETURN 0;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_IsAccountLocked` (`p_email` VARCHAR(150)) RETURNS TINYINT(1) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_count INT DEFAULT 0;
    SELECT COUNT(*) INTO v_count FROM LoginAttempts
    WHERE Email = p_email AND Success = 0
      AND Created >= DATE_SUB(NOW(), INTERVAL 15 MINUTE);
    IF v_count >= 5 THEN RETURN 1; END IF;
    RETURN 0;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `auditlog`
--

CREATE TABLE `auditlog` (
  `Id_log` int(11) NOT NULL,
  `Table_name` varchar(100) NOT NULL,
  `Action` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `Record_id` int(11) NOT NULL,
  `Id_parent` int(11) DEFAULT NULL,
  `Id_child` int(11) DEFAULT NULL,
  `Details` text DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `children`
--

CREATE TABLE `children` (
  `Id_child` int(11) NOT NULL,
  `Id_parent` int(11) NOT NULL,
  `First_name` varchar(100) NOT NULL,
  `Last_name` varchar(100) NOT NULL,
  `Birth_date` date DEFAULT NULL,
  `Description_child` varchar(255) DEFAULT NULL,
  `Pin_child` varchar(255) NOT NULL,
  `Avatar` varchar(500) DEFAULT NULL,
  `Is_active` tinyint(1) NOT NULL DEFAULT 1,
  `Created` datetime NOT NULL DEFAULT current_timestamp(),
  `Updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `childskillgoals`
--

CREATE TABLE `childskillgoals` (
  `Id_goal` int(11) NOT NULL,
  `Id_child` int(11) NOT NULL,
  `Id_category` int(11) NOT NULL,
  `Priority` tinyint(4) NOT NULL DEFAULT 1,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `cycles`
--

CREATE TABLE `cycles` (
  `Id_cycle` int(11) NOT NULL,
  `Id_child` int(11) NOT NULL,
  `Id_reward` int(11) DEFAULT NULL,
  `Start_date` date NOT NULL,
  `End_date` date NOT NULL,
  `Success_threshold` decimal(5,2) NOT NULL DEFAULT 85.00,
  `Status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `Final_score` decimal(5,2) DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `evaluationreports`
--

CREATE TABLE `evaluationreports` (
  `Id_report` int(11) NOT NULL,
  `Id_cycle` int(11) NOT NULL,
  `Total_tasks` int(11) NOT NULL,
  `Completed_tasks` int(11) NOT NULL,
  `Score_percent` decimal(5,2) NOT NULL,
  `Reward_earned` tinyint(1) NOT NULL DEFAULT 0,
  `Generated` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `loginattempts`
--

CREATE TABLE `loginattempts` (
  `Id_attempt` int(11) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Id_child` int(11) DEFAULT NULL,
  `Type_attempt` enum('parent','child_pin','child_trick') NOT NULL,
  `Success` tinyint(1) NOT NULL DEFAULT 0,
  `Ip_address` varchar(45) DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `notifications`
--

CREATE TABLE `notifications` (
  `Id_note` int(11) NOT NULL,
  `Id_parent` int(11) DEFAULT NULL,
  `Id_child` int(11) DEFAULT NULL,
  `Title` varchar(200) NOT NULL,
  `Message` varchar(1000) NOT NULL,
  `Type` enum('info','success','warning','alert') NOT NULL DEFAULT 'info',
  `Read_is` tinyint(1) NOT NULL DEFAULT 0,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `parents`
--

CREATE TABLE `parents` (
  `Id_parent` int(11) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Password_p` varchar(255) NOT NULL,
  `First_name` varchar(100) NOT NULL,
  `Last_name` varchar(100) NOT NULL,
  `Is_active` tinyint(1) NOT NULL DEFAULT 1,
  `Created` datetime NOT NULL DEFAULT current_timestamp(),
  `Updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `rewards`
--

CREATE TABLE `rewards` (
  `Id_reward` int(11) NOT NULL,
  `Id_child` int(11) NOT NULL,
  `Name` varchar(200) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Image_url` varchar(500) DEFAULT NULL,
  `Is_claimed` tinyint(1) NOT NULL DEFAULT 0,
  `Claimed` datetime DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `sessions`
--

CREATE TABLE `sessions` (
  `Id_session` int(11) NOT NULL,
  `Token_session` varchar(500) NOT NULL,
  `Type_session` enum('parent','child') NOT NULL,
  `Id_parent` int(11) DEFAULT NULL,
  `Id_child` int(11) DEFAULT NULL,
  `Ip_address` varchar(45) DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp(),
  `Expires_at` datetime NOT NULL,
  `Is_active` tinyint(1) NOT NULL DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `skillcategories`
--

CREATE TABLE `skillcategories` (
  `Id_category` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Icon` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `taskcompletions`
--

CREATE TABLE `taskcompletions` (
  `Id_completion` int(11) NOT NULL,
  `Id_task` int(11) NOT NULL,
  `Date_completion` date NOT NULL DEFAULT curdate(),
  `Id_child` int(11) NOT NULL,
  `Verified` int(11) DEFAULT NULL,
  `Status` enum('pending','completed','rejected') NOT NULL DEFAULT 'pending',
  `Notes` varchar(500) DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `tasks`
--

CREATE TABLE `tasks` (
  `Id_task` int(11) NOT NULL,
  `Id_cycle` int(11) NOT NULL,
  `Id_child` int(11) NOT NULL,
  `Id_template` int(11) DEFAULT NULL,
  `Title` varchar(200) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Is_custom` tinyint(1) NOT NULL DEFAULT 0,
  `Frequency` enum('daily','weekly') NOT NULL DEFAULT 'daily',
  `Due_date` date DEFAULT NULL,
  `Created_by` int(11) NOT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `tasktemplates`
--

CREATE TABLE `tasktemplates` (
  `Id_template` int(11) NOT NULL,
  `Id_category` int(11) NOT NULL,
  `Title` varchar(200) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Frequency` enum('daily','weekly') NOT NULL DEFAULT 'daily',
  `Difficulty` tinyint(4) NOT NULL DEFAULT 1,
  `System_is` tinyint(1) NOT NULL DEFAULT 1
) ;

--
-- Indexuri pentru tabele eliminate
--

--
-- Indexuri pentru tabele `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`Id_log`),
  ADD KEY `Id_parent` (`Id_parent`),
  ADD KEY `Id_child` (`Id_child`);

--
-- Indexuri pentru tabele `children`
--
ALTER TABLE `children`
  ADD PRIMARY KEY (`Id_child`),
  ADD KEY `IX_Children_IdParent` (`Id_parent`);

--
-- Indexuri pentru tabele `childskillgoals`
--
ALTER TABLE `childskillgoals`
  ADD PRIMARY KEY (`Id_goal`),
  ADD KEY `Id_child` (`Id_child`),
  ADD KEY `Id_category` (`Id_category`);

--
-- Indexuri pentru tabele `cycles`
--
ALTER TABLE `cycles`
  ADD PRIMARY KEY (`Id_cycle`),
  ADD KEY `Id_reward` (`Id_reward`),
  ADD KEY `IX_Cycles_Status` (`Id_child`,`Status`);

--
-- Indexuri pentru tabele `evaluationreports`
--
ALTER TABLE `evaluationreports`
  ADD PRIMARY KEY (`Id_report`),
  ADD KEY `Id_cycle` (`Id_cycle`);

--
-- Indexuri pentru tabele `loginattempts`
--
ALTER TABLE `loginattempts`
  ADD PRIMARY KEY (`Id_attempt`),
  ADD KEY `Id_child` (`Id_child`),
  ADD KEY `IX_Attempts_Email` (`Email`,`Created`);

--
-- Indexuri pentru tabele `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`Id_note`),
  ADD KEY `IX_Notif_Parent` (`Id_parent`,`Read_is`),
  ADD KEY `IX_Notif_Child` (`Id_child`,`Read_is`);

--
-- Indexuri pentru tabele `parents`
--
ALTER TABLE `parents`
  ADD PRIMARY KEY (`Id_parent`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexuri pentru tabele `rewards`
--
ALTER TABLE `rewards`
  ADD PRIMARY KEY (`Id_reward`),
  ADD KEY `Id_child` (`Id_child`);

--
-- Indexuri pentru tabele `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`Id_session`),
  ADD UNIQUE KEY `Token_session` (`Token_session`),
  ADD KEY `IX_Sessions_IdChild` (`Id_child`,`Is_active`),
  ADD KEY `IX_Sessions_IdParent` (`Id_parent`,`Is_active`);

--
-- Indexuri pentru tabele `skillcategories`
--
ALTER TABLE `skillcategories`
  ADD PRIMARY KEY (`Id_category`);

--
-- Indexuri pentru tabele `taskcompletions`
--
ALTER TABLE `taskcompletions`
  ADD PRIMARY KEY (`Id_completion`),
  ADD UNIQUE KEY `Id_task` (`Id_task`,`Date_completion`),
  ADD KEY `Id_child` (`Id_child`),
  ADD KEY `Verified` (`Verified`),
  ADD KEY `IX_TaskComp_IdTask` (`Id_task`),
  ADD KEY `IX_TaskComp_Date` (`Date_completion`);

--
-- Indexuri pentru tabele `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`Id_task`),
  ADD KEY `Id_template` (`Id_template`),
  ADD KEY `Created_by` (`Created_by`),
  ADD KEY `IX_Tasks_IdCycle` (`Id_cycle`),
  ADD KEY `IX_Tasks_IdChild` (`Id_child`);

--
-- Indexuri pentru tabele `tasktemplates`
--
ALTER TABLE `tasktemplates`
  ADD PRIMARY KEY (`Id_template`),
  ADD KEY `Id_category` (`Id_category`);

--
-- AUTO_INCREMENT pentru tabele eliminate
--

--
-- AUTO_INCREMENT pentru tabele `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `Id_log` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `children`
--
ALTER TABLE `children`
  MODIFY `Id_child` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `childskillgoals`
--
ALTER TABLE `childskillgoals`
  MODIFY `Id_goal` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `cycles`
--
ALTER TABLE `cycles`
  MODIFY `Id_cycle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `evaluationreports`
--
ALTER TABLE `evaluationreports`
  MODIFY `Id_report` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `loginattempts`
--
ALTER TABLE `loginattempts`
  MODIFY `Id_attempt` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `notifications`
--
ALTER TABLE `notifications`
  MODIFY `Id_note` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `parents`
--
ALTER TABLE `parents`
  MODIFY `Id_parent` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `rewards`
--
ALTER TABLE `rewards`
  MODIFY `Id_reward` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `sessions`
--
ALTER TABLE `sessions`
  MODIFY `Id_session` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `skillcategories`
--
ALTER TABLE `skillcategories`
  MODIFY `Id_category` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `taskcompletions`
--
ALTER TABLE `taskcompletions`
  MODIFY `Id_completion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `tasks`
--
ALTER TABLE `tasks`
  MODIFY `Id_task` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pentru tabele `tasktemplates`
--
ALTER TABLE `tasktemplates`
  MODIFY `Id_template` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constrângeri pentru tabele eliminate
--

--
-- Constrângeri pentru tabele `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `auditlog_ibfk_1` FOREIGN KEY (`Id_parent`) REFERENCES `parents` (`Id_parent`),
  ADD CONSTRAINT `auditlog_ibfk_2` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`);

--
-- Constrângeri pentru tabele `children`
--
ALTER TABLE `children`
  ADD CONSTRAINT `children_ibfk_1` FOREIGN KEY (`Id_parent`) REFERENCES `parents` (`Id_parent`) ON DELETE CASCADE;

--
-- Constrângeri pentru tabele `childskillgoals`
--
ALTER TABLE `childskillgoals`
  ADD CONSTRAINT `childskillgoals_ibfk_1` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`) ON DELETE CASCADE,
  ADD CONSTRAINT `childskillgoals_ibfk_2` FOREIGN KEY (`Id_category`) REFERENCES `skillcategories` (`Id_category`);

--
-- Constrângeri pentru tabele `cycles`
--
ALTER TABLE `cycles`
  ADD CONSTRAINT `cycles_ibfk_1` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`) ON DELETE CASCADE,
  ADD CONSTRAINT `cycles_ibfk_2` FOREIGN KEY (`Id_reward`) REFERENCES `rewards` (`Id_reward`);

--
-- Constrângeri pentru tabele `evaluationreports`
--
ALTER TABLE `evaluationreports`
  ADD CONSTRAINT `evaluationreports_ibfk_1` FOREIGN KEY (`Id_cycle`) REFERENCES `cycles` (`Id_cycle`);

--
-- Constrângeri pentru tabele `loginattempts`
--
ALTER TABLE `loginattempts`
  ADD CONSTRAINT `loginattempts_ibfk_1` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`);

--
-- Constrângeri pentru tabele `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`Id_parent`) REFERENCES `parents` (`Id_parent`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`);

--
-- Constrângeri pentru tabele `rewards`
--
ALTER TABLE `rewards`
  ADD CONSTRAINT `rewards_ibfk_1` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`) ON DELETE CASCADE;

--
-- Constrângeri pentru tabele `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`Id_parent`) REFERENCES `parents` (`Id_parent`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`);

--
-- Constrângeri pentru tabele `taskcompletions`
--
ALTER TABLE `taskcompletions`
  ADD CONSTRAINT `taskcompletions_ibfk_1` FOREIGN KEY (`Id_task`) REFERENCES `tasks` (`Id_task`) ON DELETE CASCADE,
  ADD CONSTRAINT `taskcompletions_ibfk_2` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`),
  ADD CONSTRAINT `taskcompletions_ibfk_3` FOREIGN KEY (`Verified`) REFERENCES `parents` (`Id_parent`);

--
-- Constrângeri pentru tabele `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`Id_cycle`) REFERENCES `cycles` (`Id_cycle`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`Id_child`) REFERENCES `children` (`Id_child`),
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`Id_template`) REFERENCES `tasktemplates` (`Id_template`),
  ADD CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`Created_by`) REFERENCES `parents` (`Id_parent`);

--
-- Constrângeri pentru tabele `tasktemplates`
--
ALTER TABLE `tasktemplates`
  ADD CONSTRAINT `tasktemplates_ibfk_1` FOREIGN KEY (`Id_category`) REFERENCES `skillcategories` (`Id_category`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
