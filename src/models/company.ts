// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICompany extends Document {
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario creador es requerido"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>("Company", CompanySchema);
