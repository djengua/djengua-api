// src/controllers/products.controller.ts
import mongoose from "mongoose";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Product, { IProduct } from "../models/products";
import Category from "../models/category";

interface IProductFilter {
  isActive?: boolean;
  companyId?: mongoose.Types.ObjectId | string;
  $or?: Array<{ [key: string]: any }>;
  name?: { $regex: string; $options: string };
  sku?: { $regex: string; $options: string };
}

// @desc    Obtener todas los products
// @route   GET /api/products
// @access  Private/Admin
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchQuery = req.query.q as string;
    // const page = parseInt(req.query.page as string) || 1;
    // const limit = parseInt(req.query.limit as string) || 10;
    // const skip = (page - 1) * limit;
    let filter: IProductFilter = {
      companyId: req.user!.activeCompany,
    };

    if (searchQuery && searchQuery.trim()) {
      const searchRegex = { $regex: searchQuery.trim(), $options: "i" };

      // Búsqueda en múltiples campos (name, sku, description)
      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex },
      ];

      delete filter.name;
    }

    // console.log(filter);

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate("createdBy", "name description isActive createdAt companyId ")
        .populate("companyId", "name description")
        .populate("categoryId", "name description")
        .sort({ createdAt: -1 }),
      // .skip(skip)
      // .limit(limit),
      Product.countDocuments(filter),
    ]);

    // const totalPages = Math.ceil(totalCount / limit);
    // const hasNextPage = page < totalPages;
    // const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: products,
      total: totalCount,
      // pagination: {
      //   currentPage: page,
      //   totalPages,
      //   totalCount,
      //   nextPage: hasNextPage ? page + 1 : null,
      //   prevPage: hasPrevPage ? page - 1 : null,
      // },
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

// @desc    Obtener productos por ID Bundles
// @route   GET /api/products/search
// @access  Private/Admin
export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchQuery = req.query.q as string;
    let filter: IProductFilter = {
      companyId: req.user!.activeCompany,
      isActive: true,
    };

    if (searchQuery && searchQuery.trim()) {
      const searchRegex = { $regex: searchQuery.trim(), $options: "i" };

      // Búsqueda en múltiples campos (name, sku, description)
      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex },
      ];

      delete filter.name;
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        // .select("name sku categoryId price quantity")
        .populate("createdBy", "name description isActive createdAt companyId ")
        .populate("companyId", "name description")
        .populate("categoryId", "name description")
        .sort({ createdAt: -1 }),

      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      total: totalCount,
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

// @desc    Obtener productos por ID Bundles
// @route   GET /api/products/by-ids
// @access  Private/Admin
export const searchByIds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter = { _id: { $in: req.body.ids } };

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .select("name description companyId categoryId sku isActive")
        .populate("companyId", "name description")
        .populate("categoryId", "name description")
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      total: totalCount,
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
      .populate("createdBy", "name lastName")
      .populate("companyID", "name description isActive")
      .populate("categoryId", "name description isActive");

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
  console.log(1);
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   res.status(400).json({
  //     success: false,
  //     errors: errors.array(),
  //   });
  //   return;
  // }

  try {
    const { product } = req.body;
    const {
      name,
      description,
      isActive,
      quantity,
      price,
      published,
      includeTax,
      categoryId,
      sku,
      cost,
      tax,
      color,
      images,
      specs,
      free_shipping,
      warranty,
      discount,
      unlimited,
    } = product;

    if (images && Array.isArray(images)) {
      for (const image of images) {
        if (!image.filename || !image.url || !image.contentType) {
          res.status(400).json({
            success: false,
            message: "Cada imagen debe tener filename, url y contentType",
          });
          return;
        }
      }
    }

    const category = await Category.findById(categoryId.id);

    if (!category) {
      res.status(400).json({
        success: false,
        errors: "La categoria no existe",
      });
      return;
    }

    // Crear nueva compañía
    const newProduct = await Product.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      isActive: isActive ?? true,
      createdBy: req.user!.id,
      companyId: req.user!.activeCompany,
      quantity: quantity,
      price: price,
      cost: cost,
      sku: sku,
      color: color,
      published: published,
      includeTax: includeTax ?? false,
      tax: tax ?? 0,
      categoryId: category, // categoryId,
      images: images ?? [],
      specs: specs ?? [],
      free_shipping: free_shipping ?? false,
      warranty: warranty ?? false,
      discount: discount ?? 0,
      unlimited: unlimited ?? false,
    });

    await newProduct.populate(
      "createdBy",
      "name description isActive createdAt"
    );

    await newProduct.populate("categoryId", "name description isActive");

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

      if ((error as any).code === 11000) {
        res.status(409).json({
          success: false,
          message: "Ya existe un producto o sku con ese nombre",
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

    const { product: updProd } = req.body;
    const {
      name,
      description,
      isActive,
      quantity,
      price,
      published,
      includeTax,
      categoryId,
      sku,
      size,
      cost,
      tax,
      color,
      images,
      specs,
      free_shipping,
      warranty,
      discount,
      unlimited,
    } = updProd;

    if (req.body.images && Array.isArray(req.body.images)) {
      for (const image of req.body.images) {
        if (!image.filename || !image.url || !image.contentType) {
          res.status(400).json({
            success: false,
            message: "Cada imagen debe tener filename, url y contentType",
          });
          return;
        }
      }
    }

    const fieldsToUpdate: Partial<IProduct> = {};

    if (name !== undefined) fieldsToUpdate.name = name.trim();
    if (description !== undefined)
      fieldsToUpdate.description = description?.trim() ?? "";
    if (isActive !== undefined) fieldsToUpdate.isActive = isActive;
    if (categoryId !== undefined) {
      const category = await Category.findById(categoryId.id);
      if (!category) {
        res.status(400).json({
          success: false,
          errors: "La categoria no existe",
        });
        return;
      }
      fieldsToUpdate.categoryId = category.id;
    }
    if (quantity !== undefined) fieldsToUpdate.quantity = quantity;
    if (price !== undefined) fieldsToUpdate.price = price;
    if (published !== undefined) fieldsToUpdate.published = published;
    if (includeTax !== undefined) fieldsToUpdate.includeTax = includeTax;
    if (cost !== undefined) fieldsToUpdate.cost = cost;
    if (sku !== undefined) fieldsToUpdate.sku = sku;
    if (color !== undefined) fieldsToUpdate.color = color;
    if (size !== undefined) fieldsToUpdate.size = size;
    if (tax !== undefined) fieldsToUpdate.tax = tax;
    if (images !== undefined) fieldsToUpdate.images = images;
    if (specs !== undefined) fieldsToUpdate.specs = specs;
    if (free_shipping !== undefined)
      fieldsToUpdate.free_shipping = free_shipping;
    if (warranty !== undefined) fieldsToUpdate.warranty = warranty;
    if (discount !== undefined) fieldsToUpdate.discount = discount;
    if (unlimited !== undefined) fieldsToUpdate.unlimited = unlimited;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name description isActive createdAt")
      .populate("companyId", "name description")
      .populate("categoryId", "name description isActive");

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
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
      { isActive: false }
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
