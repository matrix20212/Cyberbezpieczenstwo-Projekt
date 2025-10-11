import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authMiddleware, isAdmin } from "../middleware/auth";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/users", adminController.listUsers);
router.post("/users", adminController.addUser);
router.put("/block/:username", adminController.blockUser);
router.delete("/users/:username", adminController.deleteUser);

router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

export default router;
