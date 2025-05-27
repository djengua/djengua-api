// src/utils/jwt.utils.ts
import jwt from 'jsonwebtoken';

// Definir interfaces específicas para evitar problemas de tipado
interface JwtPayload {
  id: string;
  [key: string]: any;
}

/**
 * Genera un token JWT con el ID proporcionado
 * @param id ID del usuario
 * @returns Token JWT firmado
 */
export const generateToken = (id: string, role: string, activeCompany: string, email: string): string => {
  // Verificar que existe el secreto JWT
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  // Configurar tiempo de expiración
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  
  try {
    // Utilizar cast explícito para el secreto
    // @ts-ignore - Ignorar errores de tipo para esta línea específica
    console.log(id, role, activeCompany, email);
    return jwt.sign({ id, role, activeCompany, email }, secret, { expiresIn });
  } catch (error) {
    console.error('Error al generar JWT:', error);
    throw new Error('No se pudo generar el token JWT');
  }
};

/**
 * Verifica y decodifica un token JWT
 * @param token Token JWT a verificar
 * @returns Payload decodificado o null si hay un error
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    
    // Utilizar cast explícito para el secreto
    // @ts-ignore - Ignorar errores de tipo para esta línea específica
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Error al verificar JWT:', error);
    return null;
  }
};