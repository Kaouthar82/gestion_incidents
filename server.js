const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Correction : Utilisation de `createPool().promise()`
const db = mysql.createPool({
  host: 'localhost',
  user: 'root', // Mets ton utilisateur MySQL
  password: '', // Mets ton mot de passe MySQL (vide si XAMPP par défaut)
  database: 'gestion_incidents',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Vérifier la connexion MySQL
db.getConnection()
  .then(() => console.log('✅ Connecté à MySQL !'))
  .catch(err => console.error('❌ Erreur de connexion à MySQL :', err.message));

// Connexion utilisateur
app.post('/login', async (req, res) => {
  const { email, motdepasse } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM utilisateur WHERE email_utilisateur = ? AND mdp_utilisateur = ?',
      [email, motdepasse]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const utilisateur = rows[0];
    res.status(200).json({
      message: 'Connexion réussie !',
      email_utilisateur: utilisateur.email_utilisateur,
      nom_utilisateur: utilisateur.nom_utilisateur,
      prenom_utilisateur: utilisateur.prenom_utilisateur,
      role: utilisateur.role // 👈 ceci est très important !
    });

  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Récupérer tous les incidents
app.get('/incidents', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM incidents');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des incidents', error: err.message });
  }
});

// Récupérer un seul incident par son ID
app.get('/incidents/:id', async (req, res) => {
  try {
      const id = req.params.id;
      console.log("Requête API reçue pour l'incident ID :", id); // ✅ Vérification

      const [incident] = await db.query("SELECT * FROM incidents WHERE id_incident = ?", [id]);



      if (incident.length === 0) {
          return res.status(404).json({ message: "Incident non trouvé" });
      }

      res.json(incident[0]);
  } catch (error) {
      console.error("Erreur API incident :", error); // ✅ Debug ici
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});



// Récupérer les incidents d'un utilisateur spécifique
app.get('/incidents/utilisateur/:utilisateur', (req, res) => {
  const { utilisateur } = req.params;
  db.query('SELECT * FROM incidents WHERE utilisateur = ?', [utilisateur], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des incidents', error: err });
    }
    res.status(200).json(rows);
  });
});

