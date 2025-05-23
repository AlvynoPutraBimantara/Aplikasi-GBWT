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
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `total` decimal(50,2) NOT NULL,
  `catatan` varchar(500) DEFAULT NULL,
  `alamat` varchar(255) NOT NULL,
  `created_at` varchar(255) NOT NULL,
  `invoice_url` varchar(255) DEFAULT NULL,
  `pemesan` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_transactions_invoice` (`invoice_url`),
  CONSTRAINT `fk_transactions_invoice` FOREIGN KEY (`invoice_url`) REFERENCES `invoice` (`invoice_url`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES ('4NJBCT0V','1EZN4B',5000.00,'203','Jl. Sambiroto VIII / J12','2025-05-21T19:04:02.000Z',NULL,'user2'),('6VJRU43W','1EZN4B',300000.00,'141','Jl. Sambiroto VIII / J12','2025-05-21T18:42:03.000Z','/invoices/6VJRU43W/invoice_6VJRU43W.pdf','user2'),('CD1PJFT8','1EZN4B',12000.00,'344','Jl. Sambiroto VIII / J12','2025-05-21T20:44:27.000Z','/invoices/CD1PJFT8/invoice_CD1PJFT8.pdf','user2'),('GL13V2YG','1EZN4B',15000.00,'243','Jl. Sambiroto VIII / J12','2025-05-21T19:43:14.000Z',NULL,'user2'),('I59XNCF9','1EZN4B',90000.00,'2015','Jl. Sambiroto VIII / J12','2025-05-21T13:15:25.000Z','/invoices/I59XNCF9/invoice_I59XNCF9.pdf','user2'),('J7NEXN0R','1EZN4B',1800000.00,'031','Jl. Sambiroto VIII / J12','2025-05-20T17:31:16.000Z',NULL,'user2'),('OqltWlXV','user1',1800000.00,'123','Jl. Sambiroto 8/E30','2025-05-15 02:04:29',NULL,'user1'),('WLRR3VQ5','1EZN4B',45000.00,'205','Jl. Sambiroto VIII / J12','2025-05-21T19:05:33.000Z',NULL,'user2'),('ySjqJwu4','user2',1800000.00,'031','Jl. Sambiroto VIII / J12','2025-05-21 19:21:57',NULL,'user2');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-22  9:27:00
