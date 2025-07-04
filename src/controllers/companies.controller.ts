// src/controllers/companies.controller.ts
import mongoose from "mongoose";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Company, { ICompany } from "../models/company";
import User from "../models/user";

interface ICompanyFilter {
  deleted: boolean;
  isActive?: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  // activeCompany?: mongoose.Types.ObjectId | string;
  // role?: string;
  // email?: string;
}

// @desc    Obtener todas los companies
// @route   GET /api/companies
// @access  Private/Admin
export const getCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let filter: ICompanyFilter = {
      deleted: false,
      // isActive: true,
    };

    if (req.user!.role === "admin") {
      filter.createdBy = req.user!.id;
    } else if (req.user!.role === "user") {
      // Es usuario creado por admin
      if (req.user?.createdBy !== undefined || req.user?.createdBy !== null) {
        filter.createdBy = req.user?.createdBy;
      } else {
        throw new Error(
          "Compañias: Algo ocurrio consulte con el administrador."
        );
      }
    }

    const companies = await Company.find(filter)
      .populate("createdBy", "name lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
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
        message: "Error al obtener compañias",
      });
    }
  }
};

// @desc    Obtener un compania por ID
// @route   GET /api/companies/:id
// @access  Private/Admin
export const getCompanyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "createdBy",
      "name description isActive createdAt createdBy"
    );

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Compañia no encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: company,
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
        message: "Error al obtener compania",
      });
    }
  }
};

// @desc    Crear compania
// @route   POST /api/companies
// @access  Private/Admin
export const newCompany = async (
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
    const existingCompany = await Company.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      createdBy: req.user!.id,
    });

    if (existingCompany) {
      res.status(409).json({
        success: false,
        message: "Ya existe una compañía con ese nombre",
      });
      return;
    }

    // Crear nueva compañía
    const newCompanyDoc = await Company.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      isActive: isActive ?? true,
      createdBy: req.user!.id,
    });

    // Actualizar el usuario creador solo si es admin
    if (req.user!.role === "admin") {
      const user = await User.findById(req.user!.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      // Agregar la nueva compañía al array de companies
      const updatedCompanies = [...(user.companies || []), newCompanyDoc._id];
      // let activeCompany: mongoose.Types.ObjectId;

      // Determinar activeCompany:
      // - Si no tiene activeCompany, asignar la nueva compañía
      // - Si ya tiene activeCompany, mantenerlo
      let activeCompany = user.activeCompany;
      if (!activeCompany) {
        activeCompany = newCompanyDoc._id as mongoose.Types.ObjectId;
      }

      // Actualizar el usuario (usando req.user!.id en lugar de req.params.id)
      await User.findByIdAndUpdate(
        req.user!.id, // CORRECCIÓN: usar req.user!.id en lugar de req.params.id
        {
          companies: updatedCompanies,
          activeCompany: activeCompany,
        },
        { new: true } // Opcional: devuelve el documento actualizado
      );
    }

    // Poblar la información del creador
    await newCompanyDoc.populate("createdBy", "name lastName email");

    res.status(201).json({
      success: true,
      message: "Compañía creada exitosamente",
      data: newCompanyDoc,
    });
  } catch (error) {
    console.error("Error creating company:", error);

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

      // Error de índice único
      if ((error as any).code === 11000) {
        res.status(409).json({
          success: false,
          message: "Ya existe una compañía con ese nombre",
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la compañía",
    });
  }
};

// @desc    Actualizar compania
// @route   PUT /api/companies/:id
// @access  Private/Admin
export const updateCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Compañia no encontrada",
      });
      return;
    }

    // Campos actualizables
    const fieldsToUpdate = {
      name: req.body.name || company.name,
      description: req.body.description || company.description,
      isActive:
        req.body.isActive !== undefined ? req.body.isActive : company.isActive,
    };

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCompany,
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
        message: "Error al actualizar compañia",
      });
    }
  }
};

// @desc    Eliminar compañia
// @route   DELETE /api/companies/:id
// @access  Private/Admin
export const deleteCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Compañia no encontrado",
      });
      return;
    }

    await Company.findByIdAndUpdate(req.params.id, { deleted: true });

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
        message: "Error al eliminar compañia",
      });
    }
  }
};

export const getPublicCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id).select(
      "name description"
    );

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Compañia no encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: company,
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
        message: "Error al obtener compania",
      });
    }
  }
};
