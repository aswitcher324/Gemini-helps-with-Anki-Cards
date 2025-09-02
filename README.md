<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1 align="center">Generador de Tarjetas Anki con IA</h1>
  <p align="center">
    Una herramienta inteligente para crear tarjetas de estudio (flashcards) detalladas y personalizadas al instante.
    <br />
    <a href="https://aistudio.google.com/app/drive/16Wdr540ny0v5XPBYAvQ35UJf0Qz_KL4h" target="_blank"><strong>Ver en AI Studio »</strong></a>
  </p>
</div>

---

## 🌟 Sobre el Proyecto

Este generador de tarjetas de estudio utiliza la potencia de la API de Gemini para transformar cualquier concepto o tema en una tarjeta de estudio de estilo Anki. La aplicación genera una pregunta, una respuesta detallada y preguntas relacionadas para profundizar en el aprendizaje.

### ✨ Características

- **Generación Instantánea:** Crea tarjetas de estudio a partir de una sola palabra o idea.
- **Contenido Detallado:** Genera una pregunta clara, una respuesta completa y una lista de temas relacionados.
- **Interfaz Limpia:** Una interfaz de usuario sencilla y atractiva para una experiencia sin distracciones.
- **Fácil de Usar:** Simplemente introduce un tema y obtén tu tarjeta de estudio al instante.

### 💻 Tecnologías Utilizadas

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) (para los iconos)

---

## 🚀 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### ✅ Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Un API Key de Gemini. Puedes obtenerla en [Google AI Studio](https://aistudio.google.com/app/apikey).

### 🛠️ Instalación

1.  **Clona el repositorio:**
    ```sh
    git clone https://github.com/tu_usuario/tu_repositorio.git
    cd tu_repositorio
    ```

2.  **Instala las dependencias:**
    ```sh
    npm install
    ```

3.  **Configura tus variables de entorno:**
    - Crea un archivo `.env.local` en la raíz del proyecto.
    - Copia el contenido de `.env.example` y reemplaza `YOUR_API_KEY_HERE` con tu API Key de Gemini.
    ```
    GEMINI_API_KEY=tu_api_key_aqui
    ```

4.  **Ejecuta la aplicación:**
    ```sh
    npm run dev
    ```
    Abre [http://localhost:5173](http://localhost:5173) (o el puerto que indique Vite) en tu navegador para ver la aplicación.

---
