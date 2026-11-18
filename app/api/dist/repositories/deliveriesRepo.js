"use strict";
/**
 * Repository for deliveries data access
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
exports.DeliveriesRepository = void 0;
exports.createDeliveriesRepository = createDeliveriesRepository;
exports.getDeliveriesRepository = getDeliveriesRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class DeliveriesRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all deliveries
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM deliveries ORDER BY delivery_id');
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get delivery by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM deliveries WHERE delivery_id = ?', [id]);
                return row ? (0, sql_1.objectToCamelCase)(row) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Create a new delivery
     */
    create(delivery) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('deliveries', delivery);
                const result = yield this.db.run(sql, values);
                const createdDelivery = yield this.findById(result.lastID || 0);
                if (!createdDelivery) {
                    throw new Error('Failed to retrieve created delivery');
                }
                return createdDelivery;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update delivery by ID
     */
    update(id, delivery) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('deliveries', delivery, 'delivery_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Delivery', id);
                }
                const updatedDelivery = yield this.findById(id);
                if (!updatedDelivery) {
                    throw new Error('Failed to retrieve updated delivery');
                }
                return updatedDelivery;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Delivery', id);
            }
        });
    }
    /**
     * Delete delivery by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM deliveries WHERE delivery_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Delivery', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Delivery', id);
            }
        });
    }
    /**
     * Check if delivery exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM deliveries WHERE delivery_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find deliveries by supplier ID
     */
    findBySupplierId(supplierId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM deliveries WHERE supplier_id = ? ORDER BY delivery_date DESC', [supplierId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find deliveries by status
     */
    findByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM deliveries WHERE status = ? ORDER BY delivery_date DESC', [status]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find deliveries by date range
     */
    findByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM deliveries WHERE delivery_date >= ? AND delivery_date <= ? ORDER BY delivery_date DESC', [startDate, endDate]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update delivery status
     */
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.update(id, { status });
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Delivery', id);
            }
        });
    }
}
exports.DeliveriesRepository = DeliveriesRepository;
// Factory function to create repository instance
function createDeliveriesRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new DeliveriesRepository(db);
    });
}
// Singleton instance for default usage
let deliveriesRepo = null;
function getDeliveriesRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
        if (isTestEnv) {
            return createDeliveriesRepository(true);
        }
        if (!deliveriesRepo) {
            deliveriesRepo = yield createDeliveriesRepository(false);
        }
        return deliveriesRepo;
    });
}
