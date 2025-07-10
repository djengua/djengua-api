import mongoose, { Document, Schema } from "mongoose";

export interface IImages {
  filename: string;
  url: string;
  contentType: string;
  uploadDate: string;
}

export const ImageSchema: Schema = new Schema(
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
