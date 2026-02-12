const appState = {
  currentPage: "fooldal",
  otletek: [],
  pollok: [],
  isAdmin: false,
};

// Oldal betöltése
document.addEventListener("DOMContentLoaded", function () {
  initApp();
  setupEventListeners();
  loadPage("fooldal");
});

// Alkalmazás inicializálása
async function initApp() {
  await checkAdminStatus();
  await loadOtletek();
}

// Eseménykezelők beállítása
function setupEventListeners() {
  // Navigációs események
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.getAttribute("href").substring(1);
      loadPage(pageId);

      document
        .querySelectorAll(".nav-menu a")
        .forEach((a) => a.classList.remove("aktiv"));
      this.classList.add("aktiv");
    });
  });

  // Hamburger menü
  document.querySelector(".hamburger").addEventListener("click", function () {
    document.querySelector(".nav-menu").classList.toggle("mutasd");
  });

  // Dinamikus eseménykezelők delegálással
  document.addEventListener("submit", handleFormSubmit);
  document.addEventListener("click", handleButtonClick);
  document.addEventListener("change", handleSelectChange);
}

// Form események kezelése
function handleFormSubmit(e) {
  if (e.target.id === "otletBekuldesForm") {
    e.preventDefault();
    submitOtlet();
  }

  if (e.target.id === "adminBejelentkezesForm") {
    e.preventDefault();
    adminBejelentkezes();
  }
}

// Gomb kattintások kezelése
function handleButtonClick(e) {
  // Admin bejelentkezés
  if (
    e.target.id === "adminBejelentkezesGomb" ||
    (e.target.closest("button") &&
      e.target.closest("button").id === "adminBejelentkezesGomb")
  ) {
    e.preventDefault();
    adminBejelentkezes();
  }

  // Admin kijelentkezés
  if (
    e.target.id === "adminKijelentkezesGomb" ||
    (e.target.closest("button") &&
      e.target.closest("button").id === "adminKijelentkezesGomb")
  ) {
    e.preventDefault();
    adminKijelentkezes();
  }

  // Ötlet törlése
  if (
    e.target.classList.contains("otlet-torles") ||
    (e.target.closest("button") &&
      e.target.closest("button").classList.contains("otlet-torles"))
  ) {
    const otletId =
      e.target.dataset.otletId || e.target.closest("button").dataset.otletId;
    if (confirm("Biztosan törölni szeretnéd ezt az ötletet?")) {
      otletTorlese(otletId);
    }
  }

  // Szűrés gomb
  if (e.target.id === "szuresGomb") {
    e.preventDefault();
    applyFilters();
  }

  if (e.target.id === "osszesGomb") {
    e.preventDefault();
    resetFilters();
  }

  if (e.target.id === "adminSzuresGomb") {
    e.preventDefault();
    applyAdminFilters();
  }
}

// Select elemek változásának kezelése
function handleSelectChange(e) {
  // Ötlet státusz módosítása
  if (e.target.classList.contains("statusz-valtoztatas")) {
    const otletId = e.target.dataset.otletId;
    const ujStatusz = e.target.value;
    otletStatuszModositasa(otletId, ujStatusz);
  }
}

// Oldal betöltése
async function loadPage(pageId) {
  appState.currentPage = pageId;
  const contentDiv = document.getElementById("tartalom");

  switch (pageId) {
    case "fooldal":
      contentDiv.innerHTML = generateFooldal();
      break;
    case "otlet-bekuldes":
      contentDiv.innerHTML = generateOtletBekuldes();
      break;
    case "otletek":
      contentDiv.innerHTML = generateOtletek();
      break;
    case "admin":
      contentDiv.innerHTML = await generateAdmin();
      break;
    default:
      contentDiv.innerHTML = generateFooldal();
  }

  document.querySelector(".nav-menu").classList.remove("mutasd");
}

