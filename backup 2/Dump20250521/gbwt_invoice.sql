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
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `file` longblob,
  `invoice_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_invoiceurl_unique` (`invoice_url`),
  UNIQUE KEY `invoice_url` (`invoice_url`),
  UNIQUE KEY `invoice_url_2` (`invoice_url`),
  UNIQUE KEY `invoice_url_3` (`invoice_url`),
  UNIQUE KEY `invoice_url_4` (`invoice_url`),
  UNIQUE KEY `invoice_url_5` (`invoice_url`),
  UNIQUE KEY `invoice_url_6` (`invoice_url`),
  UNIQUE KEY `invoice_url_7` (`invoice_url`),
  UNIQUE KEY `invoice_url_8` (`invoice_url`),
  UNIQUE KEY `invoice_url_9` (`invoice_url`),
  UNIQUE KEY `invoice_url_10` (`invoice_url`),
  UNIQUE KEY `invoice_url_11` (`invoice_url`),
  UNIQUE KEY `invoice_url_12` (`invoice_url`),
  UNIQUE KEY `invoice_url_13` (`invoice_url`),
  UNIQUE KEY `invoice_url_14` (`invoice_url`),
  UNIQUE KEY `invoice_url_15` (`invoice_url`),
  UNIQUE KEY `invoice_url_16` (`invoice_url`),
  UNIQUE KEY `invoice_url_17` (`invoice_url`),
  UNIQUE KEY `invoice_url_18` (`invoice_url`),
  UNIQUE KEY `invoice_url_19` (`invoice_url`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES ('kzkLlVEb','J7NEXN0R','invoice_J7NEXN0R.pdf',_binary '%PDF-1.3\n%ºß¬\à\n3 0 obj\n<</Type /Page\n/Parent 1 0 R\n/Resources 2 0 R\n/MediaBox [0 0 595.2799999999999727 841.8899999999999864]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 4044\n>>\nstream\n0.5670000000000001 w\n0 G\nBT\n/F1 20 Tf\n23. TL\n0.157 g\n198.8377952755905369 785.1970866141732586 Td\n(STRUK PEMESANAN) Tj\nET\n0.78 G\n42.5196850393700814 771.0238582677164914 m\n552.7559055118110791 771.0238582677164914 l\nS\nBT\n/F1 10 Tf\n11.5 TL\n0.157 g\n42.5196850393700814 742.6774015748030706 Td\n(Kode pemesanan: J7NEXN0R) Tj\nET\nBT\n/F1 10 Tf\n11.5 TL\n0.157 g\n42.5196850393700814 728.5041732283464171 Td\n(Tanggal: 21/5/2025) Tj\nET\nBT\n/F1 10 Tf\n11.5 TL\n0.157 g\n42.5196850393700814 714.3309448818897636 Td\n(Nama Pelanggan: user2) Tj\nET\nBT\n/F1 10 Tf\n11.5 TL\n0.157 g\n42.5196850393700814 700.15771653543311 Td\n(Alamat: Jl. Sambiroto VIII / J12) Tj\nET\n0.78 G\n0.5670000000000001 w\n0.78 G\n0.5670000000000001 w\n0.16 0.5 0.73 rg\n0.78 G\n0. w\n0.16 0.5 0.73 rg\n42.5196850393700814 671.8112598425196893 28.3464566929133888 -27.3578740157480311 re\nf\nBT\n/F2 9 Tf\n10.3499999999999996 TL\n1. g\n50.7079133858267781 655.6573228346455835 Td\n(No) Tj\nET\n0.16 0.5 0.73 rg\n0.78 G\n0. w\n0.16 0.5 0.73 rg\n70.8661417322834666 671.8112598425196893 226.7716535433071101 -27.3578740157480311 re\nf\nBT\n/F2 9 Tf\n10.3499999999999996 TL\n1. g\n79.3700787401574814 655.6573228346455835 Td\n(Nama Produk) Tj\nET\n0.16 0.5 0.73 rg\n0.78 G\n0. w\n0.16 0.5 0.73 rg\n297.6377952755905767 671.8112598425196893 85.0393700787401627 -27.3578740157480311 re\nf\nBT\n/F2 9 Tf\n10.3499999999999996 TL\n1. g\n348.7932283464567149 655.6573228346455835 Td\n(Harga) Tj\nET\n0.16 0.5 0.73 rg\n0.78 G\n0. w\n0.16 0.5 0.73 rg\n382.6771653543307252 671.8112598425196893 42.5196850393700814 -27.3578740157480311 re\nf\nBT\n/F2 9 Tf\n10.3499999999999996 TL\n1. g\n396.4670078740157351 655.6573228346455835 Td\n(Qty) Tj\nET\n0.16 0.5 0.73 rg\n0.78 G\n0. w\n0.16 0.5 0.73 rg\n425.1968503937008563 671.8112598425196893 85.0393700787401627 -27.3578740157480311 re\nf\nBT\n/F2 9 Tf\n10.3499999999999996 TL\n1. g\n465.91228346456694 655.6573228346455835 Td\n(Subtotal) Tj\nET\n0.78 G\n0.5670000000000001 w\n0.96 g\n0.78 G\n0. w\n0.96 g\n42.5196850393700814 644.4533858267716369 28.3464566929133888 -27.3578740157480311 re\nf\nBT\n/F1 9 Tf\n10.3499999999999996 TL\n0.314 g\n54.217913385826769 628.2994488188976447 Td\n(1) Tj\nET\n0.96 g\n0.78 G\n0. w\n0.96 g\n70.8661417322834666 644.4533858267716369 226.7716535433071101 -27.3578740157480311 re\nf\nBT\n/F1 9 Tf\n10.3499999999999996 TL\n0.314 g\n79.3700787401574814 628.2994488188976447 Td\n(Sepatu Jordan) Tj\nET\n0.96 g\n0.78 G\n0. w\n0.96 g\n297.6377952755905767 644.4533858267716369 85.0393700787401627 -27.3578740157480311 re\nf\nBT\n/F1 9 Tf\n10.3499999999999996 TL\n0.314 g\n305.8632283464567649 628.2994488188976447 Td\n(Rp 1.800.000,00) Tj\nET\n0.96 g\n0.78 G\n0. w\n0.96 g\n382.6771653543307252 644.4533858267716369 42.5196850393700814 -27.3578740157480311 re\nf\nBT\n/F1 9 Tf\n10.3499999999999996 TL\n0.314 g\n401.4620078740158533 628.2994488188976447 Td\n(1) Tj\nET\n0.96 g\n0.78 G\n0. w\n0.96 g\n425.1968503937008563 644.4533858267716369 85.0393700787401627 -27.3578740157480311 re\nf\nBT\n/F1 9 Tf\n10.3499999999999996 TL\n0.314 g\n433.4222834645669309 628.2994488188976447 Td\n(Rp 1.800.000,00) Tj\nET\n0.78 G\n0.5670000000000001 w\n0.78 G\n0. w\n0.78 G\n0.5670000000000001 w\nBT\n/F1 8 Tf\n9.1999999999999993 TL\n0.392 g\n42.5196850393700814 28.3464566929134207 Td\n(Dipesan pada - 21/05/2025, 00.31.16) Tj\nET\n0.78 G\n0.5670000000000001 w\n0.78 G\n0.5670000000000001 w\n0.78 G\n0.5670000000000001 w\n0.78 G\n0.5670000000000001 w\n0.96 g\n0.78 G\n0. w\n0.96 g\n226.7716535433071101 588.7490551181101637 198.4251968503937178 -30.8078740157480304 re\nf\nBT\n/F2 12 Tf\n13.7999999999999989 TL\n0.314 g\n310.8529133858268096 570.045118110236217 Td\n(Total Pembayaran:) Tj\nET\n0.96 g\n0.78 G\n0. w\n0.96 g\n425.1968503937008563 588.7490551181101637 113.3858267716535551 -30.8078740157480304 re\nf\nBT\n/F2 12 Tf\n13.7999999999999989 TL\n0.314 g\n437.9187401574803857 570.045118110236217 Td\n(Rp 1.800.000,00) Tj\nET\n0.78 G\n0.5670000000000001 w\n0.78 G\n0. w\n0.78 G\n0.5670000000000001 w\n0.78 G\n0.5670000000000001 w\nBT\n/F1 8 Tf\n9.1999999999999993 TL\n0.157 g\n42.5196850393700814 560.4025984251968566 Td\n(Catatan:) Tj\nET\nBT\n/F1 8 Tf\n9.1999999999999993 TL\n0.157 g\n42.5196850393700814 546.2293700787400894 Td\n(031) Tj\nET\nendstream\nendobj\n1 0 obj\n<</Type /Pages\n/Kids [3 0 R ]\n/Count 1\n>>\nendobj\n5 0 obj\n<<\n/Type /Font\n/BaseFont /Helvetica\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n6 0 obj\n<<\n/Type /Font\n/BaseFont /Helvetica-Bold\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n7 0 obj\n<<\n/Type /Font\n/BaseFont /Helvetica-Oblique\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n8 0 obj\n<<\n/Type /Font\n/BaseFont /Helvetica-BoldOblique\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n9 0 obj\n<<\n/Type /Font\n/BaseFont /Courier\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n10 0 obj\n<<\n/Type /Font\n/BaseFont /Courier-Bold\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n11 0 obj\n<<\n/Type /Font\n/BaseFont /Courier-Oblique\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n12 0 obj\n<<\n/Type /Font\n/BaseFont /Courier-BoldOblique\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n13 0 obj\n<<\n/Type /Font\n/BaseFont /Times-Roman\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n14 0 obj\n<<\n/Type /Font\n/BaseFont /Times-Bold\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n15 0 obj\n<<\n/Type /Font\n/BaseFont /Times-Italic\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n16 0 obj\n<<\n/Type /Font\n/BaseFont /Times-BoldItalic\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n17 0 obj\n<<\n/Type /Font\n/BaseFont /ZapfDingbats\n/Subtype /Type1\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n18 0 obj\n<<\n/Type /Font\n/BaseFont /Symbol\n/Subtype /Type1\n/FirstChar 32\n/LastChar 255\n>>\nendobj\n2 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 5 0 R\n/F2 6 0 R\n/F3 7 0 R\n/F4 8 0 R\n/F5 9 0 R\n/F6 10 0 R\n/F7 11 0 R\n/F8 12 0 R\n/F9 13 0 R\n/F10 14 0 R\n/F11 15 0 R\n/F12 16 0 R\n/F13 17 0 R\n/F14 18 0 R\n>>\n/XObject <<\n>>\n>>\nendobj\n19 0 obj\n<<\n/Producer (jsPDF 3.0.1)\n/Title (Invoice J7NEXN0R)\n/Subject (Purchase Invoice)\n/Author (GBWT)\n/Keywords (invoice, purchase)\n/Creator (GBWT)\n/CreationDate (D:20250521003116+07\'00\')\n>>\nendobj\n20 0 obj\n<<\n/Type /Catalog\n/Pages 1 0 R\n/OpenAction [3 0 R /FitH null]\n/PageLayout /OneColumn\n>>\nendobj\nxref\n0 21\n0000000000 65535 f \n0000004248 00000 n \n0000006065 00000 n \n0000000015 00000 n \n0000000152 00000 n \n0000004305 00000 n \n0000004430 00000 n \n0000004560 00000 n \n0000004693 00000 n \n0000004830 00000 n \n0000004953 00000 n \n0000005082 00000 n \n0000005214 00000 n \n0000005350 00000 n \n0000005478 00000 n \n0000005605 00000 n \n0000005734 00000 n \n0000005867 00000 n \n0000005969 00000 n \n0000006313 00000 n \n0000006514 00000 n \ntrailer\n<<\n/Size 21\n/Root 20 0 R\n/Info 19 0 R\n/ID [ <0A29AA73173125B87F4F6212D418867C> <0A29AA73173125B87F4F6212D418867C> ]\n>>\nstartxref\n6618\n%%EOF','/invoices/J7NEXN0R/invoice_J7NEXN0R.pdf');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-21  1:24:09
