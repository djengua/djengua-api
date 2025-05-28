// src/controllers/products.controller.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Product, { IProduct } from "../models/products";
import User  from "../models/user";

// @desc    Obtener todas los products
// @route   GET /api/products
// @access  Private/Admin
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    let filter = {};

    // Si no es admin, solo mostrar sus propias compañías
    if (req.user!.role !== "admin") {
        // consulta al momento de la compañia activa
        const user = await User.findById(req.user!.id)
            .select("+activeCompany");
        filter = { companyId: user!.activeCompany };
    }

    const products = await Product.find(filter)
      .populate("createdBy", "name description isActive createdAt companyId ")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
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
        message: "Error al obtener los productos",
      });
    }
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private/Admin
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
        .populate(
            "createdBy",
            "name lastName"
        );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
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
        message: "Error al obtener el producto",
      });
    }
  }
};

// @desc    Crear producto
// @route   POST /api/products
// @access  Private/Admin
export const newProduct = async (
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
    const { name, description, isActive, quantity, price, published, includeTax } = req.body;

    // Crear nueva compañía
    const newProduct = await Product.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      isActive: isActive ?? true,
      createdBy: req.user!.id,
      companyId: req.user!.activeCompany,
      // images?: string[];
      quantity: quantity,
      price: price,
      // cost?: number;
      // sku?: string;
      // size?: string;
      // color?: string;
      published: published,
      includeTax: includeTax ?? false,
      // tax?: number;
    });

    // images?: string[];
    // quantity: number;
    // price: number;
    // cost?: number;
    // sku?: string;
    // size?: string;
    // color?: string;
    // published: boolean;
    // includeTax: boolean;
    // tax?: number;

    await newProduct.populate("createdBy", "name description isActive createdAt quantity price published includeTax");

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);

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
          message: "Ya existe un producto con ese nombre",
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear el producto",
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
      return;
    }

    // Campos actualizables
    const fieldsToUpdate = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      isActive:
        req.body.isActive !== undefined ? req.body.isActive : product.isActive,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct,
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
        message: "Error al actualizar producto",
      });
    }
  }
};

// @desc    Eliminar producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
      return;
    }

    // await Product.findByIdAndDelete(req.params.id);

    await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        // { runValidators: true }
    );

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
        message: "Error al eliminar producto",
      });
    }
  }
};
