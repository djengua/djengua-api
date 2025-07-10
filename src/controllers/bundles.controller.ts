// src/controllers/bundles.controller.ts
import mongoose from "mongoose";

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Bundle, { IBundles } from "../models/bundles";
import Category from "../models/category";
import { IProduct } from "../models/products";

interface IBundleFilter {
  isActive?: boolean;
  companyId?: mongoose.Types.ObjectId | string;
}

// @desc    Obtener todos los bundles
// @route   GET /api/bundles
// @access  Private/Admin
export const getBundles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let filter: IBundleFilter = {
      companyId: req.user!.activeCompany,
    };

    const [bundles, totalCount] = await Promise.all([
      Bundle.find(filter)
        .populate("createdBy", "name description isActive createdAt companyId ")
        .populate("companyId", "name description")
        .populate("categoryId", "name description")
        .sort({ createdAt: -1 }),
      // .skip(skip)
      // .limit(limit),
      Bundle.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: bundles,
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

// @desc    Obtener un bundle por ID
// @route   GET /api/bundles/:id
// @access  Private/Admin
export const getBundlesById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bundle = await Bundle.findById(req.params.id)
      .populate("createdBy", "name lastName")
      .populate("companyID", "name description isActive")
      .populate("categoryId", "name description isActive");

    if (!bundle) {
      res.status(404).json({
        success: false,
        message: "Bundle no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: bundle,
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
        message: "Error al obtener el bundle",
      });
    }
  }
};

// @desc    Crear Bundle
// @route   POST /api/bundles
// @access  Private/Admin
export const newBundle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bundle } = req.body;
    const {
      name,
      description,
      isActive,
      published,
      categoryId,
      products,
      quantity,
      price,
      images,
      sku,
      rating,
      specs,
      // includeTax,
      // tax,
      free_shipping,
      warranty,
      discount,
    } = bundle;

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

    const newBundle = await Bundle.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      isActive: isActive ?? true,
      createdBy: req.user!.id,
      companyId: req.user!.activeCompany,
      quantity: quantity,
      price: price,
      products: products ?? [],
      sku: sku,
      published: published,
      // includeTax: includeTax ?? false,
      // tax: tax ?? 0,
      rating: rating ?? 0,
      categoryId: category,
      images: images ?? [],
      specs: specs ?? [],
      free_shipping: free_shipping ?? false,
      warranty: warranty ?? false,
      discount: discount ?? 0,
    });

    await newBundle.populate(
      "createdBy",
      "name description isActive createdAt"
    );

    await newBundle.populate("categoryId", "name description isActive");

    res.status(201).json({
      success: true,
      message: "Bundle creado exitosamente",
      data: newBundle,
    });
  } catch (error) {
    console.error("Error creating bundle:", error);

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
          message: "Ya existe un bundle o sku con ese nombre",
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear el bundle",
    });
  }
};

// @desc    Actualizar bundle
// @route   PUT /api/bundles/:id
// @access  Private/Admin
export const updateBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      res.status(404).json({
        success: false,
        message: "Bundle no encontrado",
      });
      return;
    }

    const { bundle: updBundle } = req.body;
    const {
      name,
      description,
      isActive,
      quantity,
      price,
      published,
      // includeTax,
      categoryId,
      sku,
      // tax,
      images,
      specs,
      free_shipping,
      warranty,
      discount,
      products,
    } = updBundle;

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

    const fieldsToUpdate: Partial<IBundles> = {};

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
    // if (includeTax !== undefined) fieldsToUpdate.includeTax = includeTax;
    // if (tax !== undefined) fieldsToUpdate.tax = tax;
    if (sku !== undefined) fieldsToUpdate.sku = sku;
    if (images !== undefined) fieldsToUpdate.images = images;
    if (specs !== undefined) fieldsToUpdate.specs = specs;
    if (free_shipping !== undefined)
      fieldsToUpdate.free_shipping = free_shipping;
    if (warranty !== undefined) fieldsToUpdate.warranty = warranty;
    if (discount !== undefined) fieldsToUpdate.discount = discount;
    if (products !== undefined)
      fieldsToUpdate.products = products.map((p: IProduct) => p.id);

    const updatedBundle = await Bundle.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name description isActive createdAt")
      .populate("companyId", "name description")
      .populate("categoryId", "name description isActive");

    // TODO: Restar en 1 por cada producto el qty

    res.status(200).json({
      success: true,
      message: "Bundle actualizado exitosamente",
      data: updatedBundle,
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
        message: "Error al actualizar bundle",
      });
    }
  }
};

// // @desc    Eliminar producto
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// export const deleteProduct = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       res.status(404).json({
//         success: false,
//         message: "Producto no encontrado",
//       });
//       return;
//     }

//     // await Product.findByIdAndDelete(req.params.id);

//     await Product.findByIdAndUpdate(
//       req.params.id,
//       { isActive: false }
//       // { runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: {},
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         message: "Error al eliminar producto",
//       });
//     }
//   }
// };
