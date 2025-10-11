import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
