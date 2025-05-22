// src/routes/users.routes.ts
import express from "express";
import { body, param } from "express-validator";

import { protect, authorize } from "../middlewares/auth";
import {
  deleteCompany,
  getCompanies,
  getCompanyById,
  newCompany,
  updateCompany,
} from "../controllers/companies.controller";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// companies.routes.ts
router
  .route("/")
  .get(getCompanies)
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
    newCompany
  );

router
  .route("/:id")
  .get(getCompanyById)
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
    updateCompany
  )
  .delete(authorize("admin"), deleteCompany);

export default router;
