// src/controllers/companies.controller.ts
import mongoose from "mongoose";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Category from "../models/category";
import Company from "../models/company";

interface ICategoryFilter {
  isActive: boolean;
  userId?: mongoose.Types.ObjectId | string;
  companyId?: mongoose.Types.ObjectId | string;
}

// @desc    Obtener todas las categories
// @route   GET /api/categories
// @access  Private/Admin
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let filter: ICategoryFilter = {
      isActive: true,
    };

    if (req.user!.role !== "admin") {
      if (req.user!.role === "user") {
        // Es usuario creado por admin
        if (!req.user?.createdBy) {
          filter.userId = req.user?.createdBy;
        } else {
          throw new Error(
            "Categorias: Algo ocurrio consulte con el administrador."
          );
        }
      }
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
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
        message: "Error al obtener las categorias",
      });
    }
  }
};

// @desc    Obtener una categoria por ID
// @route   GET /api/categories/:id
// @access  Private/Admin
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Categoria no encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
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
        message: "Error al obtener categoria",
      });
    }
  }
};

// @desc    Crear categoria
// @route   POST /api/categories
// @access  Private/Admin
export const newCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }

  try {
    const { name, description, isActive } = req.body;

    // Verificar si ya existe una compañía con el mismo nombre (case insensitive)
    const existingCategory = await Category.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
    });

    if (existingCategory) {
      res.status(409).json({
        success: false,
        message: "Ya existe una categoria con ese nombre",
      });
      return;
    }

    // Crear nueva categoria
    const newCategory = await Category.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      isActive: isActive ?? true,
      userId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: "Compañía creada exitosamente",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);

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

      // Error de índice único (si agregaste índice único al nombre)
      if ((error as any).code === 11000) {
        res.status(409).json({
          success: false,
          message: "Ya existe una categoria con ese nombre",
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la categoria",
    });
  }
};

// @desc    Actualizar categoria
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Categoria no encontrada",
      });
      return;
    }

    // Campos actualizables
    const fieldsToUpdate = {
      name: req.body.name || category.name,
      description: req.body.description || category.description,
      isActive:
        req.body.isActive !== undefined ? req.body.isActive : category.isActive,
    };

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCategory,
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
        message: "Error al actualizar categoria",
      });
    }
  }
};

// @desc    Eliminar categoria
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Compañia no encontrado",
      });
      return;
    }

    await Category.findByIdAndUpdate(req.params.id, { isActive: false });

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
        message: "Error al eliminar categoria",
      });
    }
  }
};

export const getPublicCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let filter: ICategoryFilter = {
      isActive: true,
    };

    const company = await Company.findById(req.query.companyId).select(
      "createdBy"
    );

    if (!company) {
      throw new Error("Datos incorrectos, no encontrados");
    }

    filter.userId = company?.createdBy;

    const categories = await Category.find(filter)
      .select("name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
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
        message: "Error al obtener las categorias",
      });
    }
  }
};