// Ötlet beküldés oldal
function generateOtletBekuldes() {
  return `
        <div class="kartya">
            <h2 class="kartya-cim">Új ötlet beküldése</h2>
            <form id="otletBekuldesForm">
                <div class="urlam-csoport">
                    <label for="diakNeve">Név (opcionális)</label>
                    <input type="text" id="diakNeve" name="diak_neve" placeholder="Add meg a neved (nem kötelező)">
                </div>
                
                <div class="urlam-csoport">
                    <label for="diakOsztalya">Osztály (opcionális)</label>
                    <select id="diakOsztalya" name="diak_osztalya">
                      <option value="" selected disabled>Válassz osztályt</option>
                      <option value="9.A">9.A</option>
                      <option value="9.B">9.B</option>
                      <option value="10.A">10.A</option>
                      <option value="10.B">10.B</option>
                      <option value="11.A">11.A</option>
                      <option value="11.B">11.B</option>
                      <option value="12.A">12.A</option>
                      <option value="12.B">12.B</option>
                      <option value="13.A">13.A</option>
                      <option value="13.B">13.B</option>
                    </select>
                </div>
                
                <div class="urlam-csoport">
                    <label for="otletCime">Ötlet címe *</label>
                    <input type="text" id="otletCime" name="otlet_cime" placeholder="Rövid, egyértelmű cím" required>
                </div>
                
                <div class="urlam-csoport">
                    <label for="otletKategoria">Kategória *</label>
                    <select id="otletKategoria" name="kategoria" required>
                        <option value="" selected disabled>Válassz kategóriát</option>
                        <option value="iskolai_nap">Iskolai nap ötletek</option>
                        <option value="délutáni_program">Délutáni programok</option>
                        <option value="sport">Sport események</option>
                        <option value="kulturális">Kulturális programok</option>
                        <option value="egyéb">Egyéb javaslatok</option>
                    </select>
                </div>
                
                <div class="urlam-csoport">
                    <label for="otletLeirasa">Ötlet leírása *</label>
                    <textarea id="otletLeirasa" name="otlet_leirasa" placeholder="Írd le részletesen az ötleted..." rows="6" required></textarea>
                </div>
                
                <button type="submit" class="gomb gomb-success">
                    <i class="fas fa-paper-plane"></i> Ötlet beküldése
                </button>
                
                <div id="otletUzenet" style="margin-top: 15px;"></div>
            </form>
        </div>
        
        <div class="kartya">
            <h2 class="kartya-cim"><i class="fas fa-info-circle"></i> Tippek a jó ötlet íráshoz</h2>
            <ul style="padding-left: 20px; line-height: 1.8;">
                <li>Legyen rövid és egyértelmű a címe az ötletnek</li>
                <li>Írd le, hogy pontosan mire gondolsz</li>
                <li>Ha lehet, add meg, hogy mikor és hol valósítható meg az ötlet</li>
                <li>Gondolj arra, hogy mások is értsék, mi a célja az ötletednek</li>
                <li>Ne felejts el kategóriát választani</li>
            </ul>
        </div>
    `;
}

// Ötletek listázása oldal
function generateOtletek() {
  if (appState.otletek.length === 0) {
    return `
            <h2 class="kartya-cim"><i class="fas fa-list"></i> Összes ötlet (${
              appState.otletek.length
            })</h2>
            
            <div class="szurok" style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <select id="kategoriaSzuro" class="gomb" style="padding: 10px 15px;">
                    <option value="">Összes kategória</option>
                    <option value="iskolai_nap">Iskolai nap ötletek</option>
                    <option value="délutáni_program">Délutáni programok</option>
                    <option value="sport">Sport események</option>
                    <option value="kulturális">Kulturális programok</option>
                    <option value="egyéb">Egyéb javaslatok</option>
                </select>
                
                <select id="statuszSzuro" class="gomb" style="padding: 10px 15px;">
                    <option value="">Összes státusz</option>
                    <option value="beküldve">Beküldve</option>
                    <option value="átnézés alatt">Átnézés alatt</option>
                    <option value="elfogadva">Elfogadva</option>
                    <option value="elutasítva">Elutasítva</option>
                </select>
                
                <button id="szuresGomb" class="gomb">
                    <i class="fas fa-filter"></i> Szűrés
                </button>
                <button id="osszesGomb" class="gomb gomb-warning">
                    <i class="fas fa-redo"></i> Összes mutatása
                </button>
            </div>
            
            <div class="otlet-kartyak" id="otletLista">
                ${appState.otletek
                  .map((otlet) => generateOtletKartya(otlet))
                  .join("")}
            </div>
        </div>
        <p>Még nincs beküldött ötlet. Legyél te az első!</p>
        `;
  }

  return `
        <div class="kartya">
            <h2 class="kartya-cim"><i class="fas fa-list"></i> Összes ötlet (${
              appState.otletek.length
            })</h2>
            
            <div class="szurok" style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <select id="kategoriaSzuro" class="gomb" style="padding: 10px 15px;">
                    <option value="">Összes kategória</option>
                    <option value="iskolai_nap">Iskolai nap ötletek</option>
                    <option value="délutáni_program">Délutáni programok</option>
                    <option value="sport">Sport események</option>
                    <option value="kulturális">Kulturális programok</option>
                    <option value="egyéb">Egyéb javaslatok</option>
                </select>
                
                <select id="statuszSzuro" class="gomb" style="padding: 10px 15px;">
                    <option value="">Összes státusz</option>
                    <option value="beküldve">Beküldve</option>
                    <option value="átnézés alatt">Átnézés alatt</option>
                    <option value="elfogadva">Elfogadva</option>
                    <option value="elutasítva">Elutasítva</option>
                </select>
                
                <button id="szuresGomb" class="gomb">
                    <i class="fas fa-filter"></i> Szűrés
                </button>
                <button id="osszesGomb" class="gomb gomb-warning">
                    <i class="fas fa-redo"></i> Összes mutatása
                </button>
            </div>
            
            <div class="otlet-kartyak" id="otletLista">
                ${appState.otletek
                  .map((otlet) => generateOtletKartya(otlet))
                  .join("")}
            </div>
        </div>
    `;
}

