import bcrypt from 'bcryptjs';
import User from '../../src/models/user';
import Category from '../../src/models/category';
import { generateToken } from '../../src/utils/jwt.utils';

export const createTestUser = async (userData: any = {}) => {
  const defaultUser = {
    name: 'Test User',
    lastName: 'Test LastName',
    email: 'test@example.com',
    password: 'password123', // Se hasheará automáticamente por el pre-save hook
    role: 'user',
    isActive: true,
    ...userData
  };

  return await User.create(defaultUser);
};

export const generateTestToken = (userId: string, role: string = 'user', email: string = 'test@example.com'): string => {
  // Usar la misma función que usa tu aplicación
  return generateToken(userId, role, email);
};

export const createTestCategory = async (categoryData: any = {}) => {
  const defaultCategory = {
    name: 'Test Category',
    description: 'Test description',
    isActive: true,
    ...categoryData
  };

  return await Category.create(defaultCategory);
};

// Helper para debugging
export const debugToken = (token: string) => {
  try {
    const { verifyToken } = require('../../src/utils/jwt.utils');
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    console.log('Token error:', error);
    return null;
  }
};