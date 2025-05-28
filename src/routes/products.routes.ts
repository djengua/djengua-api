// src/routes/users.routes.ts
import express from "express";
import { body, param } from "express-validator";

import { protect, authorize } from "../middlewares/auth";
import {
  deleteProduct,
  getProducts,
  getProductById,
  newProduct,
  updateProduct,
} from "../controllers/products.controller";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// products.routes.ts
router
  .route("/")
  .get(getProducts)
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
    newProduct
  );

router
  .route("/:id")
  .get(getProductById)
  .put(
    [
      param("id").isMongoId().withMessage("ID de compañía inválido"),

      body("name")
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres")
        .trim()
        .escape(),
    ],
    // authorize("admin"),
    updateProduct
  )
  .delete(authorize("admin"), deleteProduct);

export default router;
