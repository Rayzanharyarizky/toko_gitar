import { z } from "zod";

export const guitarSchema = z.object({
  name: z.string().min(3, "Nama gitar minimal 3 karakter"),
  category_id: z.string().transform((val) => Number(val)),
  price: z.string().transform((val) => Number(val)),
  stock: z.string().transform((val) => Number(val)),
  description: z.string().optional(),
});
