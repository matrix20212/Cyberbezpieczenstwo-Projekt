import { Router } from "express";
import { activateLicense, decryptCaesar, isLicensed } from "../license/license";

const router = Router();

router.get("/status", (req, res) => {
  res.json({ licensed: isLicensed() });
});

router.post("/verify", (req, res) => {
  const { key } = req.body;
  const decrypted = decryptCaesar(key);

  if (decrypted === "MYLICENSE2025") {
    activateLicense();
    res.json({ ok: true });
  } else {
    res.status(400).json({ ok: false, message: "Invalid key" });
  }
});

export default router;
