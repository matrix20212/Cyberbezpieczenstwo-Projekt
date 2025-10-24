import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authMiddleware, isAdmin } from "../middleware/auth";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/users", adminController.listUsers);
router.post("/users", adminController.addUser);
router.put("/users/:username", adminController.updateUser);
router.put("/block/:username", adminController.blockUser);
router.delete("/users/:username", adminController.deleteUser);

router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

router.get("/logs", adminController.getLogs);

export default router;
