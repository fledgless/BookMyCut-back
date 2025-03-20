const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../config/db");
const router = express.Router();

const secretKey = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  console.log("Requête reçue:", req.body);

  const { username, email, password, prenom, nomFamille } = req.body;

  if (!username || !email || !password || !prenom || !nomFamille) {
    return res
      .status(400)
      .json({
        message:
          "Données manquantes : username, password et email sont requis.",
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

  const sql = "SELECT * FROM users WHERE email = ? OR username = ?";

  connection.query(
    sql,
    [usernameOrEmail, usernameOrEmail],
    async (err, results) => {
      if (err) {
        return res.status(500).send({ message: "Erreur lors de la connexion" });
      }

      if (
        results.length === 0 ||
        !(await bcrypt.compare(password, results[0].password))
      ) {
        console.log(
          password,
          "ici le password",
          "ici le mdp décrypté :",
          results[0].password + results[0].email
        );
        return res
          .status(401)
          .send({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      const user = {
        id: results[0].user_id,
        username: results[0].username,
        email: results[0].email,
        prenom: results[0].prenom,
        nomFamille: results[0].nomFamille,
      };

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          prenom: user.prenom,
          nomFamille: user.nomFamille,
        },
        "secretKey",
        { expiresIn: "1d" }
      );

      res.status(200).send({ token });
    }
  );
});

module.exports = router;
