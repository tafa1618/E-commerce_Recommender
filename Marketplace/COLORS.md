# Variables de Couleurs - Tafa Business

Ce document liste toutes les variables de couleurs utilisées dans le marketplace.

## Couleurs Principales

### Bleu (Primary)
- `--color-primary-dark`: `#172554` - Bleu foncé pour headers/footers
- `--color-primary-medium`: `#1e40af` - Bleu moyen
- `--color-primary-light`: `#3b82f6` - Bleu clair

## Couleurs d'Accent

### Jaune (Accent)
- `--color-accent-yellow`: `#facc15` - Jaune pour boutons CTA
- `--color-accent-yellow-dark`: `#eab308` - Jaune foncé pour hover

## Couleurs de Texte

- `--color-text-on-dark`: `#ffffff` - Texte blanc sur fond sombre
- `--color-text-on-light`: `#111827` - Texte noir sur fond clair
- `--color-text-gray`: `#6b7280` - Texte gris

## Couleurs de Fond

- `--color-bg-white`: `#ffffff` - Fond blanc
- `--color-bg-gray-light`: `#f9fafb` - Fond gris clair
- `--color-bg-gray`: `#f3f4f6` - Fond gris

## Couleurs de Bordure

- `--color-border-gray`: `#e5e7eb` - Bordure grise
- `--color-border-gray-dark`: `#9ca3af` - Bordure grise foncée

## Utilisation

Toutes ces variables sont définies dans `app/globals.css` et peuvent être utilisées avec `var(--variable-name)`.

### Exemple

```css
.header {
  background-color: var(--color-primary-dark);
  color: var(--color-text-on-dark);
}

.button {
  background-color: var(--color-accent-yellow);
  color: var(--color-primary-dark);
}
```

