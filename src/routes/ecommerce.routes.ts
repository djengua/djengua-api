import express from "express";
import { param, query } from "express-validator";
import {
  getProductById,
  getProducts,
} from "../controllers/ecommerce.controller";

const router = express.Router();

router
  .route("/:companyId")
  .get(
    [
      param("companyId").isMongoId().withMessage("Id de compañía inválido"),
      query("searchTerm").optional().isString().trim(),
      query("categoryId")
        .optional()
        .isMongoId()
        .withMessage("Categoria inválida"),
    ],
    getProducts
  );

router.route("/:id").get(getProductById);

export default router;
