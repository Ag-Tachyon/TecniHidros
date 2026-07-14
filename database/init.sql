-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: tecnihidros-db
-- Tiempo de generación: 14-07-2026 a las 02:34:43
-- Versión del servidor: 8.0.46
-- Versión de PHP: 8.3.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tecnihidros_bd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `codCliente` int NOT NULL,
  `nombreCliente` varchar(150) NOT NULL,
  `documentoCliente` varchar(20) NOT NULL,
  `direccionCliente` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `codEmpleado` int NOT NULL,
  `nombreEmpleado` varchar(150) NOT NULL,
  `especializacionEmp` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `codFactura` int NOT NULL,
  `valorRepuestosUsados` decimal(10,2) NOT NULL,
  `fecha` datetime NOT NULL,
  `valTotal` decimal(10,2) NOT NULL,
  `cliente_codCliente` int NOT NULL,
  `ordenServicio_codServicio` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fallasMaquina`
--

CREATE TABLE `fallasMaquina` (
  `codFalla` int NOT NULL,
  `ordenServicio_codServicio` int NOT NULL,
  `descripFalla` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `garantia`
--

CREATE TABLE `garantia` (
  `codGarantia` int NOT NULL,
  `fechaVencimiento` date NOT NULL,
  `estadoGarantia` varchar(50) NOT NULL,
  `condicion` text,
  `factura_codFactura` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `maquina`
--

CREATE TABLE `maquina` (
  `codMaquina` int NOT NULL,
  `nombreMaquina` varchar(100) NOT NULL,
  `numSerie` varchar(50) NOT NULL,
  `cliente_codCliente` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenServicio`
--

CREATE TABLE `ordenServicio` (
  `codServicio` int NOT NULL,
  `fechaIngresoMaquina` datetime NOT NULL,
  `estadoReparacion` varchar(50) NOT NULL,
  `diagnosticoReparacion` text,
  `empleado_codEmpleado` int NOT NULL,
  `maquina_codMaquina` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuesto`
--

CREATE TABLE `repuesto` (
  `codRepuesto` int NOT NULL,
  `nombreRepuesto` varchar(100) NOT NULL,
  `valorVentaRepuesto` decimal(10,2) NOT NULL,
  `cantStock` int NOT NULL,
  `descripRepuesto` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telefonosCliente`
--

CREATE TABLE `telefonosCliente` (
  `codTelefono` int NOT NULL,
  `cliente_codCliente` int NOT NULL,
  `telefono` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usa`
--

CREATE TABLE `usa` (
  `repuesto_codRepuesto` int NOT NULL,
  `ordenServicio_codServicio` int NOT NULL,
  `cantRepuestosUsados` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`codCliente`),
  ADD UNIQUE KEY `documentoCliente` (`documentoCliente`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`codEmpleado`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`codFactura`),
  ADD UNIQUE KEY `ordenServicio_codServicio` (`ordenServicio_codServicio`),
  ADD KEY `cliente_codCliente` (`cliente_codCliente`);

--
-- Indices de la tabla `fallasMaquina`
--
ALTER TABLE `fallasMaquina`
  ADD PRIMARY KEY (`codFalla`,`ordenServicio_codServicio`),
  ADD KEY `ordenServicio_codServicio` (`ordenServicio_codServicio`);

--
-- Indices de la tabla `garantia`
--
ALTER TABLE `garantia`
  ADD PRIMARY KEY (`codGarantia`),
  ADD UNIQUE KEY `factura_codFactura` (`factura_codFactura`);

--
-- Indices de la tabla `maquina`
--
ALTER TABLE `maquina`
  ADD PRIMARY KEY (`codMaquina`),
  ADD UNIQUE KEY `numSerie` (`numSerie`),
  ADD KEY `cliente_codCliente` (`cliente_codCliente`);

--
-- Indices de la tabla `ordenServicio`
--
ALTER TABLE `ordenServicio`
  ADD PRIMARY KEY (`codServicio`),
  ADD KEY `empleado_codEmpleado` (`empleado_codEmpleado`),
  ADD KEY `maquina_codMaquina` (`maquina_codMaquina`);

--
-- Indices de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  ADD PRIMARY KEY (`codRepuesto`);

--
-- Indices de la tabla `telefonosCliente`
--
ALTER TABLE `telefonosCliente`
  ADD PRIMARY KEY (`codTelefono`,`cliente_codCliente`),
  ADD KEY `cliente_codCliente` (`cliente_codCliente`);

--
-- Indices de la tabla `usa`
--
ALTER TABLE `usa`
  ADD PRIMARY KEY (`repuesto_codRepuesto`,`ordenServicio_codServicio`),
  ADD KEY `ordenServicio_codServicio` (`ordenServicio_codServicio`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `codCliente` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `codEmpleado` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `codFactura` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `fallasMaquina`
--
ALTER TABLE `fallasMaquina`
  MODIFY `codFalla` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `garantia`
--
ALTER TABLE `garantia`
  MODIFY `codGarantia` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `maquina`
--
ALTER TABLE `maquina`
  MODIFY `codMaquina` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ordenServicio`
--
ALTER TABLE `ordenServicio`
  MODIFY `codServicio` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  MODIFY `codRepuesto` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `telefonosCliente`
--
ALTER TABLE `telefonosCliente`
  MODIFY `codTelefono` int NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`cliente_codCliente`) REFERENCES `cliente` (`codCliente`),
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`ordenServicio_codServicio`) REFERENCES `ordenServicio` (`codServicio`);

--
-- Filtros para la tabla `fallasMaquina`
--
ALTER TABLE `fallasMaquina`
  ADD CONSTRAINT `fallasMaquina_ibfk_1` FOREIGN KEY (`ordenServicio_codServicio`) REFERENCES `ordenServicio` (`codServicio`) ON DELETE CASCADE;

--
-- Filtros para la tabla `garantia`
--
ALTER TABLE `garantia`
  ADD CONSTRAINT `garantia_ibfk_1` FOREIGN KEY (`factura_codFactura`) REFERENCES `factura` (`codFactura`);

--
-- Filtros para la tabla `maquina`
--
ALTER TABLE `maquina`
  ADD CONSTRAINT `maquina_ibfk_1` FOREIGN KEY (`cliente_codCliente`) REFERENCES `cliente` (`codCliente`);

--
-- Filtros para la tabla `ordenServicio`
--
ALTER TABLE `ordenServicio`
  ADD CONSTRAINT `ordenServicio_ibfk_1` FOREIGN KEY (`empleado_codEmpleado`) REFERENCES `empleado` (`codEmpleado`),
  ADD CONSTRAINT `ordenServicio_ibfk_2` FOREIGN KEY (`maquina_codMaquina`) REFERENCES `maquina` (`codMaquina`);

--
-- Filtros para la tabla `telefonosCliente`
--
ALTER TABLE `telefonosCliente`
  ADD CONSTRAINT `telefonosCliente_ibfk_1` FOREIGN KEY (`cliente_codCliente`) REFERENCES `cliente` (`codCliente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usa`
--
ALTER TABLE `usa`
  ADD CONSTRAINT `usa_ibfk_1` FOREIGN KEY (`repuesto_codRepuesto`) REFERENCES `repuesto` (`codRepuesto`),
  ADD CONSTRAINT `usa_ibfk_2` FOREIGN KEY (`ordenServicio_codServicio`) REFERENCES `ordenServicio` (`codServicio`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
