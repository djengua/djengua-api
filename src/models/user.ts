// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.utils";

export interface IUser extends Document {
  name: string;
  email: string;
  lastName: string;
  password: string;
  role: "user" | "admin" | "superadmin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  activeCompany: mongoose.Types.ObjectId;
  avatar: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(rememberMe: boolean): string;
  createdBy?: mongoose.Types.ObjectId;
  companies: mongoose.Types.ObjectId[];
  phone: string;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Por favor agregue un nombre"],
      trim: true,
      maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
    },
    lastName: {
      type: String,
      required: [true, "Por favor agregue un apellido"],
      trim: true,
      maxlength: [60, "El apellido no puede tener más de 60 caracteres"],
    },
    email: {
      type: String,
      required: [true, "Por favor agregue un email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor agregue un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "Por favor agregue una contraseña"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    activeCompany: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    avatar: {
      type: String,
      default: "/avatars/profile.jpg",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    companies: {
      type: [Schema.Types.ObjectId],
      ref: "Company",
      default: [],
    },
    phone: {
      type: String,
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

// Encriptar contraseña usando bcrypt
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Verificar si la contraseña coincide
UserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Utilizar la función auxiliar para generar el token
UserSchema.methods.getSignedJwtToken = function (rememberMe: boolean): string {
  console.log("sign");
  console.log(rememberMe);
  return generateToken(
    this.id.toString(),
    this.role.toString(),
    this.email.toString(),
    rememberMe
  );
};

export default mongoose.model<IUser>("User", UserSchema);
