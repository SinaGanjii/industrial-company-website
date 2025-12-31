# Admin Panel - Industrial Accounting System

## 📁 Structure du Projet

```
app/admin/
├── types/
│   └── index.ts              # Toutes les interfaces TypeScript
├── services/                 # Services métier (OOP)
│   ├── StockService.ts       # Gestion des stocks
│   ├── CostService.ts        # Gestion des coûts
│   ├── InvoiceService.ts     # Gestion des factures
│   └── ReportService.ts      # Génération de rapports
├── components/               # Composants UI modulaires
│   ├── Dashboard.tsx         # Dashboard principal
│   ├── ProductManagement.tsx # Gestion produits
│   ├── StockDisplay.tsx      # Affichage stocks
│   ├── CostManagement.tsx    # Gestion coûts
│   ├── SalesManagement.tsx   # Gestion ventes
│   ├── InvoiceManagement.tsx # Gestion factures
│   └── Reports.tsx          # Rapports
├── hooks/
│   └── useDataPersistence.ts # Persistance localStorage
├── utils/
│   ├── dateUtils.ts          # Utilitaires dates
│   └── exportUtils.ts        # Export PDF/Excel
└── page.tsx                  # Page principale
```

## 🏗️ Architecture OOP

### Services (Business Logic)

Tous les services sont des classes statiques avec des méthodes utilitaires :

- **StockService** : Calcul automatique des stocks (Production - Ventes)
- **CostService** : Distribution automatique des coûts partagés
- **InvoiceService** : Workflow de facturation (Draft → Approved → Paid)
- **ReportService** : Génération automatique de rapports

### Types & Interfaces

Toutes les entités sont typées avec TypeScript :
- `Product` : Produits manufacturés
- `Production` : Enregistrements de production
- `Cost` : Coûts de production
- `Sale` : Ventes
- `Invoice` : Factures
- `Stock` : Calculs de stock
- `DailyReport` / `MonthlyReport` : Rapports

## 🔄 Flux de Données

1. **Production** → Augmente le stock
2. **Vente** → Diminue le stock automatiquement
3. **Coûts** → Distribués automatiquement sur les produits
4. **Factures** → Générées depuis les ventes
5. **Rapports** → Calculés automatiquement

## 📊 Calculs Automatiques

### Stock
```
Stock = Total Production - Total Sales
```

### Coûts
- Coûts partagés (électricité, eau, gaz, salaires) → Distribués proportionnellement
- Coûts spécifiques → Affectés directement au produit

### Profit
```
Profit = Revenue - Total Costs
Profit Margin = (Profit / Revenue) × 100
```

## 🎯 Fonctionnalités

- ✅ Gestion produits et stocks
- ✅ Production quotidienne
- ✅ Gestion des coûts (électricité, eau, gaz, salaires)
- ✅ Ventes et commandes
- ✅ Système de facturation complet
- ✅ Rapports automatiques
- ✅ Export PDF/Excel
- ✅ Persistance localStorage

## 🚀 Prochaines Étapes

Voir `TODO.md` pour la liste complète des tâches.

