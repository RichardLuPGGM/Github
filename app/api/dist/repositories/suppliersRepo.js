"use strict";
/**
 * Repository for suppliers data access
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
exports.SuppliersRepository = void 0;
exports.createSuppliersRepository = createSuppliersRepository;
exports.getSuppliersRepository = getSuppliersRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class SuppliersRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all suppliers
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM suppliers ORDER BY supplier_id');
                return (0, sql_1.mapDatabaseRows)(rows).map(this.convertBooleanFields);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get supplier by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);
                return row ? this.convertBooleanFields((0, sql_1.objectToCamelCase)(row)) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Convert integer fields to boolean for SQLite compatibility
     */
    convertBooleanFields(supplier) {
        return Object.assign(Object.assign({}, supplier), { active: Boolean(supplier.active), verified: Boolean(supplier.verified) });
    }
    /**
     * Create a new supplier
     */
    create(supplier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('suppliers', supplier);
                const result = yield this.db.run(sql, values);
                const createdSupplier = yield this.findById(result.lastID || 0);
                if (!createdSupplier) {
                    throw new Error('Failed to retrieve created supplier');
                }
                return createdSupplier;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update supplier by ID
     */
    update(id, supplier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('suppliers', supplier, 'supplier_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Supplier', id);
                }
                const updatedSupplier = yield this.findById(id);
                if (!updatedSupplier) {
                    throw new Error('Failed to retrieve updated supplier');
                }
                return updatedSupplier;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Supplier', id);
            }
        });
    }
    /**
     * Delete supplier by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM suppliers WHERE supplier_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Supplier', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Supplier', id);
            }
        });
    }
    /**
     * Check if supplier exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM suppliers WHERE supplier_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find suppliers by name (partial match)
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM suppliers WHERE name LIKE ? ORDER BY name', [`%${name}%`]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
}
exports.SuppliersRepository = SuppliersRepository;
// Factory function to create repository instance
function createSuppliersRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new SuppliersRepository(db);
    });
}
// Singleton instance for default usage
let suppliersRepo = null;
function getSuppliersRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
        if (isTestEnv) {
            return createSuppliersRepository(true);
        }
        if (!suppliersRepo) {
            suppliersRepo = yield createSuppliersRepository(false);
        }
        return suppliersRepo;
    });
}
