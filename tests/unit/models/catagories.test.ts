import Category, { ICategory } from '../../../src/models/category';
import { connectTestDB, closeTestDB, clearTestDB } from '../../helpers/database';
import { createTestUser } from '../../helpers/testData';

describe('Category Model', () => {
  let testUser: any;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    testUser = await createTestUser();
  });

  describe('Validation', () => {
    it('should create a valid category', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
        userId: testUser._id,
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.description).toBe(categoryData.description);
      expect(savedCategory.isActive).toBe(true);
      expect(savedCategory.createdAt).toBeDefined();
    });

    it('should fail validation without name', async () => {
      const category = new Category({
        description: 'Test description',
        userId: testUser._id,
      });

      await expect(category.save()).rejects.toThrow('Por favor agregue un nombre');
    });

    it('should fail validation with name too long', async () => {
      const category = new Category({
        name: 'a'.repeat(51),
        description: 'Test description',
        userId: testUser._id,
      });

      await expect(category.save()).rejects.toThrow('El nombre no puede tener más de 50 caracteres');
    });
  });

  describe('Schema transformations', () => {
    it('should transform _id to id in JSON', async () => {
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test description',
        userId: testUser._id,
      });

      const json = category.toJSON();
      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });
  });
});