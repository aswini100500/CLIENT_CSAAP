-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 17, 2025 at 02:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `accounting`
--

-- --------------------------------------------------------

--
-- Table structure for table `gstr2a_cdn_amendments`
--

CREATE TABLE `gstr2a_cdn_amendments` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `month` varchar(20) NOT NULL,
  `supplier_gstin` varchar(20) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `original_note_no` varchar(100) DEFAULT NULL,
  `amendment_type` varchar(100) DEFAULT NULL,
  `amendment_date` date DEFAULT NULL,
  `original_value` decimal(12,2) DEFAULT NULL,
  `amended_value` decimal(12,2) DEFAULT NULL,
  `status` enum('Pending','Matched') DEFAULT 'Pending',
  `action_note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `gstr2a_cdn_amendments`
--
ALTER TABLE `gstr2a_cdn_amendments`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `gstr2a_cdn_amendments`
--
ALTER TABLE `gstr2a_cdn_amendments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
