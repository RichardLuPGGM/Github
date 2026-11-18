"use strict";
/**
 * Repository for orders data access
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
exports.OrdersRepository = void 0;
exports.createOrdersRepository = createOrdersRepository;
exports.getOrdersRepository = getOrdersRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class OrdersRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all orders
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM orders ORDER BY order_id');
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get order by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM orders WHERE order_id = ?', [id]);
                return row ? (0, sql_1.objectToCamelCase)(row) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Create a new order
     */
    create(order) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('orders', order);
                const result = yield this.db.run(sql, values);
                const createdOrder = yield this.findById(result.lastID || 0);
                if (!createdOrder) {
                    throw new Error('Failed to retrieve created order');
                }
                return createdOrder;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update order by ID
     */
    update(id, order) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('orders', order, 'order_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Order', id);
                }
                const updatedOrder = yield this.findById(id);
                if (!updatedOrder) {
                    throw new Error('Failed to retrieve updated order');
                }
                return updatedOrder;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Order', id);
            }
        });
    }
    /**
     * Delete order by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM orders WHERE order_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Order', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Order', id);
            }
        });
    }
    /**
     * Check if order exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM orders WHERE order_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find orders by branch ID
     */
    findByBranchId(branchId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM orders WHERE branch_id = ? ORDER BY order_date DESC', [branchId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find orders by status
     */
    findByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC', [status]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find orders by date range
     */
    findByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM orders WHERE order_date >= ? AND order_date <= ? ORDER BY order_date DESC', [startDate, endDate]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
}
exports.OrdersRepository = OrdersRepository;
// Factory function to create repository instance
function createOrdersRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new OrdersRepository(db);
    });
}
// Singleton instance for default usage
let ordersRepo = null;
function getOrdersRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
        if (isTestEnv) {
            return createOrdersRepository(true);
        }
        if (!ordersRepo) {
            ordersRepo = yield createOrdersRepository(false);
        }
        return ordersRepo;
    });
}
