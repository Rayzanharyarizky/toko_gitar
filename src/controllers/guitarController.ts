import { Request, Response } from "express";
import db from "../config/db";
import cloudinary from "../config/cloudinary";
import { guitarSchema } from "../validators/guitarSchema";

// Get Semua Gitar (Dengan fitur Search Nama & Filter Kategori)
export const getGuitars = async (req: Request, res: Response) => {
  try {
    const { search, category_id } = req.query;
    let query =
      "SELECT guitars.*, categories.name as category_name FROM guitars LEFT JOIN categories ON guitars.category_id = categories.id WHERE 1=1";
    const params: any[] = [];

    if (search) {
      query += " AND guitars.name LIKE ?";
      params.push(`%${search}%`);
    }
    if (category_id) {
      query += " AND category_id = ?";
      params.push(category_id);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error mengambil data", error });
  }
};

// Get Detail Gitar by ID (GET) -> Ini yang memperbaiki 404
export const getGuitarById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.query(
      "SELECT guitars.*, categories.name as category_name FROM guitars LEFT JOIN categories ON guitars.category_id = categories.id WHERE guitars.id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Gitar tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error mengambil data gitar", error });
  }
};

// Tambah Gitar (Hanya Admin)
export const addGuitar = async (req: Request, res: Response) => {
  try {
    const validatedData = guitarSchema.parse(req.body);
    let imageUrl = null;

    // Upload ke Cloudinary menggunakan memory buffer
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "guitars",
      });
      imageUrl = result.secure_url;
    }

    await db.query(
      "INSERT INTO guitars (name, category_id, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [
        validatedData.name,
        validatedData.category_id,
        validatedData.price,
        validatedData.stock,
        validatedData.description,
        imageUrl,
      ],
    );

    res.status(201).json({ message: "Gitar berhasil ditambahkan" });
  } catch (error) {
    res.status(400).json({ message: "Validasi gagal / Error", error });
  }
};

// Update Gitar (PUT) -> Ini untuk update gambar
export const updateGuitar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [existingGuitar]: any = await db.query(
      "SELECT * FROM guitars WHERE id = ?",
      [id],
    );
    if (existingGuitar.length === 0) {
      return res.status(404).json({ message: "Gitar tidak ditemukan" });
    }

    const currentData = existingGuitar[0];
    let imageUrl = currentData.image_url;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "guitars",
      });
      imageUrl = result.secure_url;
    }

    const name = req.body.name || currentData.name;
    const category_id = req.body.category_id
      ? Number(req.body.category_id)
      : currentData.category_id;
    const price = req.body.price ? Number(req.body.price) : currentData.price;
    const stock = req.body.stock ? Number(req.body.stock) : currentData.stock;
    const description = req.body.description || currentData.description;

    await db.query(
      "UPDATE guitars SET name=?, category_id=?, price=?, stock=?, description=?, image_url=? WHERE id=?",
      [name, category_id, price, stock, description, imageUrl, id],
    );

    res.json({
      message: "Data gitar berhasil diperbarui",
      image_url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saat memperbarui data", error });
  }
};
