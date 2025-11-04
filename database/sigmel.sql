-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 31-10-2025 a las 00:48:58
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
 /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
 /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 /*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sigmel`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiales`
--

CREATE TABLE `materiales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `estado` enum("disponible","reservado","prestado") DEFAULT "disponible",
  `categoria` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materiales`
--

INSERT INTO `materiales` (`id`, `nombre`, `cantidad`, `imagen`, `estado`, `categoria`) VALUES
(1, "Protoboard", 10, "1756866981956-715626902.jpg", "disponible", "Elementos pasivos"),
(2, "Multimetro", 9, "1756868853390-927249881.jpg", "disponible", "Instrumentos de medición"),
(3, "Osciloscopio 200 MHz", 6, "1759705345507-908305968.jpg", "disponible", "Instrumentos de medición"),
(4, "Puntas para Multímetro", 12, "1759706134404-765826566.jpg", "disponible", "Elementos pasivos"),
(5, "LED 5 mm Rojo", 15, "1761098439535-482691607.jpg", "disponible", "Elementos activos");

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamos`
--

CREATE TABLE `prestamos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha_prestamo` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum("reservado","prestado","devuelto") DEFAULT "reservado"
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestamos`
--

INSERT INTO `prestamos` (`id`, `usuario_id`, `material_id`, `cantidad`, `fecha_prestamo`, `estado`) VALUES
(1, 2, 2, 1, "2025-09-29 03:36:31", "devuelto"),
(2, 2, 2, 1, "2025-09-29 03:36:32", "devuelto"),
(3, 2, 1, 1, "2025-09-29 03:36:32", "devuelto"),
(4, 2, 1, 1, "2025-09-29 03:36:32", "devuelto"),
(5, 5, 2, 1, "2025-09-29 03:36:46", "devuelto"),
(6, 5, 2, 1, "2025-09-29 03:36:46", "devuelto"),
(7, 5, 1, 1, "2025-09-29 03:36:46", "devuelto"),
(8, 5, 1, 1, "2025-09-29 03:36:46", "devuelto"),
(9, 2, 2, 1, "2025-09-29 06:52:38", "devuelto"),
(10, 2, 1, 1, "2025-09-29 06:52:38", "devuelto"),
(11, 2, 1, 1, "2025-09-29 06:52:38", "devuelto"),
(12, 5, 2, 1, "2025-09-30 01:18:28", "devuelto"),
(13, 5, 2, 1, "2025-10-05 22:59:10", "devuelto"),
(14, 5, 2, 1, "2025-10-05 22:59:10", "devuelto"),
(15, 5, 1, 1, "2025-10-05 22:59:10", "devuelto"),
(16, 5, 1, 1, "2025-10-05 22:59:10", "devuelto"),
(17, 2, 3, 1, "2025-10-05 23:20:31", "devuelto"),
(18, 2, 4, 1, "2025-10-05 23:20:31", "devuelto"),
(19, 2, 2, 1, "2025-10-05 23:20:31", "devuelto"),
(20, 2, 4, 1, "2025-10-06 18:12:14", "devuelto"),
(21, 2, 1, 1, "2025-10-06 18:12:14", "devuelto"),
(22, 5, 3, 1, "2025-10-06 18:13:38", "devuelto"),
(23, 5, 2, 1, "2025-10-06 18:13:38", "devuelto"),
(24, 2, 4, 1, "2025-10-07 17:05:42", "devuelto"),
(25, 2, 2, 1, "2025-10-07 17:05:42", "devuelto"),
(26, 2, 1, 1, "2025-10-07 17:05:42", "devuelto"),
(27, 2, 1, 1, "2025-10-07 17:05:42", "devuelto"),
(28, 2, 3, 1, "2025-10-07 17:05:42", "devuelto"),
(29, 2, 4, 1, "2025-10-07 17:11:22", "devuelto"),
(30, 2, 4, 1, "2025-10-07 17:11:22", "devuelto"),
(31, 2, 4, 1, "2025-10-09 22:20:52", "devuelto"),
(32, 2, 4, 1, "2025-10-09 22:20:53", "devuelto"),
(33, 2, 3, 1, "2025-10-09 22:20:53", "devuelto"),
(34, 2, 1, 1, "2025-10-09 22:20:53", "devuelto"),
(35, 2, 2, 1, "2025-10-09 22:20:53", "devuelto"),
(36, 2, 2, 1, "2025-10-09 22:20:53", "devuelto"),
(37, 2, 4, 1, "2025-10-22 01:07:31", "devuelto"),
(38, 2, 3, 1, "2025-10-22 01:07:31", "devuelto"),
(39, 2, 2, 1, "2025-10-22 01:07:31", "devuelto"),
(40, 2, 5, 1, "2025-10-22 02:23:05", "devuelto"),
(41, 5, 5, 2, "2025-10-22 02:37:21", "devuelto"),
(42, 5, 4, 1, "2025-10-22 02:37:21", "devuelto"),
(43, 5, 2, 1, "2025-10-22 02:37:21", "devuelto"),
(44, 2, 2, 2, "2025-10-22 02:47:34", "devuelto"),
(45, 2, 1, 1, "2025-10-22 02:47:34", "devuelto"),
(46, 2, 4, 1, "2025-10-22 02:47:34", "devuelto"),
(47, 5, 3, 2, "2025-10-22 02:48:31", "devuelto"),
(48, 5, 5, 1, "2025-10-22 02:48:31", "devuelto"),
(49, 5, 4, 1, "2025-10-22 02:48:31", "devuelto"),
(50, 5, 1, 1, "2025-10-22 02:48:31", "devuelto"),
(51, 5, 5, 1, "2025-10-29 04:18:16", "devuelto"),
(52, 5, 4, 1, "2025-10-29 04:18:16", "devuelto"),
(53, 2, 5, 1, "2025-10-29 14:17:42", "devuelto"),
(54, 2, 3, 1, "2025-10-29 14:17:42", "devuelto"),
(55, 2, 1, 1, "2025-10-29 14:17:42", "devuelto"),
(56, 2, 2, 2, "2025-10-29 19:51:42", "devuelto"),
(57, 2, 3, 1, "2025-10-29 19:51:42", "devuelto"),
(58, 2, 5, 5, "2025-10-29 19:51:42", "devuelto"),
(59, 2, 5, 5, "2025-10-30 21:40:36", "devuelto"),
(60, 2, 3, 1, "2025-10-30 21:40:36", "devuelto"),
(61, 2, 1, 2, "2025-10-30 21:40:36", "devuelto"),
(62, 2, 2, 1, "2025-10-30 21:40:36", "devuelto"),
(63, 2, 4, 1, "2025-10-30 21:40:36", "devuelto"),
(64, 5, 5, 4, "2025-10-30 21:41:03", "devuelto"),
(65, 5, 4, 3, "2025-10-30 21:41:03", "devuelto"),
(66, 5, 3, 2, "2025-10-30 21:41:03", "devuelto"),
(67, 5, 2, 1, "2025-10-30 21:41:03", "devuelto"),
(68, 5, 1, 1, "2025-10-30 21:41:03", "devuelto");

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum("admin","usuario") NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `matricula`, `nombre`, `password`, `rol`) VALUES
(1, "210300554", "Ronaldt Josue Leal Lopez", "1234", "admin"),
(2, "210300544", "Eric Joan Santos Nanny", "1234", "usuario"),
(5, "210300553", "Omar Rodrigo Hernandez Pineda", "1234", "usuario");

-- --------------------------------------------------------

ALTER TABLE `materiales`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `material_id` (`material_id`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matricula` (`matricula`);

ALTER TABLE `materiales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `prestamos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `prestamos`
  ADD CONSTRAINT `prestamos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
 /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
 /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
