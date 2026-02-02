<?php
// config.php - Adatbázis kapcsolat és admin funkciók
session_start();

$host = 'localhost';
$dbname = 'digitalis_otletlada';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Kapcsolódási hiba: " . $e->getMessage());
}

// Admin bejelentkezés
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'admin_bejelentkezes') {
    $admin_felhasznalonev = filter_input(INPUT_POST, 'admin_felhasznalonev', FILTER_SANITIZE_STRING);
    $admin_jelszo = filter_input(INPUT_POST, 'admin_jelszo', FILTER_SANITIZE_STRING);
    
    // Egyszerű admin hitelesítés
    $helyes_felhasznalonev = 'admin';
    $helyes_jelszo = 'admin123'; // Jelszó: admin123
    
    if ($admin_felhasznalonev === $helyes_felhasznalonev && password_verify($admin_jelszo, password_hash($helyes_jelszo, PASSWORD_DEFAULT))) {
        $_SESSION['admin_bejelentkezve'] = true;
        $_SESSION['admin_felhasznalonev'] = $admin_felhasznalonev;
        echo json_encode(['success' => true, 'message' => 'Sikeres bejelentkezés!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Hibás felhasználónév vagy jelszó!']);
    }
    exit;
}

// Admin kijelentkezés
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'admin_kijelentkezes') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Sikeres kijelentkezés!']);
    exit;
}

// Admin ellenőrzés
function isAdminLoggedIn() {
    return isset($_SESSION['admin_bejelentkezve']) && $_SESSION['admin_bejelentkezve'] === true;
}

// Ötlet státusz módosítása
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'otlet_statusz_modositasa') {
    if (!isAdminLoggedIn()) {
        echo json_encode(['success' => false, 'message' => 'Nincs admin jogosultság!']);
        exit;
    }
    
    $otlet_id = filter_input(INPUT_POST, 'otlet_id', FILTER_VALIDATE_INT);
    $uj_statusz = filter_input(INPUT_POST, 'uj_statusz', FILTER_SANITIZE_STRING);
    
    if (!$otlet_id || !$uj_statusz) {
        echo json_encode(['success' => false, 'message' => 'Érvénytelen adatok!']);
        exit;
    }
    
    try {
        $sql = "UPDATE otletek SET statusz = :statusz WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':statusz' => $uj_statusz, ':id' => $otlet_id]);
        
        echo json_encode(['success' => true, 'message' => 'Státusz sikeresen frissítve!']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Adatbázis hiba: ' . $e->getMessage()]);
    }
    exit;
}

// Ötlet törlése
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'otlet_torlese') {
    if (!isAdminLoggedIn()) {
        echo json_encode(['success' => false, 'message' => 'Nincs admin jogosultság!']);
        exit;
    }
    
    $otlet_id = filter_input(INPUT_POST, 'otlet_id', FILTER_VALIDATE_INT);
    
    if (!$otlet_id) {
        echo json_encode(['success' => false, 'message' => 'Érvénytelen azonosító!']);
        exit;
    }
    
    try {
        $sql = "DELETE FROM otletek WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':id' => $otlet_id]);
        
        echo json_encode(['success' => true, 'message' => 'Ötlet sikeresen törölve!']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Adatbázis hiba: ' . $e->getMessage()]);
    }
    exit;
}

// Ötlet beküldése
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'otlet_bekuldes') {
    $diak_neve = filter_input(INPUT_POST, 'diak_neve', FILTER_SANITIZE_STRING);
    $diak_osztalya = filter_input(INPUT_POST, 'diak_osztalya', FILTER_SANITIZE_STRING);
    $otlet_cime = filter_input(INPUT_POST, 'otlet_cime', FILTER_SANITIZE_STRING);
    $otlet_leirasa = filter_input(INPUT_POST, 'otlet_leirasa', FILTER_SANITIZE_STRING);
    $kategoria = filter_input(INPUT_POST, 'kategoria', FILTER_SANITIZE_STRING);
    
    if (!$otlet_cime || !$otlet_leirasa || !$kategoria) {
        echo json_encode(['success' => false, 'message' => 'Kérjük, töltsd ki az összes kötelező mezőt!']);
        exit;
    }
    
    try {
        $sql = "INSERT INTO otletek (diak_neve, diak_osztalya, otlet_cime, otlet_leirasa, kategoria) 
                VALUES (:diak_neve, :diak_osztalya, :otlet_cime, :otlet_leirasa, :kategoria)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':diak_neve' => $diak_neve ?: 'Anonim',
            ':diak_osztalya' => $diak_osztalya,
            ':otlet_cime' => $otlet_cime,
            ':otlet_leirasa' => $otlet_leirasa,
            ':kategoria' => $kategoria
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Ötlet sikeresen beküldve!']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Adatbázis hiba: ' . $e->getMessage()]);
    }
    exit;
}

