import request from "supertest";
import app from "../../../src/app";
import Category from "../../../src/models/category";
import User from "../../../src/models/user";
import {
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../../helpers/database";
import {
  createTestUser,
  generateTestToken,
  debugToken,
} from "../../helpers/testData";

describe("Categories Routes", () => {
  let authToken: string;
  let adminToken: string;
  let regularUser: any;
  let adminUser: any;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    // Limpiar todas las colecciones
    await User.deleteMany({});
    await Category.deleteMany({});

    // Crear usuarios de prueba con emails únicos
    regularUser = await createTestUser({
      email: "regular@test.com",
      role: "user",
    });

    adminUser = await createTestUser({
      email: "admin@test.com",
      role: "admin",
    });

    // Generar tokens usando la función de tu aplicación
    authToken = generateTestToken(
      regularUser._id.toString(),
      regularUser.role,
      regularUser.email
    );
    adminToken = generateTestToken(
      adminUser._id.toString(),
      adminUser.role,
      adminUser.email
    );
  });

  describe("GET /api/categories", () => {
    beforeEach(async () => {
      await Category.create([
        { name: "Active Category", description: "Active", isActive: true },
        { name: "Inactive Category", description: "Inactive", isActive: false },
      ]);
    });

    it("should return all categories for admin", async () => {
      const response = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it("should return only active categories for regular user", async () => {
      const response = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].isActive).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      await request(app).get("/api/categories").expect(401);
    });

    // Test de diagnóstico
    it("should verify admin user exists and has correct role", async () => {
      const foundAdmin = await User.findById(adminUser._id);
      expect(foundAdmin).toBeTruthy();
      expect(foundAdmin?.role).toBe("admin");
      expect(foundAdmin?.isActive).toBe(true);
    });
  });

  describe("POST /api/categories", () => {
    const validCategoryData = {
      name: "New Category",
      description: "New category description",
    };

    it("should create a new category with valid data", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validCategoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(validCategoryData.name);
      expect(response.body.data.description).toBe(
        validCategoryData.description
      );
    });

    it("should return 400 with invalid data", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ description: "Missing name" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 409 for duplicate category name", async () => {
      await Category.create(validCategoryData);

      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validCategoryData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Ya existe una categoria con ese nombre"
      );
    });
  });
});
