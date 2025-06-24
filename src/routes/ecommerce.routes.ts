import express from "express";
import { param, query, validationResult } from "express-validator";
import {
  getProductById,
  getProducts,
} from "../controllers/ecommerce.controller";
import { getPublicCategories } from "../controllers/categories.controller";
import { getPublicCompany } from "../controllers/companies.controller";

const handleValidationErrors = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => {
      // Verificar el tipo de error y acceder a las propiedades correctamente
      if (error.type === "field") {
        return {
          field: error.path, // ✅ 'path' en lugar de 'param'
          message: error.msg,
          value: error.value,
          location: error.location,
        };
      } else {
        // Para errores que no son de campo
        return {
          field: "unknown",
          message: error.msg,
          value: undefined,
          location: "unknown",
        };
      }
    });

    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: formattedErrors,
    });
  }

  next();
};

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
