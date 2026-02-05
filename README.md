# 🚀 E-commerce Recommender System (Tafa Business)

Plateforme E-commerce complète structurée autour d'une **Double Interface** (Admin/Client) et d'un écosystème d'**Agents IA Autonomes**.

---

## 🏗️ Architecture du Projet

Le système repose sur une architecture micro-services divisée en 3 modules interconnectés :

| Composant | Dossier | Port | Description |
|-----------|---------|------|-------------|
| **🧠 Backend (API)** | `backend/` | `8000` | Moteur central (FastAPI + SQLite). Il orchestre les agents IA et gère la persistance des données. |
| **🏢 Admin Dashboard** | `frontend-admin/` | `5173` | **Interface d'Administration**. Permet le pilotage des agents, la validation du sourcing produit et la surveillance concurrentielle. |
| **🛍️ Marketplace** | `Marketplace/` | `3001` | **Vitrine E-commerce**. Interface publique destinée aux clients finaux (Next.js), affichant les produits validés. |

---

## 🤖 Écosystème d'Agents IA

Le projet intègre une suite d'agents intelligents fonctionnant en autonomie :

1.  **🕵️ Agent Sourcing** : Analyse l'historique des ventes, identifie des produits similaires sur les plateformes fournisseurs (Jumia/Alibaba) et valide la demande via Google Trends.
2.  **💰 Price Watch Agent** : Surveille les tarifs concurrents et génère des alertes en temps réel.
3.  **🤝 Deal Hunter** : Détecte les opportunités d'arbitrage (écarts de prix) entre les fournisseurs internationaux (Alibaba) et le marché local.
4.  **📣 Marketing Agent** : Génère automatiquement des campagnes publicitaires (Facebook/Instagram) et des contenus promotionnels.
5.  **📝 SEO Agent** : Optimise le référencement naturel des fiches produits (titres, descriptions).

---

## 🚀 Installation & Démarrage

### Prérequis Technique
*   Python 3.10+
*   Node.js 18+

### 1. Démarrage du Backend
```bash
cd backend
python api.py
# ou
py api.py
```
> API accessible sur : http://localhost:8000

### 2. Démarrage du Dashboard Admin
```bash
cd frontend-admin
npm run dev
```
> Interface Administration accessible sur : http://localhost:5173

### 3. Démarrage de la Marketplace
```bash
cd Marketplace
npm run dev
```
> Vitrine Client accessible sur : http://localhost:3001

---

## 📂 Organisation des Ressources

*   **`_TRASH/`** : Archives et fichiers obsolètes.
*   **`data/`** : Entrepôt de données (CSV sources, exports, historiques).
*   **`docs/`** : Documentation technique approfondie.
*   **`backend/agents/`** : Code source des logiques IA.

---

## 🛠️ Stack Technique

*   **Backend** : Python, FastAPI, SQLite, OpenAI GPT-4o, Pandas.
*   **Admin Frontend** : React, Vite, TailwindCSS.
*   **Marketplace Frontend** : Next.js, TailwindCSS.

---

**Version** : 3.0 (Architecture Micro-Services)
**Auteur** : Mohamadou Moustapha GAYE
