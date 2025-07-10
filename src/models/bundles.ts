// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import { IImages, ImageSchema } from "./images";
import { ISpec, SpecSchema } from "./specs";

export interface IBundles extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  quantity: number;
  price: number;
  images?: IImages[];
  sku?: string;
  rating?: number;
  specs?: ISpec[];
  // includeTax: boolean;
  // tax?: number;
  free_shipping?: boolean;
  warranty?: boolean;
  discount?: number;
}

const BundlesSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Por favor agregue un nombre"],
      trim: true,
      maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [150, "La descripcion no puede tener más de 150 caracteres"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es requerido"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "La compañia es requerida"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    products: {
      type: [mongoose.Types.ObjectId], // Array de ImageSchema
      default: [],
    },
    quantity: {
      type: Number,
      required: [true, "La cantidad es requerida"],
      min: [0, "La cantidad no puede ser negativa"],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: [0, "El precio no puede ser negativo"],
      validate: {
        validator: function (v: number) {
          return v >= 0;
        },
        message: "El precio debe ser mayor o igual a 0",
      },
    },
    images: {
      type: [ImageSchema], // Array de ImageSchema
      default: [],
      validate: {
        validator: function (images: IImages[]) {
          return images.length <= 8; // Límite de 10 imágenes por producto
        },
        message: "No se pueden agregar más de 10 imágenes por producto",
      },
    },
    sku: {
      type: String,
      unique: true,
      // sparse: true, // Permite múltiples documentos con sku null/undefined
      trim: true,
      uppercase: true,
      maxlength: [50, "El SKU no puede tener más de 50 caracteres"],
    },
    specs: {
      type: [SpecSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      required: [true, "La cantidad es requerida"],
      min: [0, "La cantidad no puede ser negativa"],
      default: 0,
    },
    // includeTax: {
    //   type: Boolean,
    //   default: false,
    // },
    // tax: {
    //   type: Number,
    //   min: [0, "El impuesto no puede ser negativo"],
    //   max: [100, "El impuesto no puede ser mayor a 100%"],
    //   validate: {
    //     validator: function (v: number) {
    //       return v == null || (v >= 0 && v <= 100);
    //     },
    //     message: "El impuesto debe estar entre 0 y 100",
    //   },
    // },
    free_shipping: {
      type: Boolean,
      default: true,
    },
    warranty: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<IBundles>("Bundles", BundlesSchema);
