# 🏆 Quiniela Pokemachos — Mundial 2026

La quiniela oficial de los **Pokemachos Y El Mojado** para el Mundial 2026.
12 compas, un bote, cero morosos permitidos.

> "Hecho con cariño para los Pokemachos · No se aceptan morosos · Pago en pesos, no en FIFA points."

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Vercel Postgres** + **Prisma**
- **NextAuth** (credenciales email/password)
- **Tailwind CSS** + diseño custom (Bungee + Newsreader + Space Mono)
- Hosting: **Vercel** (gratis)

## Features

- Registro y login con email/password
- Predicciones por partido (marcador exacto + resultado)
- Predicciones especiales (campeón, goleador, mejor jugador, etc.)
- Tabla de posiciones automática con desempate por marcadores exactos
- Panel de admin para cargar partidos, resultados y confirmar pagos
- Lock automático 1h antes de cada partido
- Reparto del bote: 60% / 25% / 15%

## Deploy paso a paso

### 1. Subir el código a GitHub

```bash
cd quiniela
git init
git add .
git commit -m "initial commit"
gh repo create quiniela-mundial-2026 --private --source=. --push
# o crea el repo manualmente en github.com y haz git push
```

### 2. Importar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new)
2. Selecciona tu repo `quiniela-mundial-2026`
3. Framework: **Next.js** (auto-detectado)
4. **NO hagas deploy todavía** — primero agrega la base de datos

### 3. Crear la base de datos Vercel Postgres

1. En el proyecto de Vercel → tab **Storage** → **Create Database**
2. Elige **Postgres** → click **Continue**
3. Nombre: `quiniela-db` → región más cercana (Washington D.C. para LATAM)
4. Click **Create** → en la siguiente pantalla, **Connect Project**
5. Vercel agregará automáticamente las variables de entorno:
   - `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, etc.

### 4. Configurar variables adicionales

En **Settings → Environment Variables** agrega:

```
NEXTAUTH_SECRET   = (genera con: openssl rand -base64 32)
NEXTAUTH_URL      = https://tu-app.vercel.app  (lo configuras después del primer deploy)
ADMIN_EMAIL       = tu@email.com  (el email que será admin al registrarse)
```

### 5. Deploy

Click **Deploy** en Vercel. La primera build correrá `prisma generate`.

### 6. Inicializar el schema de la base de datos

Después del primer deploy:

```bash
# Clona localmente y crea .env con las vars de Vercel
vercel env pull .env.local

# Empuja el schema a la DB
npx prisma db push

# (Opcional) carga 8 partidos de muestra para probar
node scripts/seed.mjs
```

### 7. Registrarte como admin

1. Abre tu app: `https://tu-app.vercel.app/register`
2. Regístrate con el mismo email que pusiste en `ADMIN_EMAIL`
3. Verás la tab **Admin** en la barra superior

### 8. Configurar el torneo

En `/admin`:

- **Partidos:** carga los 104 partidos del Mundial cuando salga el calendario oficial (sorteo: 5 dic 2025). El seed te da 8 de muestra para probar.
- **Usuarios:** marca como "pagado" a quienes ya te depositaron los $500 (esto los suma al bote).
- **Resultados:** después de cada partido, captura el marcador y la app calificará automáticamente.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
# llena .env.local con los valores
npx prisma db push
npm run dev
```

## Estructura

```
quiniela/
├── app/
│   ├── (app)/              # Páginas autenticadas
│   │   ├── dashboard/
│   │   ├── predictions/
│   │   ├── leaderboard/
│   │   └── admin/
│   ├── api/                # API routes
│   ├── login/
│   └── register/
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # DB client
│   └── scoring.ts          # Reglas de puntuación
├── prisma/
│   └── schema.prisma       # Modelos de la DB
└── scripts/
    └── seed.mjs            # Carga partidos de muestra
```

## Reglas de puntuación

| Etapa | Marcador exacto | Resultado / Avance |
|---|---|---|
| Grupos | 5 pts | 3 pts |
| Eliminatorias | 10 pts | 6 pts |

| Predicción especial | Puntos |
|---|---|
| Campeón | 25 |
| Subcampeón | 15 |
| Tercer lugar | 10 |
| Goleador | 15 |
| Mejor jugador | 10 |
| Selección revelación | 10 |

- **Deadline:** 1 hora antes del partido. Tardío = 0 pts.
- **Especiales:** se bloquean al iniciar el primer partido del torneo.
- **Desempate:** más marcadores exactos. Empate residual → se reparte el premio.

## Costo

- Vercel Hobby: **gratis** (suficiente para 5-15 usuarios)
- Vercel Postgres Free tier: **gratis** (60h compute/mes, suficiente)
- Dominio custom (opcional): ~$10 USD/año

## Próximos pasos sugeridos

- [ ] Conectar dominio custom (`quinielamundial.mx`)
- [ ] Enviar email cuando se cierran predicciones (Resend integration)
- [ ] Exportar resultados a CSV al final del torneo
