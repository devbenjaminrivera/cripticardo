# Cripticardo 🖋️

Plataforma diaria de resolución de acertijos y crucigramas crípticos en español creada por **Daniel Fajardo**.

## Características

- 📅 **Un críptico diario:** Sincronizado a nivel mundial a la medianoche de Chile (`America/Santiago`).
- 🔄 **Rotación condicional:** Si hay pocos crípticos publicados, la lista se cicla de forma automática para que siempre haya un acertijo activo.
- 📖 **Guía interactiva de mecanismos:** 6 lecciones explicativas con ejemplos reales paso a paso (Doble definición, Anagramas, Palabras dentro de palabras, Homófonos, Palabras escondidas y Palabras en reversa).
- 💡 **Sistema de pistas progresivo:**
  - Pista 1: Revela cuál es la parte de la definición.
  - Pista 2: Revela una letra aleatoria en el tablero.
- 🗄️ **Archivo histórico:** Navega y resuelve crípticos de días anteriores.
- ⚙️ **Panel de administración:** Programación de nuevos crípticos con cálculo automático de fechas y previsualización en vivo.

## Tecnologías

- **Framework:** Next.js 16 (App Router) & React 19
- **Estilos:** Tailwind CSS v4 con paleta editorial clásica (parchment, ink, terracotta)
- **Base de datos:** Supabase (PostgreSQL con Row Level Security)
- **Iconografía:** Lucide React
- **Efectos:** Canvas Confetti

## Configuración local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/devbenjaminrivera/cripticardo.git
   cd cripticardo
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Copia el archivo `.env.example` como `.env.local` y agrega tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

4. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue en Vercel

1. Importa este repositorio en tu cuenta de [Vercel](https://vercel.com).
2. En la sección **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Haz clic en **Deploy**.
