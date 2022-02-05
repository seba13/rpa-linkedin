-- Para entrar a mysql desde consola --
-- mysql -p -u root --

-- Crear la base de datos --
CREATE DATABASE IF NOT EXISTS demoLinkedinScrapper3;

-- Para que los querys se hagan en la base de datos que creamos recién
USE demoLinkedinScrapper3;

-- Para que la base de datos acepte emojis --
ALTER DATABASE demoLinkedinScrapper3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- CREATE USER 'worker'@'%' IDENTIFIED BY 'elpandayasevacunó';
-- GRANT USAGE ON *.* TO `worker`@`%`;
-- GRANT ALL PRIVILEGES ON `demoLinkedinScrapper3`.* TO `worker`@`%`  WITH GRANT OPTION;

-- COMPANIES --
CREATE TABLE IF NOT EXISTS `companies` (
    `id_company` INT(11) NOT NULL AUTO_INCREMENT,
    `name_company` VARCHAR(500) NOT NULL,
    `followers` INT(11) NOT NULL,
    `date` DATETIME NOT NULL,
    PRIMARY KEY (`id_company`),
    KEY `id_company` (`id_company`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- POSTS --
CREATE TABLE IF NOT EXISTS `posts` (
    `id_post` INT(11) NOT NULL AUTO_INCREMENT,
    `idCompany` INT(11) NOT NULL,
    `name_company` VARCHAR(500) NOT NULL,
    `description` VARCHAR(1320) NOT NULL,
    `tag` VARCHAR(50),
    `published_date` DATETIME NOT NULL,
    `latest` BIT(1) NOT NULL,
    PRIMARY KEY (`id_post`),
    KEY `id_post` (`id_post`),
    FOREIGN KEY (idCompany) REFERENCES companies(id_company)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- REACTIONS --
CREATE TABLE IF NOT EXISTS `reactions` (
    `id_reaction` INT (11) NOT NULL AUTO_INCREMENT,
    `idPost` INT(11) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `job` VARCHAR(1000) NOT NULL,
    `reaction` VARCHAR(25) NOT NULL,
    `url_user` VARCHAR(200) NOT NULL,
    PRIMARY KEY (`id_reaction`),
    KEY `id_reaction` (`id_reaction`),
    FOREIGN KEY (idPost) REFERENCES posts(id_post)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- COMMENTS --
CREATE TABLE IF NOT EXISTS `comments` (
    `id_comment` INT (11) NOT NULL AUTO_INCREMENT,
    `idPost` INT(11) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `job` VARCHAR(1000) NOT NULL,
    `comment` VARCHAR(1250) NOT NULL,
    `sentiment` VARCHAR(25) NOT NULL,
    `url_user` VARCHAR(200) NOT NULL,
    `published_date` DATETIME NOT NULL,
    PRIMARY KEY (`id_comment`),
    KEY `id_comment` (`id_comment`),
    FOREIGN KEY (idPost) REFERENCES posts(id_post)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- USERS --
CREATE TABLE IF NOT EXISTS `users` (
    `id_user` INT (11) NOT NULL AUTO_INCREMENT,
    `idCompany` INT(11) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `job` VARCHAR(1000) NOT NULL,
    `number_followers` INT(11) NOT NULL,
    `education` VARCHAR(1000) NOT NULL,
    `experience` VARCHAR(1000) NOT NULL,
    `url_user` VARCHAR(200) NOT NULL,
    PRIMARY KEY (`id_user`),
    KEY `id_user` (`id_user`),
    FOREIGN KEY (idCompany) REFERENCES companies(id_company)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- FOLLOWERS --
CREATE TABLE IF NOT EXISTS `followers` (
    `id_follower` INT (11) NOT NULL AUTO_INCREMENT,
    `idCompany` INT(11) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `job` VARCHAR(1000) NOT NULL,
    `date_follow` DATETIME NOT NULL,
    `url_user` VARCHAR(200) NOT NULL,
    PRIMARY KEY (`id_follower`),
    KEY `id_follower` (`id_follower`),
    FOREIGN KEY (idCompany) REFERENCES companies(id_company)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- EXTRACTIONS --
CREATE TABLE IF NOT EXISTS `extractions` (
    `id_extraction` INT(11) NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(500) NOT NULL,
    `creation_date` DATETIME NOT NULL,
    `isAdmin` BIT(1) NOT NULL,
    `company_number` VARCHAR(25),
    `last_update` DATETIME,
    `priority` INT(11) NOT NULL,
    PRIMARY KEY (`id_extraction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ACCOUNTS --
CREATE TABLE IF NOT EXISTS `accounts` (
    `id_account` INT(11) NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(500) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `priority` INT(11) NOT NULL,
    PRIMARY KEY (`id_account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- TAGS --
CREATE TABLE IF NOT EXISTS `tags` (
    `id_tag` INT(11) NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;
/*
mysql> describe accounts; describe comments; describe companies; describe extractions; describe followers; describe posts; describe reactions; describe tags; describe users;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id_account | int          | NO   | PRI | NULL    | auto_increment |
| user_name  | varchar(500) | NO   |     | NULL    |                |
| password   | varchar(20)  | YES  |     | NULL    |                |
| priority   | int          | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)

+----------------+---------------+------+-----+---------+----------------+
| Field          | Type          | Null | Key | Default | Extra          |
+----------------+---------------+------+-----+---------+----------------+
| id_comment     | int           | NO   | PRI | NULL    | auto_increment |
| idPost         | int           | NO   | MUL | NULL    |                |
| name           | varchar(500)  | YES  |     | NULL    |                |
| job            | varchar(1000) | NO   |     | NULL    |                |
| comment        | varchar(1250) | YES  |     | NULL    |                |
| sentiment      | varchar(25)   | NO   |     | NULL    |                |
| url_user       | varchar(200)  | NO   |     | NULL    |                |
| published_date | datetime      | NO   |     | NULL    |                |
+----------------+---------------+------+-----+---------+----------------+
8 rows in set (0.00 sec)

+--------------+--------------+------+-----+---------+----------------+
| Field        | Type         | Null | Key | Default | Extra          |
+--------------+--------------+------+-----+---------+----------------+
| id_company   | int          | NO   | PRI | NULL    | auto_increment |
| name_company | varchar(500) | NO   |     | NULL    |                |
| followers    | int          | NO   |     | NULL    |                |
| date         | datetime     | NO   |     | NULL    |                |
+--------------+--------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)

+----------------+--------------+------+-----+---------+----------------+
| Field          | Type         | Null | Key | Default | Extra          |
+----------------+--------------+------+-----+---------+----------------+
| id_extraction  | int          | NO   | PRI | NULL    | auto_increment |
| user_name      | varchar(500) | NO   |     | NULL    |                |
| creation_date  | datetime     | NO   |     | NULL    |                |
| isAdmin        | bit(1)       | NO   |     | NULL    |                |
| last_update    | datetime     | YES  |     | NULL    |                |
| company_number | varchar(25)  | YES  |     | NULL    |                |
| priority       | int          | YES  |     | NULL    |                |
+----------------+--------------+------+-----+---------+----------------+
7 rows in set (0.01 sec)

+-------------+---------------+------+-----+---------+----------------+
| Field       | Type          | Null | Key | Default | Extra          |
+-------------+---------------+------+-----+---------+----------------+
| id_follower | int           | NO   | PRI | NULL    | auto_increment |
| idCompany   | int           | NO   | MUL | NULL    |                |
| name        | varchar(500)  | NO   |     | NULL    |                |
| job         | varchar(1000) | NO   |     | NULL    |                |
| date_follow | datetime      | NO   |     | NULL    |                |
| url_user    | varchar(200)  | NO   |     | NULL    |                |
+-------------+---------------+------+-----+---------+----------------+
6 rows in set (0.00 sec)

+----------------+---------------+------+-----+---------+----------------+
| Field          | Type          | Null | Key | Default | Extra          |
+----------------+---------------+------+-----+---------+----------------+
| id_post        | int           | NO   | PRI | NULL    | auto_increment |
| idCompany      | int           | NO   | MUL | NULL    |                |
| name_company   | varchar(500)  | NO   |     | NULL    |                |
| description    | varchar(1320) | NO   |     | NULL    |                |
| tag            | varchar(50)   | YES  |     | NULL    |                |
| published_date | datetime      | NO   |     | NULL    |                |
| latest         | bit(1)        | YES  |     | NULL    |                |
+----------------+---------------+------+-----+---------+----------------+
7 rows in set (0.00 sec)

+-------------+---------------+------+-----+---------+----------------+
| Field       | Type          | Null | Key | Default | Extra          |
+-------------+---------------+------+-----+---------+----------------+
| id_reaction | int           | NO   | PRI | NULL    | auto_increment |
| idPost      | int           | NO   | MUL | NULL    |                |
| name        | varchar(500)  | NO   |     | NULL    |                |
| job         | varchar(1000) | NO   |     | NULL    |                |
| reaction    | varchar(25)   | NO   |     | NULL    |                |
| url_user    | varchar(200)  | NO   |     | NULL    |                |
+-------------+---------------+------+-----+---------+----------------+
6 rows in set (0.01 sec)

+--------+-------------+------+-----+---------+----------------+
| Field  | Type        | Null | Key | Default | Extra          |
+--------+-------------+------+-----+---------+----------------+
| id_tag | int         | NO   | PRI | NULL    | auto_increment |
| tag    | varchar(50) | NO   |     | NULL    |                |
+--------+-------------+------+-----+---------+----------------+
2 rows in set (0.00 sec)

+------------------+---------------+------+-----+---------+----------------+
| Field            | Type          | Null | Key | Default | Extra          |
+------------------+---------------+------+-----+---------+----------------+
| id_user          | int           | NO   | PRI | NULL    | auto_increment |
| idCompany        | int           | NO   | MUL | NULL    |                |
| name             | varchar(500)  | NO   |     | NULL    |                |
| job              | varchar(1000) | NO   |     | NULL    |                |
| number_followers | int           | NO   |     | NULL    |                |
| education        | varchar(1000) | NO   |     | NULL    |                |
| experience       | varchar(1000) | NO   |     | NULL    |                |
| url_user         | varchar(200)  | NO   |     | NULL    |                |
+------------------+---------------+------+-----+---------+----------------+
8 rows in set (0.00 sec)
*/
