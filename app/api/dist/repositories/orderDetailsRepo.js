"use strict";
/**
 * Repository for order details data access
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
exports.OrderDetailsRepository = void 0;
exports.createOrderDetailsRepository = createOrderDetailsRepository;
exports.getOrderDetailsRepository = getOrderDetailsRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class OrderDetailsRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all order details
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM order_details ORDER BY order_detail_id');
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get order detail by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM order_details WHERE order_detail_id = ?', [
                    id,
                ]);
                return row ? (0, sql_1.objectToCamelCase)(row) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Create a new order detail
     */
    create(orderDetail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('order_details', orderDetail);
                const result = yield this.db.run(sql, values);
                const createdOrderDetail = yield this.findById(result.lastID || 0);
                if (!createdOrderDetail) {
                    throw new Error('Failed to retrieve created order detail');
                }
                return createdOrderDetail;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update order detail by ID
     */
    update(id, orderDetail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('order_details', orderDetail, 'order_detail_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('OrderDetail', id);
                }
                const updatedOrderDetail = yield this.findById(id);
                if (!updatedOrderDetail) {
                    throw new Error('Failed to retrieve updated order detail');
                }
                return updatedOrderDetail;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'OrderDetail', id);
            }
        });
    }
    /**
     * Delete order detail by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM order_details WHERE order_detail_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('OrderDetail', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'OrderDetail', id);
            }
        });
    }
    /**
     * Check if order detail exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM order_details WHERE order_detail_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find order details by order ID
     */
    findByOrderId(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM order_details WHERE order_id = ? ORDER BY order_detail_id', [orderId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find order details by product ID
     */
    findByProductId(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM order_details WHERE product_id = ? ORDER BY order_detail_id', [productId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Calculate total value for an order
     */
    getTotalValueByOrderId(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT SUM(quantity * unit_price) as total FROM order_details WHERE order_id = ?', [orderId]);
                return (result === null || result === void 0 ? void 0 : result.total) || 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
}
exports.OrderDetailsRepository = OrderDetailsRepository;
// Factory function to create repository instance
function createOrderDetailsRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new OrderDetailsRepository(db);
    });
}
// Singleton instance for default usage
let orderDetailsRepo = null;
function getOrderDetailsRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        if (!orderDetailsRepo) {
            orderDetailsRepo = yield createOrderDetailsRepository(isTest);
        }
        return orderDetailsRepo;
    });
}
