CREATE DATABASE IF NOT EXISTS digitalis_otletlada 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_hungarian_ci;

USE digitalis_otletlada;

-- 1. Ötletek táblája
CREATE TABLE otletek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diak_neve VARCHAR(100) NOT NULL,
    diak_osztalya VARCHAR(50),
    otlet_cime VARCHAR(200) NOT NULL,
    otlet_leirasa TEXT NOT NULL,
    kategoria ENUM('iskolai_nap', 'délutáni_program', 'sport', 'kulturális', 'egyéb') NOT NULL,
    statusz ENUM('beküldve', 'átnézés alatt', 'elfogadva', 'elutasítva') DEFAULT 'beküldve',
    bekuldes_datuma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    szavazatok INT DEFAULT 0
);

-- 2. Poll-ok táblája (egyszerűsített változat)
CREATE TABLE pollok (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kerdes VARCHAR(300) NOT NULL,
    letrehozo_neve VARCHAR(100),
    letrehozas_datuma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lezarva BOOLEAN DEFAULT FALSE
);

-- 3. Poll opciók táblája
CREATE TABLE poll_opciok (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT,
    opcio_szoveg VARCHAR(200) NOT NULL,
    szavazatok INT DEFAULT 0,
    FOREIGN KEY (poll_id) REFERENCES pollok(id) ON DELETE CASCADE
);