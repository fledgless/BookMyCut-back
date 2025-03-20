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
  

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';

    connection.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).send({message:'Erreur lors de la connexion'});

        }
        
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            
            console.log(password , "ici le password" , "ici le mdp dcrypter :", results[0].password + results[0].email);
            return res.status(401).send({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        const user = { 
            id: results[0].id,
            lastname: results[0].lastname,
            email: results[0].email,
            firstName: results[0].firstname,
            classe: results[0].classe,
            createdAt: results[0].createdAT
        };
        const token = jwt.sign(
            { id: user.id, lastname: user.lastname , firstName: user.firstName, classe: user.classe , createdAt : user.createdAt , email : user.email , password: user.password},
            'secretKey',
            { expiresIn: '1d' });

        res.status(200).send({ token });
    });
});

module.exports = router;
