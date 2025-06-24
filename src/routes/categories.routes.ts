// src/routes/users.routes.ts
import express from "express";
import { body, param } from "express-validator";

import { protect, authorize } from "../middlewares/auth";
import {
  deleteCategory,
  getCategories,
  getCategoryById,
  newCategory,
  updateCategory,
} from "../controllers/categories.controller";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

router
  .route("/")
  .get(getCategories)
  .post(
    [
      body("name")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres")
        .trim()
        .escape(),
    ],
    // authorize("admin"),
    newCategory
  );

router
  .route("/:id")
  .get(getCategoryById)
  .put(
    [
      param("id").isMongoId().withMessage("ID de categoria inválido"),

      body("name")
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres")
        .trim()
        .escape(),
    ],
    // authorize("admin"),
    updateCategory
  )
  .delete(authorize("admin"), deleteCategory);

export default router;
