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

import { handleValidationErrors } from "../utils/validations";

const router = express.Router();

const createProductValidation = [
  body("product.name").notEmpty().withMessage("El nombre es obligatorio"),
  body("product.categoryId")
    .notEmpty()
    .withMessage("La categoria es obligatoria"),
  body("product.sku")
    .notEmpty()
    .withMessage("El sku es obligatorio")
    .trim()
    .toUpperCase(),
];

const updateProductValidation = [
  param("id").isMongoId().withMessage("ID de compañía inválido"),
  body("product.name").notEmpty().withMessage("El nombre es obligatorio"),
  body("product.categoryId")
    .notEmpty()
    .withMessage("La categoria es obligatoria"),
  body("product.sku")
    .notEmpty()
    .withMessage("El sku es obligatorio")
    .trim()
    .toUpperCase(),
];

// Todas las rutas requieren autenticación
router.use(protect);

router
  .route("/")
  .get(getProducts)
  .post(createProductValidation, handleValidationErrors, newProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(updateProductValidation, handleValidationErrors, updateProduct)
  .delete(authorize("admin"), deleteProduct);

export default router;