// Ajouter un incident
app.post('/incidents', async (req, res) => {
  const {
    numero_ticket = '',
    sn = '',
    description = '',
    email = '',
    type_incident = '',
    lieu = '',
    utilisateur = '',
    date_creation = '',
    technicien = ''
  } = req.body;
  

  // Vérification simple côté serveur (très recommandé)
  if (!numero_ticket || !description || !email || !type_incident || !lieu || !utilisateur) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO incidents (numero_ticket, sn, description, email, type_incident, lieu, utilisateur, date_creation, status, technicien)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Ouvert', ?)`,
      [numero_ticket, sn, description, email, type_incident, lieu, utilisateur, date_creation, technicien]
    );
    

    res.status(201).json({ message: "✅ Incident ajouté avec succès", id: result.insertId });
  } catch (err) {
    console.error("❌ Erreur lors de l’ajout :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});


// ✅ Supprimer plusieurs incidents
app.delete('/incidents', async (req, res) => {
  const { ids } = req.body; // tableau d'IDs

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Aucun ID fourni." });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    await db.query(`DELETE FROM incidents WHERE id_incident IN (${placeholders})`, ids);
    res.json({ message: 'Incidents supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Mettre à jour un incident
app.put('/incidents/:id', async (req, res) => {
  const id = req.params.id;
  const {
    numero_ticket,
    sn,
    utilisateur,
    description,
    email,
    technicien,
    nature_resolution,
    status
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE incidents SET
        numero_ticket = ?, sn = ?, utilisateur = ?, description = ?, email = ?,
        technicien = ?, nature_resolution = ?, status = ?
      WHERE id_incident = ?`,
      [numero_ticket, sn, utilisateur, description, email, technicien, nature_resolution, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Incident non trouvé ou aucune modification effectuée." });
    }

    res.json({ message: "✅ Incident mis à jour avec succès !" });

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


app.post('/register', async (req, res) => {
  const { nom, prenom, email, motdepasse, adresse, telephone, code, role ,specialite} = req.body;

  // Juste vérification de base (tous les champs sont obligatoires)
  if (!nom || !prenom || !email || !motdepasse || !adresse || !telephone || !code || !role) {
    return res.status(400).json({ message: "Champs manquants ou invalides." });
  }

  try {
    await db.query(`
      INSERT INTO utilisateur (nom_utilisateur, prenom_utilisateur, email_utilisateur, mdp_utilisateur, adresse, telephone, code_special, role,specialite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
    `, [nom, prenom, email, motdepasse, adresse, telephone, code, role,specialite]);

    res.status(201).json({ message: "✅ Compte utilisateur créé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur lors de l'insertion :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

app.put("/utilisateur/:email", async (req, res) => {
  const email = req.params.email;
  const { nom_utilisateur, prenom_utilisateur, telephone, adresse } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE utilisateur 
       SET nom_utilisateur = ?, prenom_utilisateur = ?, telephone = ?, adresse = ?
       WHERE email_utilisateur = ?`,
      [nom_utilisateur, prenom_utilisateur, telephone, adresse, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json({ message: "Profil mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur MAJ :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});
// ✅ Récupérer le profil utilisateur par email
app.get('/utilisateur/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM utilisateur WHERE email_utilisateur = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Erreur lors du chargement du profil :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});
// ✅ Récupérer les incidents d'un utilisateur spécifique
app.get('/incidents/utilisateur/:utilisateur', async (req, res) => {
  const { utilisateur } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM incidents WHERE utilisateur = ?', [utilisateur]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Erreur récupération incidents utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});
// ✅ Route pour changer le mot de passe
app.put("/update-password", async (req, res) => {
  const { email, ancienMotDePasse, nouveauMotDePasse } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM utilisateur WHERE email_utilisateur = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const utilisateur = rows[0];

    // Comparer ancien mot de passe
    if (utilisateur.mdp_utilisateur !== ancienMotDePasse)
      {
      return res.status(401).json({ message: "Ancien mot de passe incorrect." });
    }

    // Mettre à jour le mot de passe
    await db.query("UPDATE utilisateur SET mdp_utilisateur = ? WHERE email_utilisateur = ?", [nouveauMotDePasse, email]);


    res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur update-password :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
app.get('/techniciens/specialite/:type', async (req, res) => {
  const type = req.params.type.toLowerCase();

  try {
    const [rows] = await db.query(
      'SELECT * FROM technicien WHERE LOWER(specialite) = ?',
      [type]
    );
    res.json(rows);
  } catch (error) {
    console.error("Erreur chargement techniciens :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



app.get("/techniciens", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM technicien");
    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération techniciens :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer les incidents affectés à un technicien (par email)
app.get("/incidents-par-technicien/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM incidents WHERE technicien LIKE ?", [`%${email}%`]);

    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération incidents technicien :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer tous les techniciens par équipe
app.get('/incidents-par-equipe/:specialite', async (req, res) => {
  const specialite = req.params.specialite.toLowerCase();

  try {
    const [rows] = await db.query(
      'SELECT * FROM incidents WHERE LOWER(type_incident) = ?',
      [specialite]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération incidents par équipe :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
// Nouvelle route pour les techniciens basés sur la spécialité
app.get('/incidents-par-specialite/:specialite', async (req, res) => {
  const specialite = req.params.specialite;
  try {
      const [rows] = await db.query('SELECT * FROM incidents WHERE type_incident LIKE ?', [`%${specialite}%`]);
      res.json(rows);
  } catch (err) {
      console.error('Erreur récupération incidents par spécialité :', err);
      res.status(500).json({ message: 'Erreur serveur' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});