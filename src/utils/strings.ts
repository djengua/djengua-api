/**
 * Genera un texto aleatorio de 6 caracteres usando letras y números
 * @returns {string} Cadena aleatoria de 6 caracteres
 */
export function generateRandomText(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Versión más compacta usando crypto para mayor aleatoriedad (Node.js)
 * @returns {string} Cadena aleatoria de 6 caracteres
 */
export function generateSecureRandomText(): string {
  const crypto = require('crypto');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    result += characters[randomIndex];
  }
  
  return result;
}

/**
 * Versión que permite personalizar caracteres y longitud
 * @param length - Longitud deseada (por defecto 6)
 * @param customChars - Caracteres personalizados a usar
 * @returns {string} Cadena aleatoria
 */
export function generateCustomRandomText(
  length: number = 6, 
  customChars?: string
): string {
  const characters = customChars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Ejemplos de uso:
// console.log(generateRandomText()); // ej: "A3kL9m"
// console.log(generateSecureRandomText()); // ej: "Zx8P2q"
// console.log(generateCustomRandomText(8, 'ABCDEF123')); // ej: "A3B1F2DE"