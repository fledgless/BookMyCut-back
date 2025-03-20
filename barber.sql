-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : jeu. 20 mars 2025 à 11:31
-- Version du serveur : 8.0.41-0ubuntu0.22.04.1
-- Version de PHP : 8.1.2-1ubuntu2.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `barber`
--

-- --------------------------------------------------------

--
-- Structure de la table `Avis`
--

CREATE TABLE `Avis` (
  `avis_id` int NOT NULL,
  `note` tinyint NOT NULL,
  `contenu` text,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Créneau`
--

CREATE TABLE `Créneau` (
  `creneau_id` int NOT NULL,
  `heure` datetime NOT NULL,
  `salon_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Image`
--

CREATE TABLE `Image` (
  `image_id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `salon_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Prestation`
--

CREATE TABLE `Prestation` (
  `prestation_id` int NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prix` decimal(15,2) NOT NULL,
  `salon_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Rdv`
--

CREATE TABLE `Rdv` (
  `rdv_id` int NOT NULL,
  `confirme` tinyint(1) NOT NULL,
  `paye` tinyint(1) NOT NULL,
  `prestation_id` int NOT NULL,
  `creneau_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Salon`
--

CREATE TABLE `Salon` (
  `salon_id` int NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text,
  `logoFilename` varchar(255) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `codePostal` int DEFAULT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Users`
--

CREATE TABLE `Users` (
  `user_id` int NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `nomFamille` varchar(255) DEFAULT NULL,
  `roles` tinyint(1) NOT NULL,
  `pfpFilename` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `Avis`
--
ALTER TABLE `Avis`
  ADD PRIMARY KEY (`avis_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Index pour la table `Créneau`
--
ALTER TABLE `Créneau`
  ADD PRIMARY KEY (`creneau_id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Index pour la table `Image`
--
ALTER TABLE `Image`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Index pour la table `Prestation`
--
ALTER TABLE `Prestation`
  ADD PRIMARY KEY (`prestation_id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Index pour la table `Rdv`
--
ALTER TABLE `Rdv`
  ADD PRIMARY KEY (`rdv_id`),
  ADD UNIQUE KEY `creneau_id` (`creneau_id`),
  ADD KEY `prestation_id` (`prestation_id`),
  ADD KEY `salon_id` (`salon_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `Salon`
--
ALTER TABLE `Salon`
  ADD PRIMARY KEY (`salon_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Index pour la table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `Avis`
--
ALTER TABLE `Avis`
  ADD CONSTRAINT `Avis_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `Avis_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `Salon` (`salon_id`);

--
-- Contraintes pour la table `Créneau`
--
ALTER TABLE `Créneau`
  ADD CONSTRAINT `Créneau_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `Salon` (`salon_id`);

--
-- Contraintes pour la table `Image`
--
ALTER TABLE `Image`
  ADD CONSTRAINT `Image_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `Salon` (`salon_id`);

--
-- Contraintes pour la table `Prestation`
--
ALTER TABLE `Prestation`
  ADD CONSTRAINT `Prestation_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `Salon` (`salon_id`);

--
-- Contraintes pour la table `Rdv`
--
ALTER TABLE `Rdv`
  ADD CONSTRAINT `Rdv_ibfk_1` FOREIGN KEY (`prestation_id`) REFERENCES `Prestation` (`prestation_id`),
  ADD CONSTRAINT `Rdv_ibfk_2` FOREIGN KEY (`creneau_id`) REFERENCES `Créneau` (`creneau_id`),
  ADD CONSTRAINT `Rdv_ibfk_3` FOREIGN KEY (`salon_id`) REFERENCES `Salon` (`salon_id`),
  ADD CONSTRAINT `Rdv_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Contraintes pour la table `Salon`
--
ALTER TABLE `Salon`
  ADD CONSTRAINT `Salon_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
