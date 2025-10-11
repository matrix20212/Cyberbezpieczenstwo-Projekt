import { Router } from "express";
import { adminController } from "../controllers/admin.controller";

const router = Router();

router.get("/users", adminController.listUsers);
router.post("/users", adminController.addUser);
router.put("/block/:username", adminController.blockUser);
router.delete("/users/:username", adminController.deleteUser);

export default router;
