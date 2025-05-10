
// ✅ Récupérer les données depuis le formulaire
function getFormData() {
    return {
        numero_ticket: document.getElementById("numero_ticket").value,
        sn: document.getElementById("sn").value,
        utilisateur: document.getElementById("utilisateur").value,
        description: document.getElementById("description").value,
        code_cloture: document.getElementById("code_cloture").value,
        date_ouverture: document.getElementById("date_ouverture").value,
        date_affectation: document.getElementById("date_affectation").value,
        date_resolution: document.getElementById("date_resolution").value,
        fournisseur: document.getElementById("fournisseur").value,
        email: document.getElementById("email").value,
        nature_resolution: document.getElementById("nature_resolution").value,
        status: document.getElementById("status").value
    };
}

// ✅ Remplir les champs du formulaire à partir des données récupérées
function populateForm(data) {
    document.getElementById("numero_ticket").value = data.numero_ticket || "";
    document.getElementById("sn").value = data.sn || "";
    document.getElementById("utilisateur").value = data.utilisateur || "";
    document.getElementById("description").value = data.description || "";
    document.getElementById("code_cloture").value = data.code_cloture || "";
    document.getElementById("date_ouverture").value = data.date_ouverture || "";
    document.getElementById("date_affectation").value = data.date_affectation || "";
    document.getElementById("date_resolution").value = data.date_resolution || "";
    document.getElementById("fournisseur").value = data.fournisseur || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("nature_resolution").value = data.nature_resolution || "";
    document.getElementById("status").value = data.status || "";
}
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchSN");
    const table = document.getElementById("incidentsTable");
    const tbody = table.querySelector("tbody");
  
    searchInput.addEventListener("input", () => {
      const filter = searchInput.value.toLowerCase();
  
      Array.from(tbody.rows).forEach(row => {
        const snCell = row.cells[3]; // 3e cellule = SN
        const snText = snCell.textContent.toLowerCase();
  
        if (snText.includes(filter)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  });
document.addEventListener("DOMContentLoaded", async () => {
  const selectTech = document.getElementById("technicien");
  
  try {
    const res = await fetch("http://localhost:3001/techniciens"); // 👈 route à créer dans server.js
    const techs = await res.json();

    techs.forEach(tech => {
      const option = document.createElement("option");
      option.value = tech.email_technicien;
      option.textContent = `${tech.nom_technicien} ${tech.prenom_technicien} (${tech.specialite})`;
      selectTech.appendChild(option);
    });

  } catch (err) {
    console.error("Erreur lors du chargement des techniciens :", err);
  }
});
document.addEventListener("DOMContentLoaded", () => {
    const typeIncidentSelect = document.getElementById("type_incident");
    const infoElement = document.getElementById("specialite_info");
  
    const specialiteMap = {
      "application": "support logiciel",
      "antivirus": "support logiciel",
      "caméra": "périphériques",
      "clavier": "matériel",
      "connexion": "réseau",
      "dossier": "systèmes",
      "écran": "matériel",
      "imprimante": "périphériques",
      "internet": "réseau",
      "kit": "périphériques",
      "microphone": "périphériques",
      "mise à jour": "support logiciel",
      "navigateur": "support logiciel",
      "ordinateur": "matériel",
      "périphérique": "matériel",
      "réseau": "réseau",
      "serveur": "systèmes",
      "souris": "matériel",
      "système": "systèmes",
      "usb": "matériel",
      "vpn": "réseau"
    };
  
    typeIncidentSelect.addEventListener("change", () => {
      const value = typeIncidentSelect.value.toLowerCase();
  
      if (value === "autre" || value === "") {
        infoElement.textContent = "";
      } else {
        const specialite = specialiteMap[value];
        infoElement.textContent = specialite
          ? `🔍 Ce type d’incident est généralement pris en charge par un technicien spécialisé en ${specialite}.`
          : "";
      }
    });

  });
  // 🔵 Fonction pour charger les techniciens selon spécialité (POUR MODIFIER INCIDENT)
async function chargerTechniciensPourSpecialite(specialite) {
  const selectTech = document.getElementById("editTechnicien");
  
  if (!specialite) {
    selectTech.innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
    return;
  }
  
  try {
    const res = await fetch(`http://localhost:3001/techniciens/specialite/${specialite}`);
    const techs = await res.json();
    
    if (techs.length === 0) {
      selectTech.innerHTML = '<option value="">Aucun technicien disponible</option>';
    } else {
      selectTech.innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
      techs.forEach(tech => {
        const option = document.createElement("option");
        option.value = tech.email_technicien;
        option.textContent = `${tech.nom_technicien} ${tech.prenom_technicien}`;
        selectTech.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Erreur chargement techniciens :", err);
    selectTech.innerHTML = '<option value="">Erreur de chargement</option>';
  }
}

// 🔵 Quand le type incident CHANGE dans formulaire MODIFIER ➔ Afficher spécialité + Charger techniciens
document.getElementById("edit_type_incident")?.addEventListener("change", async function() {
  const specialiteMap = {
    "application": "support logiciel",
    "antivirus": "support logiciel",
    "caméra": "périphériques",
    "clavier": "matériel",
    "connexion": "réseau",
    "dossier": "systèmes",
    "écran": "matériel",
    "imprimante": "périphériques",
    "internet": "réseau",
    "kit": "périphériques",
    "microphone": "périphériques",
    "mise à jour": "support logiciel",
    "navigateur": "support logiciel",
    "ordinateur": "matériel",
    "périphérique": "matériel",
    "réseau": "réseau",
    "serveur": "systèmes",
    "souris": "matériel",
    "système": "systèmes",
    "usb": "matériel",
    "vpn": "réseau"
  };
  
  const value = this.value.toLowerCase();
  const specialite = specialiteMap[value];
  
  const infoElement = document.getElementById("edit_specialite_info");
  if (specialite) {
    infoElement.textContent = `🔍 Ce type d’incident est généralement pris en charge par un technicien spécialisé en ${specialite}.`;
    await chargerTechniciensPourSpecialite(specialite);
  } else {
    infoElement.textContent = "";
    document.getElementById("editTechnicien").innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
  }
});

  document.addEventListener("DOMContentLoaded", () => {
    const typeIncident = document.getElementById("type_incident");
    const champAutre = document.getElementById("autre_type_incident");
    const selectTech = document.getElementById("technicien");
    const infoSpecialite = document.getElementById("specialite_info");
  
    const specialiteMap = {
      "application": "support logiciel",
      "antivirus": "support logiciel",
      "caméra": "périphériques",
      "clavier": "matériel",
      "connexion": "réseau",
      "dossier": "systèmes",
      "écran": "matériel",
      "imprimante": "périphériques",
      "internet": "réseau",
      "microphone": "périphériques",
      "mise à jour": "support logiciel",
      "navigateur": "support logiciel",
      "ordinateur": "matériel",
      "périphérique": "matériel",
      "réseau": "réseau",
      "serveur": "systèmes",
      "souris": "matériel",
      "système": "systèmes",
      "usb": "matériel",
      "vpn": "réseau"
    };
  
    const chargerTechniciens = async (specialite) => {
      if (!specialite) {
        selectTech.innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
        return;
      }
  
      try {
        const res = await fetch(`http://localhost:3001/techniciens/specialite/${specialite}`);
        const techs = await res.json();
  
        if (techs.length === 0) {
          selectTech.innerHTML = '<option value="">Aucun technicien disponible</option>';
        } else {
          selectTech.innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
          techs.forEach(tech => {
            const option = document.createElement("option");
            option.value = tech.email_technicien;
            option.textContent = `${tech.nom_technicien} ${tech.prenom_technicien}`;
            selectTech.appendChild(option);
          });
        }
      } catch (err) {
        console.error("Erreur chargement techniciens :", err);
        selectTech.innerHTML = '<option value="">Erreur de chargement</option>';
      }
    };
  
    typeIncident.addEventListener("change", () => {
      const selected = typeIncident.value.toLowerCase();
  
      // Affiche champ "autre"
      if (selected === "autre") {
        champAutre.style.display = "block";
        champAutre.required = true;
        infoSpecialite.textContent = "";
        selectTech.innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
      } else {
        champAutre.style.display = "none";
        champAutre.required = false;
  
        // Affiche la spécialité
        const specialite = specialiteMap[selected];
        infoSpecialite.textContent = specialite
          ? `🔍 Incident géré par un technicien en ${specialite}.`
          : "";
  
        chargerTechniciens(specialite);
      }
    });
  
    champAutre.addEventListener("input", () => {
      if (typeIncident.value === "autre") {
        const specialite = champAutre.value.trim().toLowerCase();
        infoSpecialite.textContent = `🔍 Incident personnalisé : spécialité estimée "${specialite}"`;
        chargerTechniciens(specialite);
      }
    });
  });
  async function loadTechniciensForEdit() {
    try {
      const res = await fetch("http://localhost:3001/techniciens");
      const techniciens = await res.json();
      const select = document.getElementById("editTechnicien");
      select.innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
      techniciens.forEach(t => {
        const option = document.createElement("option");
        option.value = t.email; // ou t.nom + " " + t.prenom si tu préfères
        option.textContent = t.email;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Erreur chargement techniciens :", err);
    }
  }
  loadTechniciensForEdit();
  
  async function chargerTechniciensPourModification() {
    const select = document.getElementById("editTechnicien");
    select.innerHTML = '<option value="">-- Sélectionner un technicien --</option>';
  
    try {
      const res = await fetch("http://localhost:3001/techniciens");
      const techniciens = await res.json();
  
      techniciens.forEach(tech => {
        const option = document.createElement("option");
        option.value = tech.email_technicien;
        option.textContent = `${tech.nom_technicien} ${tech.prenom_technicien}`;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Erreur chargement techniciens :", err);
    }
  }
  
  