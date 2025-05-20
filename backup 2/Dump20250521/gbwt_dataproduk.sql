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
-- Table structure for table `dataproduk`
--

DROP TABLE IF EXISTS `dataproduk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dataproduk` (
  `id` varchar(255) NOT NULL,
  `Nama` varchar(255) NOT NULL,
  `Harga` decimal(10,2) DEFAULT NULL,
  `Harga_diskon` decimal(10,2) DEFAULT NULL,
  `Kategori` varchar(255) DEFAULT NULL,
  `Keterangan` text,
  `Pedagang` varchar(255) DEFAULT NULL,
  `Stok` int DEFAULT NULL,
  `imageUrl` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pedagang` (`Pedagang`),
  KEY `fk_dataproduk_user` (`user_id`),
  CONSTRAINT `dataproduk_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dataproduk`
--

LOCK TABLES `dataproduk` WRITE;
/*!40000 ALTER TABLE `dataproduk` DISABLE KEYS */;
INSERT INTO `dataproduk` VALUES ('5IUDBPJP','Susu Cimori Coklat ',10000.00,9000.00,'Minuman','Susu Kotak Cimori Coklat 250ml','Tiga Putra',34,'/images/5IUDBPJP','2025-04-21 14:25:29',NULL),('8MV3B8XH','Gulaku',15000.00,NULL,'Sembako','Gulaku Hijau 1Kg','Tiga Putra',20,'/images/8MV3B8XH','2025-04-21 14:25:29',NULL),('8OAX0SG4','Sepatu Kickers',200000.00,NULL,'Pakaian','Sepatu Kicker Model 458 Ukuran 41','Butik Singgih ',10,'/images/8OAX0SG4','2025-04-21 14:25:29',NULL),('B7NCKR3G','Beras Jeruk',300000.00,NULL,'Sembako','Beras Jeruk 25Kg','Tiga Putra 3',20,'/images/B7NCKR3G','2025-04-21 14:25:29',NULL),('CD1OAJ4W','Sepatu Jordan',2000000.00,1800000.00,'Pakaian','Sepatu Jordan model 3','Toko Bimantara',5,'/images/CD1OAJ4W','2025-04-24 07:03:47',NULL),('DUWINV9X','Frestea',5000.00,NULL,'Minuman','Frestea apel 300ml','Tiga Putra 3',12,'/images/DUWINV9X','2025-05-02 03:28:26',NULL),('HLDJX72M','Sprite',6000.00,NULL,'Minuman','Sprite 300ml','Tiga Putra',63,'/images/HLDJX72M','2025-04-21 14:59:02',NULL),('KJ6OO75R','Aqua',5000.00,NULL,'Minuman','Aqua 600ml','Tiga Putra 3',64,'/images/KJ6OO75R','2025-04-21 14:25:29',NULL),('KLX366DJ','Batik Pekalongan',250000.00,NULL,'Pakaian','Batik Pekalongan XL','Butik Singgih ',5,'/images/KLX366DJ','2025-05-19 05:40:11',NULL),('MATLE7A2','Gamis Citra',50000.00,NULL,'Pakaian','Gamis Citra Ukuran XL','Butik Singgih ',12,'/images/MATLE7A2','2025-04-21 14:25:29',NULL),('QMUBRRII','Sarung Wadimor',100000.00,NULL,'Pakaian','Sarung Wadimor Model 100 ','Butik Singgih ',6,'/images/QMUBRRII','2025-04-27 14:37:17',NULL),('SXPC87UD','Coca cola',5000.00,NULL,'Minuman','Coca cola 300ml','Tiga Putra 3',15,'/images/SXPC87UD','2025-05-09 09:52:03',NULL),('UEVVEFHR','Beras Pin pin',90000.00,NULL,'Sembako','Beras Pin pin 5 Kg','Tiga Putra',4,'/images/UEVVEFHR','2025-04-21 15:04:47',NULL),('Y78NXCDE','Teh Pucuk',5000.00,NULL,'Minuman','Teh Pucuk Harum 400ml','Tiga Putra 3',39,'/images/Y78NXCDE','2025-04-21 14:25:29',NULL);
/*!40000 ALTER TABLE `dataproduk` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-21  1:24:14
