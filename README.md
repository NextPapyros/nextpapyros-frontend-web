# 🧾 NextPapyros - Frontend Web

![Logo](public/logo.png)

**NextPapyros** es un sistema web diseñado para optimizar la gestión integral de papelerías.  
Permite a **administradores** y **empleados** manejar inventarios, registrar ventas, generar reportes y mantener una trazabilidad completa del negocio en tiempo real.

---

## 🚀 Tecnologías principales

- ⚙️ **Framework:** [Vue 3](https://vuejs.org/)
- ⚡ **Empaquetador:** [Vite](https://vitejs.dev/)
- 🧩 **Lenguaje backend:** [C# con ASP.NET](https://dotnet.microsoft.com/en-us/apps/aspnet)
- 🧠 **Gestor de dependencias:** [pnpm](https://pnpm.io/)
- 🟢 **Versión de Node:** 22.x

---

## ⚙️ Instalación y ejecución

Asegúrate de tener instalada la versión correcta de Node (22 o superior) y **pnpm**.

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev
```

La aplicación se ejecutará por defecto en
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Variables de entorno

Antes de ejecutar el proyecto, crea un archivo `.env` en la raíz con las siguientes variables (sin valores sensibles):

```bash
VITE_API_URL=       # URL base del backend ASP.NET
```

---

## 🧑‍🏫 Sobre el proyecto académico

Este proyecto fue desarrollado como parte del curso de **Diseño de Sistemas de Información** en el ITM, con el objetivo de aplicar buenas prácticas de desarrollo frontend, consumo de APIs y diseño de interfaces intuitivas.
El sistema **NextPapyros** busca digitalizar la gestión tradicional de las papelerías, promoviendo la eficiencia, trazabilidad y seguridad en los procesos administrativos y de ventas.

---

## 📋 Reglas de Desarrollo

- **Arquitectura Obligatoria:** Toda el desarrollo debe seguir estrictamente la arquitectura definida en [`ARCHITECTURE.md`](ARCHITECTURE.md). Cualquier cambio o adición debe ser compatible con esta estructura.

---

## � Licencia

Este proyecto se distribuye bajo licencia **MIT**, lo que permite su uso, modificación y distribución libre siempre que se mantengan los créditos originales.

---

> _Desarrollado con ❤️ usando Vue + Vite_

---
