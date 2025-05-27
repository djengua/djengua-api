// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User, { IUser } from "../models/user";

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, lastName, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: "El usuario ya existe",
      });
      return;
    }

    // Crear usuario
    const user = await User.create({
      name,
      lastName,
      email,
      password,
    });

    // Crear token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al registrar usuario",
      });
    }
  }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    // Verificar por email y seleccionar la contraseña
    console.log(email);
    const user = await User.findOne({
      email: email.toString().toLowerCase(),
    }).select("+password +role +isActive +email +activeCompany");
    console.log(1);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }
    console.log(2);
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Usuario inactivo, contacte con el administrador",
      });
      return;
    }
    console.log(3);

    // Verificar si la contraseña coincide
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: "Usuario inactivo. Contacte al administrador",
      });
      return;
    }
    console.log(4);
    // Crear token
    const token = user.getSignedJwtToken();
    console.log(5);
    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al iniciar sesión",
      });
    }
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al obtener información del usuario",
      });
    }
  }
};
