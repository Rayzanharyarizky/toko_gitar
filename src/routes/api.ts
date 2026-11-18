import express from "express";
import { register, login, getAllUsers } from "../controllers/authController";
import {
  getGuitars,
  addGuitar,
  getGuitarById,
  updateGuitar,
} from "../controllers/guitarController";
import { verifyToken, isAdmin } from "../middlewares/auth";
import { upload } from "../middlewares/upload";


const router = express.Router();


// Auth Routes
router.post("/register", register);
router.post("/login", login);


// User Routes (Admin Only) - Lihat semua data user
router.get("/users", verifyToken, isAdmin, getAllUsers);

// Guitar Routes (Public/User) - Bisa search & filter
router.get("/guitars", verifyToken, getGuitars);

// Guitar Routes (Public/User) - Lihat detail 1 gitar
router.get("/guitars/:id", verifyToken, getGuitarById);

// Guitar Routes (Admin Only) - Tambah gitar baru
router.post(
  "/guitars",
  verifyToken,
  isAdmin,
  upload.single("image"),
  addGuitar,
);

// Guitar Routes (Admin Only) - Update gitar/gambar
router.put(
  "/guitars/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  updateGuitar,
);

export default router;
