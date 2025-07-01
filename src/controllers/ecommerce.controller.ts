// src/controllers/companies.controller.ts
import { Request, Response } from "express";
import Product from "../models/products";

interface IProductFilter {
  isActive: boolean;
  companyId: string;
  published: boolean;
  categoryId?: string;
  name?: { $regex: string; $options: string };
}

// @desc    Obtener todas los productos de una compañia
// @route   GET /api/e-commerce
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let filter: IProductFilter = {
      companyId: req.params.companyId,
      isActive: true,
      published: true,
    };

    const { categoryId, searchTerm } = req.query as {
      categoryId?: string;
      searchTerm?: string;
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (searchTerm) {
      filter.name = { $regex: searchTerm, $options: "i" };
    }

    const products = await Product.find(filter)
      .select(
        "name description companyId categoryId images quantity price cost sku color specs id fre_shipping warranty discount"
      )
      .populate("companyId", "name")
      .populate("categoryId", "name description")
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

// @desc    Obtener una categoria por ID
// @route   GET /api/ecommerce/:id
// @access  Public
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .select(
        "name description companyId categoryId images quantity price cost sku color specs id fre_shipping warranty discount"
      )
      .populate("companyId", "name")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

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
