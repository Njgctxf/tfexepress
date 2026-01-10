import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST /api/products - Créer un nouveau produit
export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    if (req.file) {
      productData.images = [`/uploads/${req.file.filename}`];
    } else if (productData.image && typeof productData.image === 'string') {
        productData.images = [productData.image];
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.create(productData);
      return res.status(201).json({
        success: true,
        message: "Produit créé avec succès",
        data: product,
      });
    }
    throw new Error("MongoDB not detected");

  } catch (error) {
    console.warn("Using JSON fallback for createProduct");
    try {
       const productData = { ...req.body };
       if (req.file) {
        productData.images = [`/uploads/${req.file.filename}`];
       } else if (productData.image && typeof productData.image === 'string') {
          productData.images = [productData.image];
       }

      const DATA_PATH = path.join(__dirname, "../data/products.json");
      let products = [];
      if (fs.existsSync(DATA_PATH)) {
        products = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      }
      
      const newProduct = {
        id: Date.now(),
        ...productData,
        sold: 0,
        createdAt: new Date().toISOString()
      };
      
      products.push(newProduct);
      fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2));
      
      res.status(201).json({
        success: true,
        message: "Produit créé avec succès (JSON)",
        data: newProduct,
      });
    } catch (fsError) {
      res.status(400).json({
        success: false,
        message: "Erreur lors de la création du produit (Fallback)",
        error: fsError.message,
      });
    }
  }
};

// GET /api/products - Obtenir tous les produits avec filtres
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      featured,
      sort = "-createdAt",
      page = 1,
      limit = 20,
    } = req.query;

    if (mongoose.connection.readyState === 1) {
       // Construire les filtres Mongoose
      const filter = { isActive: true };
      if (category) filter.category = category;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (search) filter.$text = { $search: search };
      if (featured === "true") filter.isFeatured = true;

      const skip = (Number(page) - 1) * Number(limit);
      const products = await Product.find(filter)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));
      const total = await Product.countDocuments(filter);
      
      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: products,
      });
    }
     throw new Error("MongoDB not detected");
  } catch (e) {
      console.warn("MongoDB unavailable, using JSON fallback for products");
      const DATA_PATH = path.join(__dirname, "../data/products.json");
      let products = [];
      if (fs.existsSync(DATA_PATH)) {
         products = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      }
      
      // Filtres basiques sur le JSON
      products = products.filter(p => {
        if (category && p.category !== category) return false;
        if (featured === "true" && !p.isFeatured) return false;
        return true;
      });
      const total = products.length;
      
      // Pagination basique
      const skip = (Number(page) - 1) * Number(limit);
      products = products.slice(skip, skip + Number(limit));

      res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: products,
      });
  }
};

// GET /api/products/:id - Obtenir un produit par ID
export const getProductById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id).populate(
        "category",
        "name slug"
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Produit non trouvé",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    }
    throw new Error("MongoDB not detected");
  } catch (error) {
      try {
        const DATA_PATH = path.join(__dirname, "../data/products.json");
        const products = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
        const product = products.find(p => p.id == req.params.id || p._id == req.params.id);
         if (!product) {
            return res.status(404).json({
              success: false,
              message: "Produit non trouvé",
            });
          }
           res.status(200).json({
            success: true,
            data: product,
          });
      } catch (e) {
          res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération du produit",
            error: error.message,
          });
      }
  }
};

// PUT /api/products/:id - Mettre à jour un produit
export const updateProduct = async (req, res) => {
   // ... simplified for NOW
   res.status(501).json({ message: "Not implemented in fallback mode yet" });
};

// DELETE /api/products/:id - Supprimer un produit (soft delete)
export const deleteProduct = async (req, res) => {
   // ... simplified for NOW
    res.status(501).json({ message: "Not implemented in fallback mode yet" });
};

// DELETE /api/products/:id/hard - Supprimer définitivement un produit
export const hardDeleteProduct = async (req, res) => {
    // ... simplified for NOW
    res.status(501).json({ message: "Not implemented in fallback mode yet" });
};
