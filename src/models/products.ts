// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IImages {
  filename: string;
  url: string;
  contentType: string;
  uploadDate: string;
}

export interface IColors {
  color: string;
  name: string;
}

export interface ISpec {
  name: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  images?: IImages[];
  quantity: number;
  price: number;
  cost?: number;
  sku?: string;
  size?: string;
  color?: string;
  published: boolean;
  includeTax: boolean;
  tax?: number;
  highlight: boolean;
  offer?: number;
  rating: number;
  specs?: ISpec[];
}

const ColorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del color es requerido"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "El valor hexadecimal del color es requerido"],
      trim: true,
    },
  },
  { _id: true }
);

const SpecSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la especificacion es requerido"],
      trim: true,
    },
    value: {
      type: String,
      required: [true, "El valor de la especificacion es requerido"],
      trim: true,
    },
  },
  { _id: true }
);

const ImageSchema: Schema = new Schema(
  {
    filename: {
      type: String,
      required: [true, "El nombre del archivo es requerido"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "La URL de la imagen es requerida"],
      trim: true,
    },
    contentType: {
      type: String,
      required: [true, "El tipo de contenido es requerido"],
      enum: {
        values: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
        ],
        message:
          "Tipo de imagen no válido. Solo se permiten: jpeg, jpg, png, webp, gif",
      },
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ProductSchema: Schema = new Schema(
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
      maxlength: [500, "La descripcion no puede tener más de 500 caracteres"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario creador es requerido"],
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
    cost: {
      type: Number,
      min: [0, "El costo no puede ser negativo"],
      validate: {
        validator: function (v: number) {
          return v == null || v >= 0;
        },
        message: "El costo debe ser mayor o igual a 0",
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
    size: {
      type: String,
      trim: true,
      enum: {
        values: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "XXL",
          "XXXL",
          "ONE_SIZE",
          "CUSTOM",
        ],
        message: "La talla {VALUE} no es válida",
      },
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, "El color no puede tener más de 30 caracteres"],
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    includeTax: {
      type: Boolean,
      default: false,
    },
    tax: {
      type: Number,
      min: [0, "El impuesto no puede ser negativo"],
      max: [100, "El impuesto no puede ser mayor a 100%"],
      validate: {
        validator: function (v: number) {
          return v == null || (v >= 0 && v <= 100);
        },
        message: "El impuesto debe estar entre 0 y 100",
      },
    },
    specs: {
      type: [SpecSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
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

ProductSchema.index({ companyId: 1, isActive: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ published: 1, isActive: 1 });

export default mongoose.model<IProduct>("Product", ProductSchema);
