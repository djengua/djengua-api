// src/routes/users.routes.ts
import express from 'express';
import { check } from 'express-validator';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/users.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Todas las rutas requieren autenticación y autorización de admin
router.use(protect);
// router.use(protect, authorize);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put([
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El apellido es obligatorio').not().isEmpty(),
    // check('isActive', 'Rol inválido').optional().isIn(['user', 'admin'])
  ], updateUser)
  .delete(deleteUser);

export default router;