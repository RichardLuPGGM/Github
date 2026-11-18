"use strict";
/**
 * Repository for products data access
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRepository = void 0;
exports.createProductsRepository = createProductsRepository;
exports.getProductsRepository = getProductsRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class ProductsRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all products
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM products ORDER BY product_id');
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get product by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM products WHERE product_id = ?', [id]);
                return row ? (0, sql_1.objectToCamelCase)(row) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Create a new product
     */
    create(product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('products', product);
                const result = yield this.db.run(sql, values);
                const createdProduct = yield this.findById(result.lastID || 0);
                if (!createdProduct) {
                    throw new Error('Failed to retrieve created product');
                }
                return createdProduct;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update product by ID
     */
    update(id, product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('products', product, 'product_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Product', id);
                }
                const updatedProduct = yield this.findById(id);
                if (!updatedProduct) {
                    throw new Error('Failed to retrieve updated product');
                }
                return updatedProduct;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Product', id);
            }
        });
    }
    /**
     * Delete product by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM products WHERE product_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Product', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Product', id);
            }
        });
    }
    /**
     * Check if product exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM products WHERE product_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find products by supplier ID
     */
    findBySupplierId(supplierId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM products WHERE supplier_id = ? ORDER BY name', [supplierId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find products by name (partial match)
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all(`SELECT * FROM products WHERE name LIKE '%${name}%' ORDER BY name`);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
}
exports.ProductsRepository = ProductsRepository;
// Factory function to create repository instance
function createProductsRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new ProductsRepository(db);
    });
}
// Singleton instance for default usage
let productsRepo = null;
function getProductsRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        if (!productsRepo) {
            productsRepo = yield createProductsRepository(isTest);
        }
        return productsRepo;
    });
}
