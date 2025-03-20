const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/db'); // Connexion à la base de données
const router = express.Router();

// Clé secrète pour signer le JWT (mettre une clé forte dans un fichier .env pour la production)
const secretKey = process.env.JWT_SECRET; // Change cette clé pour une clé plus sécurisée en production

router.post('/register', async (req, res) => {
    console.log('Requête reçue:', req.body);
  
    const { username, email, password, prenom, nomFamille } = req.body;
  
    if (!username || !email || !password || !prenom || !nomFamille) {
        return res.status(400).json({ message: 'Données manquantes : username, password et email sont requis.' });
    }
  
    try {
        const checkUserSql = 'SELECT * FROM Users WHERE email = ?';
  
        const user = await new Promise((resolve, reject) => {
            connection.query(checkUserSql, [email], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
  
        if (user.length > 0) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO Users (username, email, password, prenom, nomFamille) VALUES (?, ?, ?, ?, ?)';
  
        const result = await new Promise((resolve, reject) => {
            connection.query(sql, [username, email, hashedPassword, prenom, nomFamille ], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
  
        console.log('Résultat de l\'insertion dans la DB:', result);
  
        const token = jwt.sign(
            {
                id: result.insertId,
                username: username,
                email: email,
                prenom: prenom,
                nomFamille: nomFamille,
            },
            secretKey,
            { expiresIn: '1d' }
        );
        console.log('Clé secrète utilisée:', secretKey);
        return res.status(201).json({ token });
    } catch (err) {
        console.error('Erreur lors de l\'inscription:', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});
  

// // Route pour se connecter (login)
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Vérifier si l'utilisateur existe dans la base de données
//     const [user] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);

//     if (user.length === 0) {
//       return res.status(400).json({ message: 'Utilisateur non trouvé' });
//     }

//     // Vérifier si le mot de passe est correct
//     const isPasswordValid = await bcrypt.compare(password, user[0].password);

//     if (!isPasswordValid) {
//       return res.status(400).json({ message: 'Mot de passe incorrect' });
//     }

//     // Créer un token JWT
//     const token = jwt.sign(
//       { userId: user[0].user_id, username: user[0].username }, // Payload du token
//       JWT_SECRET, // Clé secrète
//       { expiresIn: '1h' } // Le token expire après 1 heure
//     );

//     res.status(200).json({ message: 'Connexion réussie', token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// });

module.exports = router;
