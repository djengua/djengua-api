// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
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
  },
  {
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { 
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
