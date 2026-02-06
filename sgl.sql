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