function generateOtletKartya(otlet) {
  const kategoriaSzoveg = {
    iskolai_nap: "Iskolai nap",
    délutáni_program: "Délutáni program",
    sport: "Sport",
    kulturális: "Kulturális",
    egyéb: "Egyéb",
  };

  const statuszClass = {
    beküldve: "statusz-bekuldve",
    "átnézés alatt": "statusz-atnezes",
    elfogadva: "statusz-elfogadva",
    elutasítva: "statusz-elutasitva",
  };

  let formazottDatum = "";
  if (otlet.bekuldes_datuma) {
    const datum = new Date(otlet.bekuldes_datuma);
    formazottDatum = datum.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return `
        <div class="otlet-kartya ${otlet.kategoria}">
            <div class="otlet-fejlec">
                <div>
                    <h3 class="otlet-cim">${otlet.otlet_cime}</h3>
                    <span class="otlet-kategoria">${
                      kategoriaSzoveg[otlet.kategoria]
                    }</span>
                </div>
                <span class="otlet-statusz ${statuszClass[otlet.statusz]}">
                    ${otlet.statusz}
                </span>
            </div>
            <p class="otlet-leiras">${otlet.otlet_leirasa}</p>
            <div class="otlet-lablec">
                <span><i class="fas fa-user"></i> ${otlet.diak_neve}</span>
                <span><i class="fas fa-calendar"></i> ${formazottDatum}</span>
                ${
                  otlet.diak_osztalya
                    ? `<span><i class="fas fa-graduation-cap"></i> ${otlet.diak_osztalya}</span>`
                    : ""
                }
            </div>
        </div>
    `;
}

// Admin felület
async function generateAdmin() {
  if (!appState.isAdmin) {
    return `
            <div class="kartya">
                <h2 class="kartya-cim"><i class="fas fa-user-shield"></i> Admin bejelentkezés</h2>
                <form id="adminBejelentkezesForm" class="admin-bejelentkezes">
                    <div class="urlam-csoport">
                        <label for="adminFelhasznalonev">Felhasználónév</label>
                        <input type="text" id="adminFelhasznalonev" placeholder="admin" required>
                    </div>
                    
                    <div class="urlam-csoport">
                        <label for="adminJelszo">Jelszó</label>
                        <input type="password" id="adminJelszo" placeholder="admin123" required>
                    </div>
                    
                    <button type="submit" id="adminBejelentkezesGomb" class="gomb gomb-success">
                        <i class="fas fa-sign-in-alt"></i> Bejelentkezés
                    </button>
                    
                    <div id="adminUzenet" style="margin-top: 15px;"></div>
                </form>
            </div>
        `;
  }

  // Admin felület, ha be van jelentkezve
  return `
        <div class="kartya">
            <h2 class="kartya-cim">
                <i class="fas fa-user-shield"></i> Admin felület 
                <button id="adminKijelentkezesGomb" class="gomb gomb-warning" style="float: right; padding: 8px 15px; background-color: #f44336; color: white;">
                    <i class="fas fa-sign-out-alt"></i> Kijelentkezés
                </button>
            </h2>
            
            <div class="admin-szurok">
                <select id="adminKategoriaSzuro" class="gomb" style="padding: 10px 15px;">
                    <option value="">Összes kategória</option>
                    <option value="iskolai_nap">Iskolai nap ötletek</option>
                    <option value="délutáni_program">Délutáni programok</option>
                    <option value="sport">Sport események</option>
                    <option value="kulturális">Kulturális programok</option>
                    <option value="egyéb">Egyéb javaslatok</option>
                </select>
                
                <select id="adminStatuszSzuro" class="gomb" style="padding: 10px 15px;">
                    <option value="">Összes státusz</option>
                    <option value="beküldve">Beküldve</option>
                    <option value="átnézés alatt">Átnézés alatt</option>
                    <option value="elfogadva">Elfogadva</option>
                    <option value="elutasítva">Elutasítva</option>
                </select>
                
                <button id="adminSzuresGomb" class="gomb">
                    <i class="fas fa-filter"></i> Szűrés
                </button>
            </div>
            
            <div class="admin-lista">
                <div class="admin-sor">
                    <div>Ötlet címe</div>
                    <div>Beküldő</div>
                    <div>Kategória</div>
                    <div>Státusz</div>
                    <div>Műveletek</div>
                </div>
                
                ${appState.otletek
                  .map(
                    (otlet) => `
                    <div class="admin-sor" data-otlet-id="${otlet.id}">
                        <div><strong>${otlet.otlet_cime}</strong></div>
                        <div>${otlet.diak_neve}</div>
                        <div>${
                          kategoriaSzoveg[otlet.kategoria] || otlet.kategoria
                        }</div>
                        <div>
                            <select class="statusz-valtoztatas" data-otlet-id="${
                              otlet.id
                            }">
                                <option value="beküldve" ${
                                  otlet.statusz === "beküldve" ? "selected" : ""
                                }>Beküldve</option>
                                <option value="átnézés alatt" ${
                                  otlet.statusz === "átnézés alatt"
                                    ? "selected"
                                    : ""
                                }>Átnézés alatt</option>
                                <option value="elfogadva" ${
                                  otlet.statusz === "elfogadva"
                                    ? "selected"
                                    : ""
                                }>Elfogadva</option>
                                <option value="elutasítva" ${
                                  otlet.statusz === "elutasítva"
                                    ? "selected"
                                    : ""
                                }>Elutasítva</option>
                            </select>
                        </div>
                        <div>
                            <button class="gomb gomb-danger otlet-torles" data-otlet-id="${
                              otlet.id
                            }" style="padding: 5px 10px; font-size: 0.9rem;">
                                <i class="fas fa-trash"></i> Törlés
                            </button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;
}
// Admin státusz ellenőrzése
async function checkAdminStatus() {
  try {
    const response = await fetch("config.php?action=admin_ellenorzes");
    const data = await response.json();
    appState.isAdmin = data.isAdmin;
  } catch (error) {
    console.error("Hiba admin státusz ellenőrzésekor:", error);
  }
}

