import express from "express";
import { getAllProfiles, getMyProfile, updateProfile, deleteAccount } from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", getAllProfiles);
router.get("/me", getMyProfile);
router.post("/update", updateProfile);
router.delete("/delete", deleteAccount); // Delete endpoint

export default router;
