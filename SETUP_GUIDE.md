# 🔌 Guide de connexion Frontend-Backend

## ✅ Ce qui a été fait

### Backend

- ✅ Model Product complet créé
- ✅ Controller produits avec CRUD
- ✅ Routes produits configurées
- ✅ Server.js mis à jour avec dotenv
- ✅ .env.example créé

### Frontend

- ✅ API products complète avec filtres
- ✅ Configuration centralisée
- ✅ .env.example créé

---

## 📝 Étapes pour lancer le système

### 1. Configuration Backend

```bash
cd backend

# Copier le fichier .env.example en .env
cp .env.example .env

# Le fichier .env sera créé avec ces valeurs par défaut :
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/tfexpress
# FRONTEND_URL=http://localhost:5173
```

### 2. Configuration Frontend

```bash
cd ecommerce-frontend

# Copier le fichier .env.example en .env
cp .env.example .env

# Éditez le fichier .env et ajoutez vos clés Supabase :
# VITE_SUPABASE_URL=your_supabase_url_here
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
# VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Démarrer MongoDB (si pas déjà lancé)

```bash
# Sur Mac avec Homebrew
brew services start mongodb-community

# OU lancer manuellement
mongod --config /usr/local/etc/mongod.conf
```

### 4. Lancer le Backend

```bash
cd backend
npm run dev
```

Vous devriez voir :

```
✅ MongoDB connecté à: mongodb://127.0.0.1:27017/tfexpress
✅ Backend lancé sur http://localhost:5000
🌍 CORS activé pour: http://localhost:5173
```

### 5. Lancer le Frontend

```bash
cd ecommerce-frontend
npm run dev
```

---

## 🧪 Tester l'API

### Test 1 : Vérifier que l'API fonctionne

Ouvrez votre navigateur : http://localhost:5000

Vous devriez voir :

```json
{
  "success": true,
  "message": "🚀 API TFExpress OK",
  "version": "1.0.0",
  "endpoints": {
    "products": "/api/products",
    "categories": "/api/categories",
    "featuredCategories": "/api/featured-categories"
  }
}
```

### Test 2 : Vérifier les produits (sera vide au début)

http://localhost:5000/api/products

Réponse attendue :

```json
{
  "success": true,
  "count": 0,
  "total": 0,
  "page": 1,
  "pages": 0,
  "data": []
}
```

---

## 📊 Ajouter des produits de test

### Méthode 1 : Via l'interface admin

1. Lancez le frontend
2. Allez sur `/admin/products/add`
3. Remplissez le formulaire
4. Créez votre premier produit

### Méthode 2 : Via MongoDB Compass

1. Ouvrez MongoDB Compass
2. Connectez-vous à `mongodb://127.0.0.1:27017`
3. Créez une base de données `tfexpress`
4. Insérez des produits manuellement

### Méthode 3 : Via Postman/Insomnia

**Créer un produit :**

```http
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "iPhone 14 Pro",
  "description": "Le dernier iPhone avec puce A16",
  "price": 1299,
  "originalPrice": 1499,
  "discount": 13,
  "category": "CATEGORY_ID_HERE",
  "brand": "Apple",
  "images": ["https://example.com/iphone.jpg"],
  "stock": 50,
  "rating": 4.8,
  "isFeatured": true
}
```

---

## 🔧 Endpoints disponibles

### Produits

| Méthode  | Endpoint                 | Description                       |
| -------- | ------------------------ | --------------------------------- |
| `GET`    | `/api/products`          | Liste des produits (avec filtres) |
| `GET`    | `/api/products/:id`      | Un produit par ID                 |
| `POST`   | `/api/products`          | Créer un produit                  |
| `PUT`    | `/api/products/:id`      | Modifier un produit               |
| `DELETE` | `/api/products/:id`      | Supprimer (soft)                  |
| `DELETE` | `/api/products/:id/hard` | Supprimer définitivement          |

### Filtres disponibles

- `?category=ID` - Filtrer par catégorie
- `?minPrice=100` - Prix minimum
- `?maxPrice=1000` - Prix maximum
- `?search=iphone` - Recherche textuelle
- `?featured=true` - Produits en vedette
- `?sort=-price` - Tri (price, -price, createdAt, -createdAt)
- `?page=1&limit=20` - Pagination

---

## ✅ Prochaines étapes

1. Créer des catégories dans MongoDB
2. Ajouter des produits de test
3. Modifier le frontend pour utiliser l'API au lieu de fakeProducts
4. Tester le flux complet

---

## 🚨 Problèmes courants

### MongoDB ne démarre pas

```bash
# Vérifier le statut
brew services list

# Redémarrer
brew services restart mongodb-community
```

### CORS Error

- Vérifiez que `FRONTEND_URL` dans backend/.env = `http://localhost:5173`
- Relancez le backend

### API retourne vide

- C'est normal au début, il faut ajouter des produits
- Utilisez l'interface admin ou Postman

---

Bon développement ! 🚀