// Ötletek betöltése
async function loadOtletek(kategoria = "", statusz = "") {
  try {
    let url = "config.php?action=otletek_lekerdezese";
    const params = [];

    if (kategoria) {
      params.push(`kategoria=${encodeURIComponent(kategoria)}`);
    }

    if (statusz) {
      params.push(`statusz=${encodeURIComponent(statusz)}`);
    }

    if (params.length > 0) {
      url += "&" + params.join("&");
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      appState.otletek = data.otletek || [];
      console.log("Ötletek betöltve:", appState.otletek.length);
    } else {
      console.error("Hiba ötletek betöltésekor:", data.message);
      appState.otletek = [];
    }
  } catch (error) {
    console.error("Hiba ötletek betöltésekor:", error);
    appState.otletek = [];
  }
}

async function submitOtlet() {
  console.log("Ötlet beküldése...");

  const diakNeve = document.getElementById("diakNeve")?.value || "";
  const diakOsztalya = document.getElementById("diakOsztalya")?.value || "";
  const otletCime = document.getElementById("otletCime")?.value || "";
  const otletKategoria = document.getElementById("otletKategoria")?.value || "";
  const otletLeirasa = document.getElementById("otletLeirasa")?.value || "";

  console.log("Adatok:", {
    diakNeve,
    diakOsztalya,
    otletCime,
    otletKategoria,
    otletLeirasa,
  });

  // Ellenőrzés
  if (!otletCime.trim()) {
    showOtletUzenet("Kérjük, add meg az ötlet címét!", "error");
    return;
  }

  if (!otletKategoria) {
    showOtletUzenet("Kérjük, válassz kategóriát!", "error");
    return;
  }

  if (!otletLeirasa.trim()) {
    showOtletUzenet("Kérjük, írd le az ötletet!", "error");
    return;
  }

  showOtletUzenet("Ötlet beküldése folyamatban...", "info");

  try {
    const formData = new FormData();
    formData.append("action", "otlet_bekuldes");
    formData.append("diak_neve", diakNeve);
    formData.append("diak_osztalya", diakOsztalya);
    formData.append("otlet_cime", otletCime);
    formData.append("kategoria", otletKategoria);
    formData.append("otlet_leirasa", otletLeirasa);

    console.log("FormData elkészítve");

    const response = await fetch("config.php", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Válasz a szervertől:", data);

    if (data.success) {
      showOtletUzenet("Ötleted sikeresen beküldve! Köszönjük!", "success");

      document.getElementById("otletBekuldesForm").reset();

      await loadOtletek();

      setTimeout(() => {
        document.querySelector('.nav-menu a[href="#fooldal"]').click();
      }, 800);
    } else {
      showOtletUzenet(`Hiba: ${data.message}`, "error");
    }
  } catch (error) {
    console.error("Hiba ötlet beküldésekor:", error);
    showOtletUzenet(
      "Hiba történt az ötlet beküldése során. Próbáld újra!",
      "error"
    );
  }
}

// Admin bejelentkezés
async function adminBejelentkezes() {
  const felhasznalonev = document.getElementById("adminFelhasznalonev").value;
  const jelszo = document.getElementById("adminJelszo").value;

  if (!felhasznalonev || !jelszo) {
    showAdminMessage("Kérjük, töltsd ki mindkét mezőt!", "error");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("action", "admin_bejelentkezes");
    formData.append("admin_felhasznalonev", felhasznalonev);
    formData.append("admin_jelszo", jelszo);

    const response = await fetch("config.php", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      appState.isAdmin = true;
      showAdminMessage("Sikeres bejelentkezés!", "success");
      setTimeout(() => loadPage("admin"), 1000);
    } else {
      showAdminMessage(data.message, "error");
    }
  } catch (error) {
    console.error("Hiba bejelentkezéskor:", error);
    showAdminMessage("Hiba történt a bejelentkezés során", "error");
  }
}

// Admin kijelentkezés
async function adminKijelentkezes() {
  try {
    const formData = new FormData();
    formData.append("action", "admin_kijelentkezes");

    const response = await fetch("config.php", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      appState.isAdmin = false;
      alert("Sikeres kijelentkezés!");
      loadPage("admin");
    }
  } catch (error) {
    console.error("Hiba kijelentkezéskor:", error);
  }
}

// Ötlet státusz módosítása
async function otletStatuszModositasa(otletId, ujStatusz) {
  try {
    const formData = new FormData();
    formData.append("action", "otlet_statusz_modositasa");
    formData.append("otlet_id", otletId);
    formData.append("uj_statusz", ujStatusz);

    const response = await fetch("config.php", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      // Frissítjük a helyi állapotot
      const otletIndex = appState.otletek.findIndex((o) => o.id == otletId);
      if (otletIndex !== -1) {
        appState.otletek[otletIndex].statusz = ujStatusz;
      }

      // Frissítjük a nézetet
      loadPage("admin");
      alert("Státusz sikeresen módosítva!");
    } else {
      alert("Hiba: " + data.message);
    }
  } catch (error) {
    console.error("Hiba státusz módosításakor:", error);
    alert("Hiba történt a módosítás során");
  }
}

// Ötlet törlése
async function otletTorlese(otletId) {
  try {
    const formData = new FormData();
    formData.append("action", "otlet_torlese");
    formData.append("otlet_id", otletId);

    const response = await fetch("config.php", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      appState.otletek = appState.otletek.filter((o) => o.id != otletId);
      loadPage("admin");
      alert("Ötlet sikeresen törölve!");
    } else {
      alert("Hiba: " + data.message);
    }
  } catch (error) {
    console.error("Hiba törléskor:", error);
    alert("Hiba történt a törlés során");
  }
}

// Szűrés alkalmazása
async function applyFilters() {
  const kategoria = document.getElementById("kategoriaSzuro")?.value || "";
  const statusz = document.getElementById("statuszSzuro")?.value || "";

  await loadOtletek(kategoria, statusz);
  loadPage("otletek");
}

// Szűrés visszaállítása
async function resetFilters() {
  await loadOtletek();
  loadPage("otletek");
}

// Admin szűrés
async function applyAdminFilters() {
  const kategoria = document.getElementById("adminKategoriaSzuro")?.value || "";
  const statusz = document.getElementById("adminStatuszSzuro")?.value || "";

  await loadOtletek(kategoria, statusz);
  loadPage("admin");
}

// Segédfüggvények
function showOtletUzenet(message, type = "info") {
  const messageDiv = document.getElementById("otletUzenet");
  if (messageDiv) {
    const className =
      type === "success"
        ? "uzi-siker"
        : type === "error"
        ? "uzi-hiba"
        : "uzi-info";
    messageDiv.innerHTML = `
            <div class="${className}">
                <i class="fas fa-${
                  type === "success"
                    ? "check-circle"
                    : type === "error"
                    ? "exclamation-circle"
                    : "info-circle"
                }"></i>
                ${message}
            </div>
        `;

    // 5 másodperc múlva eltüntetjük az üzenetet (ha nem hiba)
    if (type !== "error") {
      setTimeout(() => {
        messageDiv.innerHTML = "";
      }, 5000);
    }
  }
}

function showAdminMessage(message, type = "info") {
  const messageDiv = document.getElementById("adminUzenet");
  if (messageDiv) {
    const className =
      type === "success"
        ? "uzi-siker"
        : type === "error"
        ? "uzi-hiba"
        : "uzi-info";
    messageDiv.innerHTML = `<div class="${className}">${message}</div>`;
  }
}

// Kategória szövegek (segédfüggvény)
const kategoriaSzoveg = {
  iskolai_nap: "Iskolai nap",
  délutáni_program: "Délutáni program",
  sport: "Sport",
  kulturális: "Kulturális",
  egyéb: "Egyéb",
};
// Egyszerűsített főoldal
function generateFooldal() {
  return `
  <div class="kartya">
            <h2 class="kartya-cim">Üdvözöljük az Digitális Ötletládában!</h2>
            <p>Ez a platform lehetővé teszi, hogy ötleteidet, javaslataidat megosszuk az iskolai közösségével. Itt találhatóak az iskola tanulói által beküldött ötletek, melyeket a titkárság jóvá tud hagyni.</p>
            <div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
                <div class="stat-kartya" style="text-align: center; padding: 20px; background-color: #c5dffd; border-radius: var(--border-radius);">
                    <h3 style="font-size: 2rem; color: blue;">${
                      appState.otletek.length
                    }</h3>
                    <p style="user-select: none;">Összes ötlet száma</p>
                </div>
                <div style="text-align: center; padding: 20px; background-color: #cdf8d8; border-radius: var(--border-radius);">
                    <h3 style="font-size: 2rem; color: green;">${
                      appState.otletek.filter((o) => o.statusz === "elfogadva")
                        .length
                    }</h3>
                    <p style="user-select: none;">Elfogadott ötlet</p>
                </div>
                <div style="text-align: center; padding: 20px; background-color: #d6d1c9; border-radius: var(--border-radius);">
                    <h3 style="font-size: 2rem; color: dark-grey;">${
                      appState.otletek.filter((o) => o.statusz === "beküldve")
                        .length
                    }</h3>
                    <p style="user-select: none;">Beküldött (át nem nézett) ötletek</p>
                </div>
                <div style="text-align: center; padding: 20px; background-color: #fde2ca; border-radius: var(--border-radius);">
                    <h3 style="font-size: 2rem; color: orange;">${
                      appState.otletek.filter(
                        (o) => o.statusz === "átnézés alatt"
                      ).length
                    }</h3>
                    <p style="user-select: none;">Átnézés alatti ötletek</p>
                </div>
                </div>
                <br>
                <div>
                <div style="text-align: center; padding: 20px; max-width: 425%; background-color: #fab3b3; border-radius: var(--border-radius);">
                    <h3 style="font-size: 2rem; color: red;">${
                      appState.otletek.filter((o) => o.statusz === "elutasítva")
                        .length
                    }</h3>
                    <p style="user-select: none;">Elutasított ötletek</p>
                </div>
                </div>
            </div>
        </div>
        
        <div class="kartya">
            <h2 class="kartya-cim">Legfrissebb ötletek</h2>
            <div class="otlet-kartyak">
                ${appState.otletek
                  .slice(0, 3)
                  .map((otlet) => generateOtletKartya(otlet))
                  .join("")}
            </div>
        </div>
    `;
}
