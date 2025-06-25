import express from "express";
import { param, query } from "express-validator";
import {
  getProductById,
  getProducts,
} from "../controllers/ecommerce.controller";
import { getPublicCategories } from "../controllers/categories.controller";
import { getPublicCompany } from "../controllers/companies.controller";
import { handleValidationErrors } from "../utils/validations";

const router = express.Router();

router
  .route("/categories")
  .get(
    [
      query("companyId")
        .notEmpty()
        .withMessage("El Id de compañía es requerido")
        .isMongoId()
        .withMessage("El Id de compañía inválido"),
    ],
    handleValidationErrors,
    getPublicCategories
  );

router
  .route("/:companyId")
  .get(
    [
      param("companyId")
        .optional()
        .isMongoId()
        .withMessage("Id de compañía inválido"),
      query("searchTerm").optional().isString().trim(),
      query("categoryId")
        .optional()
        .isMongoId()
        .withMessage("Categoria inválida"),
    ],
    handleValidationErrors,
    getProducts
  );

router
  .route("/company/:id")
  .get(
    [param("id").notEmpty().isMongoId().withMessage("Id de compañía inválido")],
    handleValidationErrors,
    getPublicCompany
  );

router
  .route("/product/:id")
  .get(
    [param("id").notEmpty().isMongoId().withMessage("Id de producto inválido")],
    handleValidationErrors,
    getProductById
  );

export default router;
