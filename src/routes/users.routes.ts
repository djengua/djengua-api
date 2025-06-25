// src/routes/users.routes.ts
import express from "express";
import { body, query } from "express-validator";
import { check } from "express-validator";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeActiveCompany,
  fetchMe,
  newUser,
} from "../controllers/users.controller";
import { protect } from "../middlewares/auth";
import { handleValidationErrors } from "../utils/validations";

const router = express.Router();

// Todas las rutas requieren autenticación y autorización de admin
router.use(protect);
// router.use(protect, authorize);

router
  .route("/")
  .get(
    [
      query("company")
        .optional()
        .isMongoId()
        .withMessage("El Id de compañía inválido"),
      query("role").optional(),
    ],
    handleValidationErrors,
    getUsers
  )
  .post(
    [
      body("email")
        .notEmpty()
        .withMessage("El email es obligatorio")
        .isEmail()
        .withMessage("Email incorrecto")
        .toLowerCase(),
      body("name")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .withMessage("Email incorrecto"),
      body("lastName").optional().trim(),
    ],
    newUser
  );

router.route("/me").get(fetchMe);

router
  .route("/:id")
  .get(getUserById)
  .put(
    [
      check("name", "El nombre es obligatorio").not().isEmpty(),
      check("lastName", "El apellido es obligatorio").not().isEmpty(),
      // check('isActive', 'Rol inválido').optional().isIn(['user', 'admin'])
    ],
    updateUser
  )
  .delete(deleteUser);

router
  .route("/:id/change-company")
  .patch(
    [check("id", "Indique la compañia activa").not().isEmpty()],
    changeActiveCompany
  );

export default router;
