import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db";


// Lihat Semua User (Hanya Admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Kita mengecualikan password agar lebih aman saat data dikirim ke frontend
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error mengambil data user", error });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );
    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Error server", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );
    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Error server", error });
  }
};
