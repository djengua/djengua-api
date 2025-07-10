// src/routes/users.routes.ts
import express from "express";
import { body, param } from "express-validator";

import { protect, authorize } from "../middlewares/auth";

import { handleValidationErrors } from "../utils/validations";
import {
  getBundles,
  getBundlesById,
  newBundle,
  updateBundle,
} from "../controllers/bundles.controller";

const router = express.Router();

const createBundleValidation = [
  body("bundle.name").notEmpty().withMessage("El nombre es obligatorio"),
  body("bundle.categoryId")
    .notEmpty()
    .withMessage("La categoria es obligatoria"),
  body("bundle.sku")
    .notEmpty()
    .withMessage("El sku es obligatorio")
    .trim()
    .toUpperCase(),
];

const updateBundleValidation = [
  param("id").isMongoId().withMessage("ID de compañía inválido"),
  body("bundle.name").notEmpty().withMessage("El nombre es obligatorio"),
  body("bundle.categoryId")
    .notEmpty()
    .withMessage("La categoria es obligatoria"),
  body("bundle.sku")
    .notEmpty()
    .withMessage("El sku es obligatorio")
    .trim()
    .toUpperCase(),
];

// Todas las rutas requieren autenticación
router.use(protect);

router
  .route("/")
  .get(getBundles)
  .post(createBundleValidation, handleValidationErrors, newBundle);

router
  .route("/:id")
  .get(getBundlesById)
  .put(updateBundleValidation, handleValidationErrors, updateBundle);
//.delete(authorize("admin"), deleteProduct);

export default router;
