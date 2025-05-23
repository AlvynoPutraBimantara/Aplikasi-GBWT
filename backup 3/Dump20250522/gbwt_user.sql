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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL,
  `NamaWarung` varchar(255) DEFAULT NULL,
  `Nama` varchar(255) NOT NULL,
  `Telp` varchar(20) DEFAULT NULL,
  `Alamat` text,
  `Password` varchar(255) NOT NULL,
  `role` enum('user','admin','guest') NOT NULL DEFAULT 'user',
  `imageUrl` varchar(2083) DEFAULT NULL,
  `is_guest` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('1EZN4B','Butik Singgih ','user2','6287857909821','Jl. Sambiroto VIII / J12','$2b$10$xUFB.gSMwBgy.nU8NGBIRO4p9sn9NPRXe78c6Ixa2yCj1hd.CdR1q','user','http://localhost:3001/uploads/mZkDqgQH',0),('4e50','admin','asd','6287857909820','admin','$2b$10$2SKjOeeVJ4/KO3IJBnNHF.WbyYxjs5vwQgrzaCpBq2cRFGhOt2zJ6','admin',NULL,0),('4e52','Tiga Putra 3','user1','12345678911','Jl. Sambiroto 8/E30','$2b$10$GABxC4OzfRpBMU24YXKXcujgBYDLrcWFNKg.e4x4Th4/dil13GUxe','user','http://localhost:3001/uploads/iA89qzHE',0),('a6R3e7Ms','Toko Bimantara','Bimantara','6287857909820','Jl. Sambiroto IX/Blok E30','$2b$10$DKfxAd.pu59Y2rHVhfZzLuEAofipJyt2LuSmqwTKxJ20TrKFiEhRe','user','http://localhost:3001/uploads/cLjoS9UK',0),('ajWRS78y','Chau Chii','user5','0123456789','alamat5','$2b$10$h8YgX8ZG9EeR/IVvtLRYt.wWAR9dmF3AgKHcX9Zu32FYhctfZGQj2','user','http://localhost:3001/uploads/E1iJ3Xr5',0),('Ur9ZfYeE',NULL,'user6','6287857909820','Jl. Sambiroto 8','$2b$10$15kcx3F1c3UHTECkJwmkpeV1MPmwIXAfLuz2J8igmMvdwcClxNtr2','user','http://localhost:3001/uploads/ncPkg02O',0),('zi4tFkW0','Butik Wong Ayu','user3','6287857909820','alamat3','$2b$10$HEtHL/2Vx1Sf4aiYDljSVeK1NK619xYzMPFWiiJk/fmkRk56Oxg0y','user','http://localhost:3001/uploads/mgr7GEHY',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-22  9:27:04
