// src/models/Specs.ts
import { Schema } from "mongoose";

export interface ISpec {
  name: string;
  value: string;
}

export const SpecSchema: Schema = new Schema(
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
