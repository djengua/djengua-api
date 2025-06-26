// src/controllers/users.controller.ts
import mongoose from "mongoose";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/user";
import { generateRandomText } from "../utils/strings";

interface IUserFilter {
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  activeCompany?: mongoose.Types.ObjectId | string;
  role?: string;
  email?: string;
}

export const fetchMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id)
      .populate({
        path: "activeCompany",
        select: "name description",
        match: { isActive: true },
      })
      .populate({
        path: "companies",
        select: "name description",
        match: { isActive: true },
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

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
        message: "Error al obtener usuario",
      });
    }
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    let filter: IUserFilter = {
      isActive: true,
    };

    if (req.user!.role === "admin") {
      filter.createdBy = req.user!.id;
    } else if (req.user!.role === "user") {
      // Es usuario creado por admin
      if (!req.user?.createdBy) {
        filter.createdBy = req.user?.createdBy;
      } else {
        throw new Error(
          "Usuarios: Algo ocurrio consulte con el administrador."
        );
      }
    }

    const { role, company } = req.query as { role: string; company: string };

    if (role) {
      filter.role = role;
    }

    if (company) {
      filter.activeCompany = company;
    }

    const data = await User.find(filter)
      .populate({
        path: "activeCompany",
        select: "name description", // Solo campos necesarios
        match: { isActive: true }, // Solo compañías activas
      })
      .select("-password") // Excluir explícitamente la contraseña
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
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
        message: "Error al obtener usuarios",
      });
    }
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "activeCompany",
      select: "name description isActive",
      populate: {
        path: "createdBy",
        select: "name lastName email",
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

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
        message: "Error al obtener usuario",
      });
    }
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    const updatedCompanies: string[] =
      req.body.companies ?? user.companies ?? [];

    let activeCompany: mongoose.Types.ObjectId | string | null =
      user.activeCompany;

    console.log(req.body.activeCompany);
    if (!req.body.activeCompany || req.body.activeCompany === "") {
      activeCompany = null;
      console.log(1);
    } else {
      console.log(2);
      const activeCompanyId = req.body.activeCompany;

      if (updatedCompanies.includes(activeCompanyId)) {
        activeCompany = req.body.activeCompany;
      } else {
        activeCompany =
          updatedCompanies.length > 0 ? updatedCompanies[0] : null;
      }
    }

    // Si no se proporciona activeCompany, validar el existente
    if (user.activeCompany) {
      const currentActiveCompanyId = user.activeCompany.toString();
      const companiesAsStrings = updatedCompanies.map((c) => c.toString());

      if (!companiesAsStrings.includes(currentActiveCompanyId)) {
        activeCompany =
          updatedCompanies.length > 0 ? updatedCompanies[0] : null;
      }
    }

    // Campos actualizables
    const fieldsToUpdate: {
      name: string;
      lastName: string;
      email: string;
      activeCompany?: mongoose.Types.ObjectId | string | null;
      role: string;
      isActive: boolean;
      phone?: string;
      password?: string;
      companies: string[];
    } = {
      name: req.body.name ?? user.name,
      lastName: req.body.lastName ?? user.lastName,
      email: req.body.email ?? user.email,
      activeCompany: activeCompany, // Usar el valor validado
      role: req.body.role ?? user.role,
      isActive:
        req.body.isActive !== undefined ? req.body.isActive : user.isActive,
      phone: req.body.phone ?? user.phone,
      companies: updatedCompanies,
    };

    // Manejo de password reset
    if (req.body.password || req.body.reset) {
      const genPassword = generateRandomText();
      fieldsToUpdate.password = genPassword;
      console.log("Password generado:", genPassword);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof Error) {
      // Error de validación de Mongoose
      if (error.name === "ValidationError") {
        const validationErrors = Object.values((error as any).errors).map(
          (err: any) => ({
            field: err.path,
            message: err.message,
          })
        );

        res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: validationErrors,
        });
        return;
      }

      // Error de duplicación (email único)
      if ((error as any).code === 11000) {
        res.status(409).json({
          success: false,
          message: "Ya existe un usuario con ese email",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al actualizar usuario",
      });
    }
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
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
        message: "Error al eliminar usuario",
      });
    }
  }
};

// @desc    Cambia compañia activa
// @route   DELETE /api/companies/:id/change-company
// @access  Private
export const changeActiveCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    // Campos actualizables
    const fieldsToUpdate = {
      activeCompany: req.params.id || user.activeCompany,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
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
        message: "Error al actualizar usuario",
      });
    }
  }
};

// @desc    Registrar usuario
// @route   POST /api/users
// @access  Private/Admin
export const newUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }

  try {
    let createdBy: mongoose.Types.ObjectId | string | null = null;

    if (req.user!.role === "admin") {
      createdBy = req.user!.id;
    } else if (req.user!.role === "user") {
      throw new Error("El usuario no tiene permisos.");
    }

    const { name, email, lastName, password, activeCompany, companies, phone } =
      req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email, createdBy }).select("id");

    if (userExists) {
      res.status(400).json({
        success: false,
        message: "El usuario ya existe.",
      });
      return;
    }

    // Crear usuario
    const user = await User.create({
      name,
      lastName,
      email,
      password: !password && password.length === 0 ? "password" : password,
      role: "user",
      isActive: true,
      activeCompany,
      createdBy,
      companies,
      phone,
    });

    res.status(201).json({
      success: true,
      user,
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
