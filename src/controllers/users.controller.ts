// src/controllers/users.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/user';


export const fetchMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id)
      .populate({
        path: "activeCompany",
        select: "name description isActive",
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario'
      });
    }
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {

    
    const { role, company } = req.query;
    let filter: any = {};
    
    if (req.user!.role !== "admin") {
      filter.isActive = true;
    }

    if (role) {
      filter.role = role;
    }

    if (company) {
      filter.activeCompany = company;
    }

    const data = await User.find(filter)
      .populate({
        path: "activeCompany",
        select: "name description isActive", // Solo campos necesarios
        match: { isActive: true } // Solo compañías activas
      })
      .select('-password') // Excluir explícitamente la contraseña
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios'
      });
    }
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: "activeCompany",
        select: "name description isActive",
        populate: {
          path: "createdBy",
          select: "name lastName email"
        }
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario'
      });
    }
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Campos actualizables
    const fieldsToUpdate = {
      name: req.body.name || user.name,
      lastName: req.body.lastName || user.lastName,
      email: req.body.email || user.email,
      active: req.body.activeCompany || user.activeCompany,
      role: req.body.role || user.role,
      isActive: req.body.isActive !== undefined ? req.body.isActive : user.isActive
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario'
      });
    }
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario'
      });
    }
  }
};

// @desc    Cambia compañia activa
// @route   DELETE /api/companies/:id/change-company
// @access  Private
export const changeActiveCompany = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Usuario no encontrado'
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
      data: updatedUser
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario'
      });
    }
  }
};