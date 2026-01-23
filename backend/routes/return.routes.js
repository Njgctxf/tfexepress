import express from "express";
import { createReturnRequest } from "../controllers/return.controller.js";

const router = express.Router();

router.post("/", createReturnRequest);

export default router;
