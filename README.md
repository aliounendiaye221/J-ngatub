# Jàngatub — Plateforme Éducative du Sénégal

> SaaS éducatif pour les élèves sénégalais préparant le BFEM et le BAC.
> Accès gratuit aux épreuves et corrigés PDF + fonctionnalités Premium avancées.

## Stack Technique

| Technologie | Rôle |
|---|---|
| Next.js 14 (App Router) | Framework fullstack |
| TypeScript | Typage statique |
| TailwindCSS + tailwindcss-animate | UI/UX responsive |
| Prisma + SQLite | ORM + base de données |
| NextAuth v4 | Authentification (Google + Email Magic Link) |
| Zod | Validation des données |
| Lucide React | Icônes |
| OpenAI API | Explications IA (optionnel, fallback mock) |

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── docs/page.tsx               # Bibliothèque de documents
│   ├── doc/[id]/page.tsx           # Détail document + viewer PDF
│   ├── doc/[id]/explain/page.tsx   # Explication IA
│   ├── quiz/page.tsx               # Liste des quiz
│   ├── quiz/[id]/page.tsx          # Quiz interactif
│   ├── download/page.tsx           # Packs de téléchargement
│   ├── certificates/page.tsx       # Badges et Certificats
│   ├── support/page.tsx            # Support prioritaire
│   ├── profile/dashboard/page.tsx  # Dashboard de progression
│   ├── pricing/page.tsx            # Tarification Premium
│   ├── favorites/page.tsx          # Favoris utilisateur
│   └── api/                        # Routes API
├── components/                     # Composants React
├── lib/                            # Utilitaires (auth, prisma, validations)
├── middleware.ts                    # Protection routes premium/admin
└── types/                          # Déclarations TypeScript
```

## Fonctionnalités

### Gratuit
- Bibliothèque PDF (BFEM + BAC, sujets + corrigés)
- Recherche et filtres (niveau, matière, année)
- Favoris personnels
- Interface responsive mobile/desktop

### Premium
- Quiz interactifs chronométrés avec explications
- Dashboard de progression avec statistiques par matière
- Explications IA sur les documents
- Packs de téléchargement groupés
- Badges et certificats de réussite
- Support prioritaire (tickets, réponse sous 24h)

## Installation

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## Variables d'environnement

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
OPENAI_API_KEY=""
```

## Déploiement

Compatible Vercel Free Tier. Build : `npm run build`
