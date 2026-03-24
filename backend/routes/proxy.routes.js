import express from "express";
import { proxyImage } from "../controllers/proxy.controller.js";

const router = express.Router();

// GET /api/proxy/image?url=https://ae01.alicdn.com/...
router.get("/image", proxyImage);

export default router;
