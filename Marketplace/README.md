# Marketplace - Tafa Business

Marketplace moderne construite avec Next.js 14, TypeScript et Tailwind CSS.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3001](http://localhost:3001) dans votre navigateur.

Le marketplace tourne sur le port **3001** pour éviter les conflits avec le frontend React (port 3000).

### Build de production

```bash
npm run build
npm start
```

## 📁 Structure du projet

```
Marketplace/
├── app/              # App Router (Next.js 14)
│   ├── layout.tsx   # Layout principal
│   ├── page.tsx     # Page d'accueil
│   └── globals.css  # Styles globaux
├── components/       # Composants React
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Categories.tsx
│   ├── Products.tsx
│   ├── Testimonials.tsx
│   ├── CTA.tsx
│   └── Footer.tsx
└── public/          # Assets statiques
```

## 🎨 Design

- **Framework**: Next.js 14 avec App Router
- **Styling**: Tailwind CSS
- **Approche**: Mobile-first
- **Espacements**: Généreux et aérés
- **Couleurs**: Palette primary (bleu) avec variations

## 📱 Responsive

Le design est entièrement responsive avec des breakpoints :
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔧 Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- React 18

