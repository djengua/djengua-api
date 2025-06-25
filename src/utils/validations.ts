import express from "express";
import { validationResult } from "express-validator";

export const handleValidationErrors = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => {
      // Verificar el tipo de error y acceder a las propiedades correctamente
      if (error.type === "field") {
        return {
          field: error.path, // ✅ 'path' en lugar de 'param'
          message: error.msg,
          value: error.value,
          location: error.location,
        };
      } else {
        // Para errores que no son de campo
        return {
          field: "unknown",
          message: error.msg,
          value: undefined,
          location: "unknown",
        };
      }
    });

    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: formattedErrors,
    });
  }

  next();
};