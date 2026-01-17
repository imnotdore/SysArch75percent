-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 17, 2026 at 02:31 PM
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
-- Database: `sk_db`
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

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `created_at`) VALUES
(3, 'sk123', '$2b$10$YEH8iqSXVm4GFfDYUW7lOOhT.Fj7Fr/Agtys2PeVvb4jdcaz6x6Lm', '2025-10-27 09:39:28'),
(4, 'admin', '$2b$10$M1AXFVxA8jjVYMjC2nFjvuM7xBxSy/bNesfag4JXgJyhaOfnJkvlG', '2025-10-28 04:49:24'),
(6, 'manny@gmail.com', '$2b$10$uiurZmbkS6UMWqfoEjOza.nimadJCFGTBT/rETmpqxaslHiw/nUIS', '2025-11-08 07:05:30');

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
-- Table structure for table `computer_schedule`
--

CREATE TABLE `computer_schedule` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pc_name` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('Pending','Approved','Done','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `computer_schedule`
--

INSERT INTO `computer_schedule` (`id`, `user_id`, `pc_name`, `date`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(1, 18, 'PC 2', '2025-10-17', '08:30:00', '10:30:00', 'Pending', '2025-10-15 19:33:11'),
(2, 18, 'PC 2', '2025-10-16', '08:20:00', '09:50:00', 'Pending', '2025-10-15 20:17:39'),
(3, 17, 'PC 1', '2025-10-18', '08:30:00', '10:30:00', 'Pending', '2025-10-17 11:35:43');

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
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `max_quantity` int(11) NOT NULL DEFAULT 10,
  `available` int(11) DEFAULT 1,
  `borrowing_duration` int(11) DEFAULT 7,
  `can_renew` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `item_name`, `description`, `category`, `created_at`, `updated_at`, `max_quantity`, `available`, `borrowing_duration`, `can_renew`) VALUES
(1, 'Projector', 'LCD projector for community use', 'Other', '2025-09-14 07:06:55', '2026-01-13 08:15:19', 20, 20, 10, 0),
(2, 'Sound System', 'Speakers and microphone set', NULL, '2025-09-14 07:06:55', '2026-01-13 08:08:15', 2, 2, 7, 1),
(3, 'Chairs', 'Plastic chairs for events', NULL, '2025-09-14 07:06:55', '2026-01-13 08:12:04', 50, 50, 7, 1);

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
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('due_soon','available','approved','renewal','reminder','return') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `read` tinyint(1) DEFAULT 0,
  `item_name` varchar(255) DEFAULT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
-- Table structure for table `renewal_requests`
--

CREATE TABLE `renewal_requests` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item` varchar(255) NOT NULL,
  `current_return_date` date NOT NULL,
  `requested_return_date` date NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `sex` enum('Male','Female') NOT NULL,
  `birthday` date NOT NULL,
  `age` int(11) NOT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated') NOT NULL,
  `citizenship` varchar(50) DEFAULT 'Filipino',
  `house_no_street` varchar(255) NOT NULL,
  `purok_sitio` varchar(100) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT 'Barangay 123',
  `city_municipality` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `mobile_number` varchar(11) NOT NULL,
  `email_address` varchar(100) DEFAULT NULL,
  `valid_id_type` varchar(50) NOT NULL,
  `valid_id_number` varchar(50) NOT NULL,
  `id_picture` varchar(255) DEFAULT NULL,
  `household_id` varchar(50) DEFAULT NULL,
  `family_role` varchar(50) DEFAULT NULL,
  `household_members` int(11) DEFAULT 0,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `youth_classification` varchar(50) DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `registered_sk` tinyint(1) DEFAULT 0,
  `registered_national` tinyint(1) DEFAULT 0,
  `full_name` varchar(255) GENERATED ALWAYS AS (concat(`first_name`,' ',coalesce(`middle_name`,''),' ',`last_name`,case when `suffix` is not null and `suffix` <> '' then concat(' ',`suffix`) else '' end)) STORED,
  `address` varchar(500) GENERATED ALWAYS AS (concat(`house_no_street`,', ',coalesce(`purok_sitio`,''),case when `purok_sitio` is not null and `purok_sitio` <> '' then ', ' else '' end,`barangay`,', ',`city_municipality`,', ',`province`)) STORED,
  `gender` varchar(10) GENERATED ALWAYS AS (`sex`) STORED,
  `contact` varchar(11) GENERATED ALWAYS AS (`mobile_number`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `residents`
--

INSERT INTO `residents` (`id`, `username`, `email`, `password`, `first_name`, `middle_name`, `last_name`, `suffix`, `sex`, `birthday`, `age`, `civil_status`, `citizenship`, `house_no_street`, `purok_sitio`, `barangay`, `city_municipality`, `province`, `mobile_number`, `email_address`, `valid_id_type`, `valid_id_number`, `id_picture`, `household_id`, `family_role`, `household_members`, `emergency_contact_name`, `emergency_contact_number`, `status`, `created_at`, `youth_classification`, `education`, `registered_sk`, `registered_national`) VALUES
(1, 'juandelazcruz', 'kenneth.galvan14@gmail.com', '$2b$12$5AcSn1PymX9ELavZsYnJNeXnZZqe.SZXY2Drc0G/7IgJRfNrNcJ7K', 'kenneth', 'escobedo', 'galvan', '', 'Male', '2003-02-02', 22, 'Single', 'Filipino', '123', '1123', 'Barangay 123', '123', '123', '09367161832', 'kenneth.galvan14@gmail.com', 'Voter\'s ID', '123123123123', '1768119834035-sample.jpg', '123', 'Head', 5, '123', '12312312312', 'approved', '2026-01-11 08:23:55', NULL, NULL, 0, 0);

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
  `original_name` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected','printed','go_to_pickup','claimed','released') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `date_needed` date NOT NULL,
  `page_count` int(11) NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `special_instructions` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `released_by` int(11) DEFAULT NULL,
  `released_at` datetime DEFAULT NULL,
  `claimed_by` int(11) DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `printed_by` int(11) DEFAULT NULL,
  `printed_at` datetime DEFAULT NULL,
  `notified_by` int(11) DEFAULT NULL,
  `notified_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resident_requests`
--

INSERT INTO `resident_requests` (`id`, `resident_id`, `filename`, `original_name`, `status`, `created_at`, `date_needed`, `page_count`, `purpose`, `special_instructions`, `approved_by`, `approved_at`, `released_by`, `released_at`, `claimed_by`, `claimed_at`, `printed_by`, `printed_at`, `notified_by`, `notified_at`) VALUES
(8, 1, '1768130118608-272137207.pdf', 'Introduction_to_Modern_AI_certificate_galvan-jk-bsinfotech-gmail-com_4b5db10f-996f-4d2e-9006-f9cbaec1f320.pdf', 'go_to_pickup', '2026-01-11 19:15:18', '2026-01-12', 1, 'For Work', NULL, 4, '2026-01-11 19:17:05', NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-01-11 19:40:42'),
(9, 1, '1768161473357-917856401.pdf', 'Exploring_IoT_with_Cisco_Packet_Tracer_certificate_galvan-jk-bsinfotech-gmail-com_cc5a8644-623e-4020-9483-75c3aeace919.pdf', 'pending', '2026-01-12 03:57:53', '2026-01-13', 1, 'For School', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 1, '1768320718239-57751993.png', 'capstone.png', 'go_to_pickup', '2026-01-14 00:11:58', '2026-01-16', 1, 'For Work', NULL, 4, '2026-01-14 00:14:19', NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-01-14 00:14:49');

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
  `status` enum('Pending','Approved','Rejected','Released','Returned') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `released_at` datetime DEFAULT NULL,
  `released_by` int(11) DEFAULT NULL,
  `return_condition` enum('good','damaged','missing') DEFAULT NULL,
  `damage_description` text DEFAULT NULL,
  `damage_cost` decimal(10,2) DEFAULT NULL,
  `returned_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `user_id`, `item`, `quantity`, `date_from`, `date_to`, `time_from`, `time_to`, `status`, `created_at`, `updated_at`, `approved_by`, `approved_at`, `returned_at`, `reason`, `released_at`, `released_by`, `return_condition`, `damage_description`, `damage_cost`, `returned_by`) VALUES
(70, 1, 'Chairs', 20, '2026-01-14', '2026-01-17', '08:00:00', '11:00:00', 'Approved', '2026-01-11 18:50:53', '2026-01-11 18:51:17', 4, '2026-01-12 02:51:17', NULL, 'bday', NULL, NULL, NULL, NULL, NULL, NULL);

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
  `contact` varchar(50) DEFAULT NULL,
  `status` enum('pending','approved') DEFAULT 'pending',
  `staff_id` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `username`, `password`, `created_at`, `name`, `contact`, `status`, `staff_id`) VALUES
(1, 'allenkalboooo', '$2b$10$4sM2NBnb2B4nz.AVDkcUeOngwDD7RLfGT9PGxzdweDILWvObCjBE.', '2025-09-15 08:00:58', 'aahahha', '123456', 'approved', 'STAFF0001'),
(4, 'allen', '$2b$10$ROHonPCWaKao0Ubjy0oXVOY4/pThqilY45gb1t38lv30Fw2XSreoC', '2025-09-21 09:41:32', 'kalbo', '123123', 'approved', 'STAFF0004'),
(11, 'staff123', '$2b$10$6TG00Gw6Dy3GHK613XxHEO1kTmuARUAYK6byFlTZH2o6NyYkaNYIq', '2025-11-09 17:27:08', 'kenneth', '123123', 'approved', 'STAFF213182'),
(12, 'luka', '$2b$10$jHYC3yNTviVOuElpMDsP3.6eZEdIkzLO8amUvQUfL.SPYL2soJ3yO', '2025-11-09 21:48:49', 'luka doncic', '09123456781', 'approved', 'STAFF903486');

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

-- --------------------------------------------------------

--
-- Table structure for table `waitlist`
--

CREATE TABLE `waitlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `position` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indexes for table `computer_schedule`
--
ALTER TABLE `computer_schedule`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `idx_user_read` (`user_id`,`read`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `printed_logs`
--
ALTER TABLE `printed_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `renewal_requests`
--
ALTER TABLE `renewal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_schedule_status` (`schedule_id`,`status`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_mobile_number` (`mobile_number`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_date_needed` (`date_needed`),
  ADD KEY `idx_resident_date` (`resident_id`,`date_needed`),
  ADD KEY `idx_status` (`status`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `released_by` (`released_by`),
  ADD KEY `returned_by` (`returned_by`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `staff_id` (`staff_id`);

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
-- Indexes for table `waitlist`
--
ALTER TABLE `waitlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_item` (`user_id`,`item_name`),
  ADD KEY `idx_item_name` (`item_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `computer_schedule`
--
ALTER TABLE `computer_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `disclosures`
--
ALTER TABLE `disclosures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `item_availability`
--
ALTER TABLE `item_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `printed_logs`
--
ALTER TABLE `printed_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `renewal_requests`
--
ALTER TABLE `renewal_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `resident_files`
--
ALTER TABLE `resident_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resident_requests`
--
ALTER TABLE `resident_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `resident_schedules`
--
ALTER TABLE `resident_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
-- AUTO_INCREMENT for table `waitlist`
--
ALTER TABLE `waitlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `renewal_requests`
--
ALTER TABLE `renewal_requests`
  ADD CONSTRAINT `renewal_requests_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `renewal_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `resident_files`
--
ALTER TABLE `resident_files`
  ADD CONSTRAINT `resident_files_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`);

--
-- Constraints for table `resident_requests`
--
ALTER TABLE `resident_requests`
  ADD CONSTRAINT `resident_requests_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`);

--
-- Constraints for table `resident_schedules`
--
ALTER TABLE `resident_schedules`
  ADD CONSTRAINT `resident_schedules_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`),
  ADD CONSTRAINT `resident_schedules_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `staff` (`id`);

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`released_by`) REFERENCES `staff` (`id`),
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`released_by`) REFERENCES `staff` (`id`),
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`returned_by`) REFERENCES `staff` (`id`);

--
-- Constraints for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  ADD CONSTRAINT `uploaded_files_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `waitlist`
--
ALTER TABLE `waitlist`
  ADD CONSTRAINT `waitlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
