-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 10, 2025 at 03:49 PM
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
-- Database: `barangay_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `created_by`, `created_at`) VALUES
(1, 'Barangay Clean-up Drive', 'Join us this Saturday for the barangay clean-up activity.', 2, '2025-09-14 07:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `disclosures`
--

CREATE TABLE `disclosures` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `created_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `disclosures`
--

INSERT INTO `disclosures` (`id`, `filename`, `url`, `created_by`, `uploaded_at`) VALUES
(1, 'Barangay Ordinance 2025.pdf', '/uploads/ordinance2025.pdf', 2, '2025-09-14 07:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `max_quantity` int(11) NOT NULL DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `item_name`, `description`, `created_at`, `max_quantity`) VALUES
(1, 'Projector', 'LCD projector for community use', '2025-09-14 07:06:55', 5),
(2, 'Sound System', 'Speakers and microphone set', '2025-09-14 07:06:55', 2),
(3, 'Chairs', 'Plastic chairs for events', '2025-09-14 07:06:55', 50);

-- --------------------------------------------------------

--
-- Table structure for table `item_availability`
--

CREATE TABLE `item_availability` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `available_quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `printed_logs`
--

CREATE TABLE `printed_logs` (
  `id` int(11) NOT NULL,
  `request_type` varchar(50) DEFAULT NULL,
  `request_id` int(11) NOT NULL,
  `item` varchar(255) DEFAULT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `resident_name` varchar(255) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `printed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `youth_classification` varchar(100) DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `registered_sk` enum('Yes','No') DEFAULT NULL,
  `registered_national` enum('Yes','No') DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `birthday` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `residents`
--

INSERT INTO `residents` (`id`, `username`, `password`, `full_name`, `address`, `age`, `gender`, `contact`, `civil_status`, `youth_classification`, `education`, `registered_sk`, `registered_national`, `status`, `created_at`, `birthday`) VALUES
(15, 'jj', '$2b$10$XCaJHEL6jrex6iW7AZZ7HOlq/LhvanVbYo5nI4.4BhUibwhTn3Rla', '', '', 0, 'male', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', '2025-09-23 08:00:45', NULL),
(16, 'aa', '$2b$10$.bWtsl8pCPCXKCoYVkBgH.NKh30Ejgcp7jLuj0t3dLtYR5i7JxNGK', '', '', 0, 'male', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', '2025-09-23 08:34:05', NULL),
(17, 'kk', '$2b$10$DV3WYx8ae/YHV/mAQ0dXjOvBxT/y5bzhBV6pYRW3zhb.oVfZiT7lW', '', '', 0, 'male', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', '2025-09-24 06:50:51', NULL),
(18, 'jk24', '$2b$10$vWzY42OzbJhUc656cdioseS.XjGGXN21JKKkgL1JpNhZ9tll/Oo3e', 'John Kenneth Galvan', 'blk44', 25, 'male', '123123123', 'Single', 'In School Youth', 'College Level', 'Yes', 'Yes', 'pending', '2025-10-02 05:51:35', NULL),
(19, 'kenneth24', '$2b$10$CYELqw.rcAT.YiWHvr4xVeVkHuhJjnzhxuWE/onlmKYqSK2z3WXZS', 'John Kenneth Galvan', 'Blk44 Penafrancia mayamot antipolo city', 25, 'male', '123123123123', 'Single', 'In School Youth', 'College Level', 'Yes', 'Yes', 'pending', '2025-10-07 06:57:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `resident_files`
--

CREATE TABLE `resident_files` (
  `id` int(11) NOT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resident_requests`
--

CREATE TABLE `resident_requests` (
  `id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','printed','go_to_pickup','claimed','unavailable','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_needed` date NOT NULL,
  `page_count` int(11) DEFAULT 0,
  `purpose` varchar(255) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `released_by` int(11) DEFAULT NULL,
  `released_at` datetime DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `claimed_by` int(11) DEFAULT NULL,
  `printed_by` varchar(255) DEFAULT NULL,
  `printed_at` datetime DEFAULT NULL,
  `notified_at` datetime DEFAULT NULL,
  `notified_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resident_requests`
--

INSERT INTO `resident_requests` (`id`, `resident_id`, `filename`, `original_name`, `status`, `created_at`, `date_needed`, `page_count`, `purpose`, `approved_by`, `approved_at`, `released_by`, `released_at`, `claimed_at`, `claimed_by`, `printed_by`, `printed_at`, `notified_at`, `notified_by`) VALUES
(72, 15, '1759573507132-IAAS2_Midterm Activity No 2_Galvan_Aryas.pdf', NULL, 'pending', '2025-10-04 10:25:07', '2025-10-05', 2, NULL, 7, '2025-10-07 13:57:24', NULL, NULL, '2025-10-07 13:57:31', 7, NULL, NULL, '2025-10-07 13:57:29', 7),
(73, 18, '1759574349967-IAAS2_Midterm Activity No 2 Aryas_Galvan.pdf', NULL, 'go_to_pickup', '2025-10-04 10:39:09', '2025-10-05', 2, NULL, 7, '2025-10-07 13:49:57', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-07 13:50:01', 7),
(74, 15, '1759815807925-BUSANALY-FINALS.pdf', NULL, 'go_to_pickup', '2025-10-07 05:43:27', '2025-10-08', 10, NULL, 7, '2025-10-07 13:43:40', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-07 13:43:44', 7),
(75, 15, '1759817313564-IAAS2_Midterm Activity No 2 Aryas_Galvan.pdf', NULL, 'go_to_pickup', '2025-10-07 06:08:33', '2025-10-07', 2, NULL, 4, '2025-10-07 14:15:04', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-07 14:15:43', 4);

-- --------------------------------------------------------

--
-- Table structure for table `resident_schedules`
--

CREATE TABLE `resident_schedules` (
  `id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `item` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `date_from` date NOT NULL,
  `date_to` date NOT NULL,
  `time_from` time NOT NULL,
  `time_to` time NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `user_id`, `item`, `quantity`, `date_from`, `date_to`, `time_from`, `time_to`, `status`, `created_at`, `updated_at`, `approved_by`, `approved_at`, `returned_at`, `reason`) VALUES
(45, 18, 'Chairs', 20, '2025-10-03', '2025-10-03', '08:00:00', '03:00:00', 'Approved', '2025-10-03 06:54:54', '2025-10-03 08:37:02', 4, '2025-10-03 16:37:02', NULL, 'Birthday Party'),
(46, 17, 'Chairs', 15, '2025-10-06', '2025-10-06', '08:00:00', '08:00:00', 'Approved', '2025-10-04 09:35:29', '2025-10-04 09:47:06', 4, '2025-10-04 17:47:06', NULL, 'Birthday Party'),
(47, 15, 'Sound System', 1, '2025-10-07', '2025-10-07', '08:00:00', '03:00:00', 'Pending', '2025-10-07 06:09:39', '2025-10-07 06:09:39', NULL, NULL, NULL, 'Birthday Party ');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `name` varchar(255) NOT NULL,
  `contact` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `username`, `password`, `created_at`, `name`, `contact`) VALUES
(1, 'allenkalbo', '$2b$10$4sM2NBnb2B4nz.AVDkcUeOngwDD7RLfGT9PGxzdweDILWvObCjBE.', '2025-09-15 08:00:58', '', NULL),
(4, 'allen', '$2b$10$ROHonPCWaKao0Ubjy0oXVOY4/pThqilY45gb1t38lv30Fw2XSreoC', '2025-09-21 09:41:32', '', NULL),
(7, 'kalbo', '$2b$10$gfric27xf8nJSCI5x6GDHus7e2ua5WrGP8.WuYVlbchZpc8AptSbO', '2025-10-04 08:16:06', 'allenkalbo', '123123');

-- --------------------------------------------------------

--
-- Table structure for table `uploaded_files`
--

CREATE TABLE `uploaded_files` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `upload_limits`
--

CREATE TABLE `upload_limits` (
  `id` int(11) NOT NULL,
  `type` enum('resident','global') NOT NULL,
  `value` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `upload_limits`
--

INSERT INTO `upload_limits` (`id`, `type`, `value`, `updated_by`, `updated_at`) VALUES
(1, 'resident', 30, NULL, '2025-09-29 07:30:42'),
(2, 'global', 100, NULL, '2025-09-21 04:20:13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('resident','staff','admin') NOT NULL DEFAULT 'resident',
  `address` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `contact` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `username`, `password`, `role`, `address`, `age`, `gender`, `contact`, `created_at`) VALUES
(1, 'System Admin', 'admin', 'admin123', 'admin', 'Barangay Hall', 35, 'male', '09170000000', '2025-09-14 07:06:55'),
(2, 'Staff User', 'staff', 'staff123', 'staff', 'Barangay Office', 28, 'female', '09171111111', '2025-09-14 07:06:55'),
(3, 'Juan Dela Cruz', 'juan', 'juan123', 'resident', 'Purok 1', 22, 'male', '09172222222', '2025-09-14 07:06:55'),
(4, 'Maria Santos', 'maria', 'maria123', 'resident', 'Purok 2', 25, 'female', '09173333333', '2025-09-14 07:06:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `disclosures`
--
ALTER TABLE `disclosures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `item_availability`
--
ALTER TABLE `item_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `printed_logs`
--
ALTER TABLE `printed_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `resident_files`
--
ALTER TABLE `resident_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resident_id` (`resident_id`);

--
-- Indexes for table `resident_requests`
--
ALTER TABLE `resident_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resident_schedules`
--
ALTER TABLE `resident_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `upload_limits`
--
ALTER TABLE `upload_limits`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `disclosures`
--
ALTER TABLE `disclosures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `item_availability`
--
ALTER TABLE `item_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `printed_logs`
--
ALTER TABLE `printed_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `resident_files`
--
ALTER TABLE `resident_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resident_requests`
--
ALTER TABLE `resident_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `resident_schedules`
--
ALTER TABLE `resident_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `upload_limits`
--
ALTER TABLE `upload_limits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `disclosures`
--
ALTER TABLE `disclosures`
  ADD CONSTRAINT `disclosures_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `item_availability`
--
ALTER TABLE `item_availability`
  ADD CONSTRAINT `item_availability_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `resident_files`
--
ALTER TABLE `resident_files`
  ADD CONSTRAINT `resident_files_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`);

--
-- Constraints for table `resident_schedules`
--
ALTER TABLE `resident_schedules`
  ADD CONSTRAINT `resident_schedules_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`),
  ADD CONSTRAINT `resident_schedules_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `staff` (`id`);

--
-- Constraints for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  ADD CONSTRAINT `uploaded_files_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