// Ötletek lekérdezése
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'otletek_lekerdezese') {
    $kategoria = filter_input(INPUT_GET, 'kategoria', FILTER_SANITIZE_STRING);
    $statusz = filter_input(INPUT_GET, 'statusz', FILTER_SANITIZE_STRING);
    
    try {
        $sql = "SELECT * FROM otletek WHERE 1=1";
        $params = [];
        
        if ($kategoria) {
            $sql .= " AND kategoria = :kategoria";
            $params[':kategoria'] = $kategoria;
        }
        
        if ($statusz) {
            $sql .= " AND statusz = :statusz";
            $params[':statusz'] = $statusz;
        }
        
        $sql .= " ORDER BY bekuldes_datuma DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $otletek = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'otletek' => $otletek]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Adatbázis hiba: ' . $e->getMessage()]);
    }
    exit;
}

// Admin ellenőrzés
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'admin_ellenorzes') {
    echo json_encode(['isAdmin' => isAdminLoggedIn()]);
    exit;
}

// Poll szavazás (ha szükséges)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'poll_szavazas') {
    // Implementáld, ha szükséges
    echo json_encode(['success' => false, 'message' => 'Poll szavazás még nincs implementálva']);
    exit;
}
// Ötlet beküldése rész javítása
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'otlet_bekuldes') {
    // Alapértelmezett értékek beállítása
    $diak_neve = isset($_POST['diak_neve']) ? trim($_POST['diak_neve']) : 'Anonim';
    $diak_osztalya = isset($_POST['diak_osztalya']) ? trim($_POST['diak_osztalya']) : '';
    $otlet_cime = isset($_POST['otlet_cime']) ? trim($_POST['otlet_cime']) : '';
    $otlet_leirasa = isset($_POST['otlet_leirasa']) ? trim($_POST['otlet_leirasa']) : '';
    $kategoria = isset($_POST['kategoria']) ? trim($_POST['kategoria']) : '';
    
    // Ellenőrzés
    if (empty($otlet_cime) || empty($otlet_leirasa) || empty($kategoria)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Kérjük, töltsd ki az összes kötelező mezőt!'
        ]);
        exit;
    }
    
    // Érvényes kategóriák
    $ervenyes_kategoriak = ['iskolai_nap', 'délutáni_program', 'sport', 'kulturális', 'egyéb'];
    if (!in_array($kategoria, $ervenyes_kategoriak)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Érvénytelen kategória!'
        ]);
        exit;
    }
    
    try {
        // Alapértelmezett név beállítása, ha üres
        if (empty($diak_neve)) {
            $diak_neve = 'Anonim';
        }
        
        $sql = "INSERT INTO otletek (diak_neve, diak_osztalya, otlet_cime, otlet_leirasa, kategoria) 
                VALUES (:diak_neve, :diak_osztalya, :otlet_cime, :otlet_leirasa, :kategoria)";
        $stmt = $conn->prepare($sql);
        
        $stmt->execute([
            ':diak_neve' => $diak_neve,
            ':diak_osztalya' => $diak_osztalya,
            ':otlet_cime' => $diak_neve,
            ':otlet_leirasa' => $otlet_leirasa,
            ':kategoria' => $kategoria
        ]);
        
        $uj_id = $conn->lastInsertId();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Ötlet sikeresen beküldve! Köszönjük!',
            'id' => $uj_id
        ]);
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Adatbázis hiba: ' . $e->getMessage()
        ]);
    }
    exit;
}
?>