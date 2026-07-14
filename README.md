# 💧 Tecnihidros

Sistema de gestión para **Tecnihidros**, diseñado para administrar el proceso de mantenimiento y reparación de maquinaria industrial, permitiendo gestionar clientes, máquinas, órdenes de servicio, repuestos, facturación y garantías de forma organizada y eficiente.

---

## 📖 Descripción

Este proyecto tiene como objetivo desarrollar una aplicación web que facilite la administración de la información relacionada con los servicios técnicos ofrecidos por Tecnihidros.

El sistema permitirá registrar clientes y sus máquinas, crear órdenes de servicio, asignar empleados responsables de las reparaciones, controlar los repuestos utilizados, generar facturas y administrar las garantías asociadas a cada servicio realizado.

La arquitectura del proyecto está dividida en tres componentes principales:

- **Frontend:** Interfaz desarrollada con HTML, CSS y JavaScript.
- **Backend:** API desarrollada con Next.js encargada de la lógica del negocio y la comunicación con la base de datos.
- **Base de datos:** MySQL ejecutándose mediante Docker para facilitar la instalación y el trabajo colaborativo.

---

# 🛠 Tecnologías utilizadas

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura de la interfaz |
| CSS3 | Diseño y estilos |
| JavaScript | Lógica del frontend |
| Next.js | Backend y API |
| MySQL 8 | Base de datos relacional |
| Docker | Contenedorización de MySQL |
| phpMyAdmin | Administración de la base de datos |
| Git & GitHub | Control de versiones |

---

# 📂 Estructura del proyecto

```text
tecnihidros-app/
│
├── backend/               # Backend desarrollado en Next.js
│
├── frontend/              # HTML, CSS y JavaScript
│
├── database/              # Scripts SQL
│   └── init.sql
│
├── docker-compose.yml     # Configuración de Docker
│
├── .gitignore
│
└── README.md
```

---

# ⚙️ Requisitos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Git
- Node.js (versión 18 o superior)
- Docker Desktop
- Visual Studio Code (opcional)

---

# 🚀 Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/USUARIO/tecnihidros-app.git
```

Entrar al proyecto

```bash
cd tecnihidros-app
```

---

## 2. Iniciar la base de datos

Desde la raíz del proyecto ejecutar:

```bash
docker compose up -d
```

Docker descargará automáticamente:

- MySQL 8
- phpMyAdmin

---

## 3. Ingresar a phpMyAdmin

Abrir en el navegador:

```
http://localhost:8080
```

Credenciales:

| Parámetro | Valor |
|-----------|-------|
| Servidor | tecnihidros-db |
| Usuario | root |
| Contraseña | root_password_123 |

---

## 4. Ejecutar el backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor:

```bash
npm run dev
```

---

## 5. Ejecutar el frontend

Abrir los archivos HTML desde la carpeta `frontend`.

---

# 🗄 Base de datos

La base de datos se encuentra completamente definida mediante el archivo:

```text
database/init.sql
```

Este archivo contiene la estructura de todas las tablas, relaciones y restricciones necesarias para el funcionamiento del sistema.

Al iniciar Docker por primera vez, MySQL ejecutará automáticamente este script para crear la base de datos.

---

# 📋 Funcionalidades principales

- Gestión de clientes.
- Registro de maquinaria.
- Administración de órdenes de servicio.
- Asignación de empleados.
- Control de repuestos.
- Registro de fallas.
- Generación de facturas.
- Administración de garantías.

---

# 👥 Equipo de desarrollo

Proyecto desarrollado por estudiantes de Ingeniería de Sistemas.

- Juan Sebastian Diaz Peña 20232020071
- Nicole María Daza Villamil 20232020113

---

# 📌 Estado del proyecto

🚧 En desarrollo

Actualmente el proyecto se encuentra en proceso de construcción y puede presentar cambios en su estructura y funcionalidades.

---

# 📄 Licencia

Este proyecto fue desarrollado con fines académicos.