-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gbwt
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `transactions_history_items`
--

DROP TABLE IF EXISTS `transactions_history_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions_history_items` (
  `id` varchar(255) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `itemid` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `pedagang` varchar(255) NOT NULL,
  `price` decimal(50,2) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `idx_pedagang_transactions_history_items` (`pedagang`),
  KEY `fk_trans_hist_items_product` (`itemid`),
  CONSTRAINT `fk_trans_hist_items_history` FOREIGN KEY (`transaction_id`) REFERENCES `transactions_history` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trans_hist_items_product` FOREIGN KEY (`itemid`) REFERENCES `dataproduk` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_history_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions_history` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions_history_items`
--

LOCK TABLES `transactions_history_items` WRITE;
/*!40000 ALTER TABLE `transactions_history_items` DISABLE KEYS */;
INSERT INTO `transactions_history_items` VALUES ('wLFX7wOA','RsBRiM6N','8MV3B8XH','Gulaku','Tiga Putra 3',15000.00,1);
/*!40000 ALTER TABLE `transactions_history_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-21  1:24:13
