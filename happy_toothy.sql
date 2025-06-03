-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 03, 2025 at 12:04 PM
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
-- Database: `happy_toothy`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id_appointment` int(11) NOT NULL,
  `id_patient` int(11) NOT NULL,
  `id_doctor` int(11) NOT NULL,
  `id_service` int(11) NOT NULL,
  `tanggal_janji` date NOT NULL,
  `waktu_janji` time NOT NULL,
  `status_janji` enum('Pending','Confirmed','Completed','Cancelled','Rescheduled') DEFAULT 'Pending',
  `catatan_pasien` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id_appointment`, `id_patient`, `id_doctor`, `id_service`, `tanggal_janji`, `waktu_janji`, `status_janji`, `catatan_pasien`, `created_at`) VALUES
(1, 2, 1, 1, '2025-06-05', '10:00:00', 'Confirmed', 'Gigi geraham bawah sebelah kanan agak sakit', '2025-05-27 17:50:10'),
(2, 2, 1, 1, '2025-05-20', '11:00:00', 'Completed', 'Pembersihan gigi rutin selesai', '2025-05-27 20:20:35'),
(3, 2, 1, 1, '2025-06-02', '09:00:00', 'Pending', 'Gigi yang berlubang sakit', '2025-05-28 13:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `divisi`
--

CREATE TABLE `divisi` (
  `id_divisi` int(11) NOT NULL,
  `kode_divisi` varchar(10) DEFAULT NULL,
  `nama_divisi` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `divisi`
--

INSERT INTO `divisi` (`id_divisi`, `kode_divisi`, `nama_divisi`) VALUES
(1, 'DIV-KEU', 'divisi_keuangan'),
(2, 'DIV-KAS', 'divisi_kas'),
(3, 'DIV-PEM', 'divisi_pembelian'),
(4, 'DIV-PEN', 'divisi_penjualan'),
(5, 'DIV-SDM', 'divisi_sdm');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id_doctor` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `spesialisasi` varchar(100) NOT NULL,
  `lisensi_no` varchar(50) DEFAULT NULL,
  `pengalaman_tahun` int(11) DEFAULT 0,
  `foto_profil_url` varchar(255) DEFAULT NULL,
  `rating_rata2` decimal(3,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id_doctor`, `id_user`, `spesialisasi`, `lisensi_no`, `pengalaman_tahun`, `foto_profil_url`, `rating_rata2`) VALUES
(1, 4, 'Kedokteran Gigi Anak (SpKGA)', 'SpKGA-12345', 3, NULL, 4.50),
(3, 12, 'Penyakit Mulut (Sp. PM)', 'SpPM-12345', 7, NULL, 0.00),
(4, 13, 'Konservasi Gigi (Sp. KG)', 'SpKG-12345', 3, NULL, 0.00),
(5, 5, 'Ortodonti (Sp. Ort)', 'Sp. Ort-12345', 4, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_schedules`
--

CREATE TABLE `doctor_schedules` (
  `id_schedule` int(11) NOT NULL,
  `id_doctor` int(11) NOT NULL,
  `hari_dalam_minggu` int(11) NOT NULL,
  `waktu_mulai` time NOT NULL,
  `waktu_selesai` time NOT NULL,
  `is_available` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_schedules`
--

INSERT INTO `doctor_schedules` (`id_schedule`, `id_doctor`, `hari_dalam_minggu`, `waktu_mulai`, `waktu_selesai`, `is_available`) VALUES
(1, 1, 2, '09:00:00', '12:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `level_user`
--

CREATE TABLE `level_user` (
  `id_level_user` int(11) NOT NULL,
  `nama_level_user` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `level_user`
--

INSERT INTO `level_user` (`id_level_user`, `nama_level_user`) VALUES
(1, 'admin'),
(2, 'dokter'),
(3, 'staff'),
(4, 'pasien');

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `id_profile` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('perempuan','laki laki') DEFAULT NULL,
  `nik` varchar(16) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `no_telepon` varchar(15) DEFAULT NULL,
  `id_divisi` int(11) DEFAULT NULL,
  `email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`id_profile`, `nama_lengkap`, `tanggal_lahir`, `jenis_kelamin`, `nik`, `alamat`, `no_telepon`, `id_divisi`, `email`) VALUES
(1, 'Admin Happy Toothy', NULL, NULL, NULL, NULL, NULL, NULL, 'admhappytoothy@gmail.com'),
(2, 'Wulan Ramadani', NULL, NULL, NULL, NULL, NULL, NULL, 'wulanramadani327@gmail.com'),
(3, 'Calista Amanda', NULL, NULL, NULL, NULL, NULL, NULL, 'calista061005@gmail.com'),
(4, 'Ramadhani Djati', NULL, NULL, NULL, NULL, NULL, NULL, 'ramadhanidjati@gmail.com'),
(5, 'Fayyaza Naira Farha', NULL, NULL, NULL, NULL, NULL, NULL, 'payapaus@gmail.com'),
(6, 'Syadina Rasya Maulidya', NULL, NULL, NULL, NULL, NULL, NULL, 'rasyasyadina@gmail.com'),
(7, 'Jaehyun NCT', NULL, NULL, NULL, NULL, NULL, NULL, 'triwulanramadani10@gmail.com'),
(8, 'Geto Suguru', NULL, NULL, NULL, NULL, NULL, NULL, '10brachiosaurus@gmail.com'),
(9, 'Jennie Blackpink', NULL, NULL, NULL, NULL, NULL, NULL, 'woolanr@gmail.com'),
(10, 'Naila Yustiara', NULL, NULL, NULL, NULL, NULL, NULL, 'nailayustiara@gmail.com'),
(11, 'Roetarindhira Icasia Aiswanindya', NULL, NULL, NULL, NULL, NULL, NULL, 'aiswacua9@gmail.com'),
(12, 'Budi Santoso', NULL, NULL, NULL, NULL, '0812345678910', NULL, 'admhappytoothy+dokter1@gmail.com'),
(13, 'Pasien 1', NULL, NULL, NULL, NULL, NULL, NULL, 'admhappytoothy+pasien1@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id_service` int(11) NOT NULL,
  `nama_layanan` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` decimal(10,2) NOT NULL,
  `durasi_menit` int(11) NOT NULL,
  `status_layanan` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id_service`, `nama_layanan`, `deskripsi`, `harga`, `durasi_menit`, `status_layanan`) VALUES
(1, 'Pemeriksaan Gigi', 'Pemeriksaan kesehatan gigi dan mulut', 200000.00, 45, 'Aktif'),
(2, 'Scaling Gigi', 'Pembersihan karang gigi dan plak.', 350000.00, 45, 'Aktif');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int(11) NOT NULL,
  `data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('igzPlFsJeFp7MQp1zAADz07gzgzgvFZE', 1747211191, '{\"cookie\":{\"originalMaxAge\":86399998,\"expires\":\"2025-05-13T22:51:27.840Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"flash\":{}}');

-- --------------------------------------------------------

--
-- Table structure for table `status_valid`
--

CREATE TABLE `status_valid` (
  `id_status_valid` int(11) NOT NULL,
  `nama_status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status_valid`
--

INSERT INTO `status_valid` (`id_status_valid`, `nama_status`) VALUES
(1, 'valid'),
(2, 'not valid'),
(3, 'keluar');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_profile` int(11) DEFAULT NULL,
  `id_level_user` int(11) NOT NULL,
  `id_status_valid` int(11) NOT NULL DEFAULT 2,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `username`, `email`, `password`, `id_profile`, `id_level_user`, `id_status_valid`, `reset_password_token`, `reset_password_expires`, `verification_token`, `verification_expires`) VALUES
(1, 'admin', 'admhappytoothy@gmail.com', '$2a$12$x3mnlk6lgtuy.ZESpCqTbO7xKOpT4vOuMgvroXGas4L5jeURi6L/2', 1, 1, 1, NULL, NULL, NULL, NULL),
(2, 'woolanr', 'wulanramadani327@gmail.com', '$2b$10$uPICdAwDUuekjVHT6VMEBOdNkuTNYBx/pvi/Lpsr.Tly8scZT8zbG', 2, 4, 1, 'e061f0f6-f702-4a90-b710-e435d70558b0', '2025-05-29 12:19:31', NULL, NULL),
(3, 'calista', 'calista061005@gmail.com', '$2b$10$R21o54NJX67USb2.ZclJleE0Fj.MqWYH/UOp2A4wQeHkeDhK4pj5q', 3, 1, 1, NULL, NULL, NULL, NULL),
(4, 'dr.rama.spkga', 'ramadhanidjati@gmail.com', '$2b$10$OW6Sp1Tf/IBc.jpTFnRu0O1mjroad6jGDkvQhT5VUGCyihR9Ll1O.', 4, 2, 1, NULL, NULL, NULL, NULL),
(5, 'dr.faya.sport', 'payapaus@gmail.com', '$2b$10$cp7awyhBmf7k8AQEoi8HT.TIZ8xdjGas1Jk2MLRCYAX9wRVt2Sh12', 5, 2, 1, NULL, NULL, NULL, NULL),
(6, 'rasya', 'rasyasyadina@gmail.com', '$2b$10$IWsEY67DLubHzFDcxSYQKOnc62XA/BuvjX1SWbUEGSC65H87yNKYO', 6, 4, 1, NULL, NULL, 'd368c447-4d59-4d2f-8866-f25808842009', '2025-05-30 17:15:00'),
(7, 'j.jaehyun', 'triwulanramadani10@gmail.com', '$2b$10$IbkGC1D0kKO1R.ml6t.uOe7L3rKbIfpMmW09LXxI.iCyCInAgm7Hu', 7, 4, 1, NULL, NULL, '9f45d299-b05d-4acc-8004-945e622e8105', '2025-05-30 21:32:03'),
(8, 'Geto', '10brachiosaurus@gmail.com', '$2b$10$VvtDyKvVwjc8LL5Pkmw97ehcgXtt.B.TcXnh88qJo4TbZxStJgM5i', 8, 4, 1, NULL, NULL, '283b3747-5334-41b3-a5e8-f6be296065fc', '2025-05-31 18:58:33'),
(9, 'Jennie', 'woolanr@gmail.com', '$2b$10$VXJkxCxk6EfbNz9sWCnMvu5S9O8GqOhSYz1i.E2xV8/YwBP3n5IUe', 9, 4, 2, NULL, NULL, '2b3da5d2-939a-41cc-9799-1e18950bd77f', '2025-05-31 19:38:01'),
(10, 'Naila', 'nailayustiara@gmail.com', '$2b$10$UW6UVrafz/Tp4QtKrcd1Me1dfgx6iWi/2LlHElElMn8z7wUK1SCJu', 10, 4, 1, NULL, NULL, '9d7b1811-36d9-45a0-8e54-d32d36e7bd36', '2025-05-31 19:27:22'),
(11, 'aiswa', 'aiswacua9@gmail.com', '$2b$10$5XAGL.VJD.pZFyePvUTGjeM8Yjl/LX0eqWfF54yRS.71QhA8GBpry', 11, 4, 1, NULL, NULL, '4aa6ee17-760c-4280-a785-56a150cb542a', '2025-05-31 19:42:51'),
(12, 'dr.budi.sppm', 'admhappytoothy+dokter1@gmail.com', '$2b$10$sl0xylfIEz06SWt3kmz7xevjYNPhHu5gSdw7gjnRsmJ5vyPlkTBLa', 12, 2, 1, NULL, NULL, NULL, NULL),
(13, 'pasien1', 'admhappytoothy+pasien1@gmail.com', '$2b$10$547J536N0Jm1KhgCfWsoveFSZVvd1PCMbPL5Okfq26kEDw37In6/u', 13, 4, 1, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id_appointment`),
  ADD UNIQUE KEY `id_doctor` (`id_doctor`,`tanggal_janji`,`waktu_janji`),
  ADD KEY `id_patient` (`id_patient`),
  ADD KEY `id_service` (`id_service`);

--
-- Indexes for table `divisi`
--
ALTER TABLE `divisi`
  ADD PRIMARY KEY (`id_divisi`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id_doctor`),
  ADD UNIQUE KEY `id_user` (`id_user`),
  ADD UNIQUE KEY `lisensi_no` (`lisensi_no`);

--
-- Indexes for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  ADD PRIMARY KEY (`id_schedule`),
  ADD UNIQUE KEY `id_doctor` (`id_doctor`,`hari_dalam_minggu`,`waktu_mulai`);

--
-- Indexes for table `level_user`
--
ALTER TABLE `level_user`
  ADD PRIMARY KEY (`id_level_user`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`id_profile`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD UNIQUE KEY `no_telepon` (`no_telepon`),
  ADD KEY `id_divisi` (`id_divisi`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id_service`),
  ADD UNIQUE KEY `nama_layanan` (`nama_layanan`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `status_valid`
--
ALTER TABLE `status_valid`
  ADD PRIMARY KEY (`id_status_valid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_profile` (`id_profile`),
  ADD KEY `id_level_user` (`id_level_user`),
  ADD KEY `id_status_valid` (`id_status_valid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id_appointment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id_doctor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  MODIFY `id_schedule` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `id_profile` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id_service` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`id_patient`) REFERENCES `users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctors` (`id_doctor`) ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`id_service`) REFERENCES `services` (`id_service`) ON UPDATE CASCADE;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  ADD CONSTRAINT `doctor_schedules_ibfk_1` FOREIGN KEY (`id_doctor`) REFERENCES `doctors` (`id_doctor`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profile`
--
ALTER TABLE `profile`
  ADD CONSTRAINT `profile_ibfk_1` FOREIGN KEY (`id_divisi`) REFERENCES `divisi` (`id_divisi`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_profile`) REFERENCES `profile` (`id_profile`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`id_level_user`) REFERENCES `level_user` (`id_level_user`),
  ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`id_status_valid`) REFERENCES `status_valid` (`id_status_valid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
