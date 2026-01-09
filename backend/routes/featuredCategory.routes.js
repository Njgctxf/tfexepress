import express from "express";
import {
  getFeaturedCategories,
  createFeaturedCategory,
  deleteFeaturedCategory,
} from "../controllers/featuredCategory.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getFeaturedCategories);
router.post("/", upload.single("image"), createFeaturedCategory);
router.delete("/:id", deleteFeaturedCategory);

export default router;
