const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../config/db");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

const secretKey = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  console.log("Requête reçue:", req.body);

  const { username, email, password, prenom, nomFamille } = req.body;

  if (!username || !email || !password || !prenom || !nomFamille) {
    return res.status(400).json({
      message: "Données manquantes : username, password et email sont requis.",
    });
  }

  try {
    const checkUserSql = "SELECT * FROM Users WHERE email = ?";

    const user = await new Promise((resolve, reject) => {
      connection.query(checkUserSql, [email], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    if (user.length > 0) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO Users (username, email, password, prenom, nomFamille) VALUES (?, ?, ?, ?, ?)";

    const result = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [username, email, hashedPassword, prenom, nomFamille],
        (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });

    console.log("Résultat de l'insertion dans la DB:", result);

    const token = jwt.sign(
      {
        id: result.insertId,
        username: username,
        email: email,
        prenom: prenom,
        nomFamille: nomFamille,
      },
      secretKey,
      { expiresIn: "1d" }
    );
    console.log("Clé secrète utilisée:", secretKey);
    return res.status(201).json({ token });
  } catch (err) {
    console.error("Erreur lors de l'inscription:", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res
      .status(400)
      .send({ message: "Nom d'utilisateur/email et mot de passe sont requis" });
  }

  const sql = "SELECT * FROM Users WHERE email = ? OR username = ?";

  connection.query(
    sql,
    [usernameOrEmail, usernameOrEmail],
    async (err, results) => {
      if (err) {
        console.error("Erreur dans la requête SQL:", err);
        return res.status(500).send({ message: "Erreur lors de la connexion" });
      }

      if (results.length === 0) {
        console.log("Aucun utilisateur trouvé avec cet email ou pseudo.");
        return res
          .status(401)
          .send({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      const user = results[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log(
          "Mot de passe incorrect pour l'utilisateur :",
          usernameOrEmail
        );
        return res
          .status(401)
          .send({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        {
          id: user.user_id,
          username: user.username,
          email: user.email,
          prenom: user.prenom,
          nomFamille: user.nomFamille,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).send({ token });
    }
  );
});

router.get('/',async (req,res) => {
  try {
      const sql = "SELECT * FROM Users"

      
          connection.query(sql,  (err, result) => {
              if (err) {
                  return res.status(500).send(err);
              }
              res.status(200).json(result)
          });
      

  } catch (err) {
      return res.status(400).send(err)
      
  }
})

router.delete('/delete/:id', verifyToken , async(req, res) => {
  const 
      id = req.params.id,
      sql = "DELETE FROM Users WHERE user_id = ?";

  connection.query(sql, [id], (err, result) => {
      if(err){
          return res.status(500).send(err);
      }
      res.status(200).send('Utilisateur supprimer');

      
  })
})

module.exports = router;
