import express from "express";
import { getProductReviews, addReview } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/:productId", getProductReviews);
router.post("/", addReview);

export default router;
