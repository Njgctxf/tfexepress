import express from "express";
import { getAllProfiles, getMyProfile, updateProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", getAllProfiles);
router.get("/me", getMyProfile);
router.post("/update", updateProfile); // Using POST/PUT for updates

export default router;
