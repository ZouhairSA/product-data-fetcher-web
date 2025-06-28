
# SynchroScale - Amazon Product Intelligence Agent

![SynchroScale Logo](/lovable-uploads/56a0b6ed-a0f9-4e25-ac92-96fb13a4391b.png)

## À propos de SynchroScale

SynchroScale est un **Agent E-commerce Intelligent** spécialisé dans l'analyse et la comparaison automatique de produits Amazon. Cette application révolutionnaire utilise l'intelligence artificielle pour identifier les meilleurs produits avec un système de scoring intelligent basé sur le prix, les évaluations et le nombre d'avis.

### 🚀 Fonctionnalités principales

- **🔍 Recherche intelligente** : Recherchez des produits sur Amazon avec détection automatique de la langue (français, arabe, anglais)
- **🏆 Scoring gagnant** : Algorithme intelligent qui calcule un score de performance pour chaque produit
- **📊 Analyse complète** : Prix, notes, nombre d'avis, badges Amazon
- **🌐 Multi-régions** : Support pour Amazon.com, Amazon.fr, Amazon.sa
- **📱 Interface moderne** : Design responsive avec vue grille et liste
- **🔗 Liens directs** : Accès direct aux produits Amazon en un clic
- **📄 Pagination** : Navigation fluide à travers de grandes quantités de données
- **📈 Statistiques** : Analyse des prix moyens, notes et tendances

### 🎯 Comment ça marche

1. **Saisissez votre recherche** : Tapez le nom du produit que vous cherchez
2. **IA analyse** : L'application détecte automatiquement la langue et sélectionne le bon Amazon
3. **Scraping intelligent** : Extraction des données produits avec algorithme de scoring
4. **Résultats classés** : Les produits sont triés par score de performance
5. **Achat direct** : Cliquez sur un produit pour être redirigé vers Amazon

### 🧮 Algorithme de Score Gagnant

Le score de chaque produit est calculé selon :
- **Prix** : Optimisation du rapport qualité-prix (10-100€ = score optimal)
- **Note client** : Rating Amazon (/5 étoiles)
- **Popularité** : Nombre d'avis clients
- **Score final** : Moyenne pondérée sur 100 points

### 🛠️ Technologies utilisées

- **Frontend** : React + TypeScript + Vite
- **UI/UX** : Tailwind CSS + Shadcn/UI
- **Icons** : Lucide React
- **State** : TanStack Query
- **Backend Logic** : Basé sur algorithme Python de scraping Amazon

### 📊 Statistiques en temps réel

L'application fournit :
- Prix moyen des produits analysés
- Note moyenne globale
- Total des avis cumulés
- Tendances de marché

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 18+)
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <YOUR_GIT_URL>

# Naviguer dans le dossier
cd synchroscale

# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```

### Utilisation

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Saisissez le nom d'un produit dans la barre de recherche
3. Explorez les résultats classés par score de performance
4. Cliquez sur un produit pour accéder à sa page Amazon

## 🎨 Interface utilisateur

- **Design moderne** : Interface épurée et professionnelle
- **Responsive** : Optimisé pour desktop, tablette et mobile
- **Thème** : Palette de couleurs teal/cyan avec accents dorés
- **Navigation** : Pagination intuitive (12 produits par page)
- **Vues multiples** : Basculez entre vue grille et liste

## 🔧 Configuration

L'application fonctionne immédiatement sans configuration supplémentaire. Elle utilise des données simulées basées sur l'algorithme Python de scraping pour la démonstration.

## 📈 Avenir de SynchroScale

- Intégration API Amazon officielle
- Support multi-plateformes (eBay, AliExpress)
- Alertes prix et stock
- Historique des prix
- Recommandations personnalisées IA

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- 📧 Email : support@synchroscale.com
- 🌐 Site web : https://synchroscale.com
- 💬 Discord : [SynchroScale Community]

---

**SynchroScale** - L'intelligence artificielle au service de vos achats e-commerce 🛒✨
