# AVIVA Worship App

Cancionero digital para músicos de AVIVA Worship. Una aplicación web diseñada para facilitar el acceso a letras y acordes de canciones, con funcionalidad de transposición de tonalidades en tiempo real.

![AVIVA Worship](./components/Logo%20white.svg)

## ✨ Características

### Para Músicos (Usuarios)
- 🎵 **Cancionero completo** - Accede a todas las canciones con letra y acordes
- 🎸 **Diagramas de acordes** - Visualiza cómo tocar cada acorde en la guitarra
- 🔄 **Transposición de tonalidades** - Cambia la tonalidad de cualquier canción instantáneamente
- ❤️ **Favoritos** - Guarda tus canciones preferidas
- 📋 **Listas personalizadas** - Crea listas para tus reuniones
- 👥 **Listas compartidas** - Comparte listas con otros músicos de tu casa iglesia
- 📱 **Compartir por WhatsApp** - Envía letras y acordes fácilmente
- 🎧 **Links de audio** - Accede a Spotify, YouTube o audio de cada canción

### Para Administradores
- ➕ **Gestión de canciones** - Agrega, edita y elimina canciones
- ⭐ **Destacados** - Selecciona qué canciones mostrar en la página principal
- 👤 **Gestión de usuarios** - Ve todos los usuarios y asigna roles

## 🚀 Instalación

### Requisitos previos
- Node.js 18+
- npm o yarn

### Pasos de instalación

1. **Clona el repositorio e instala dependencias**
   ```bash
   cd webapp
   npm install
   ```

2. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` con tus credenciales:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="tu-secreto-seguro"
   
   # Configura OAuth de Google en https://console.cloud.google.com
   GOOGLE_CLIENT_ID="tu-client-id"
   GOOGLE_CLIENT_SECRET="tu-client-secret"
   ```

3. **Configura la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed  # Opcional: carga canciones de ejemplo
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 🔐 Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs y servicios" > "Credenciales"
4. Crea credenciales OAuth 2.0
5. Configura los orígenes autorizados:
   - `http://localhost:3000` (desarrollo)
   - Tu dominio de producción
6. Configura las URIs de redirección:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-dominio.com/api/auth/callback/google` (producción)

## 📝 Formato de acordes

Las letras con acordes usan el formato de corchetes:

```
[G]Así es tu a[Em]mor
[C]Tan grande y [D]fiel
```

Los acordes soportados incluyen:
- Mayores: C, D, E, F, G, A, B
- Menores: Cm, Dm, Em, Fm, Gm, Am, Bm
- Séptimas: C7, D7, E7, F7, G7, A7, B7
- Sus2, Sus4, add9, maj7, m7
- Con sostenidos y bemoles

## 🛠️ Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Compilar para producción
npm run start      # Iniciar en producción
npm run lint       # Verificar código
npm run db:push    # Sincronizar schema con BD
npm run db:seed    # Cargar datos de ejemplo
npm run db:studio  # Abrir Prisma Studio
```

## 📱 Optimizado para móvil

La aplicación está diseñada mobile-first con:
- Navegación inferior para fácil acceso
- Diseño responsive
- Soporte para safe areas (notch)
- Gestos táctiles optimizados

## 🎨 Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Iconos**: Lucide React

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para AVIVA Worship.

---

Desarrollado con ❤️ para la iglesia AVIVA
