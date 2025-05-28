// src/routes/auth.routes.ts
import express from 'express';
import { check } from 'express-validator';
import { register, login } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El apellido es obligatorio').not().isEmpty(),
    check('email', 'Incluir un email válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Incluir un email válido').isEmail(),
    check('password', 'La contraseña es obligatoria').exists()
  ],
  login
);

// router.get('/me', protect, getMe);

export default router;