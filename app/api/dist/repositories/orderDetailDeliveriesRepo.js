"use strict";
/**
 * Repository for order detail deliveries data access
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
exports.OrderDetailDeliveriesRepository = void 0;
exports.createOrderDetailDeliveriesRepository = createOrderDetailDeliveriesRepository;
exports.getOrderDetailDeliveriesRepository = getOrderDetailDeliveriesRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class OrderDetailDeliveriesRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all order detail deliveries
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM order_detail_deliveries ORDER BY order_detail_delivery_id');
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get order detail delivery by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM order_detail_deliveries WHERE order_detail_delivery_id = ?', [id]);
                return row ? (0, sql_1.objectToCamelCase)(row) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Create a new order detail delivery
     */
    create(orderDetailDelivery) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('order_detail_deliveries', orderDetailDelivery);
                const result = yield this.db.run(sql, values);
                const createdOrderDetailDelivery = yield this.findById(result.lastID || 0);
                if (!createdOrderDetailDelivery) {
                    throw new Error('Failed to retrieve created order detail delivery');
                }
                return createdOrderDetailDelivery;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update order detail delivery by ID
     */
    update(id, orderDetailDelivery) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('order_detail_deliveries', orderDetailDelivery, 'order_detail_delivery_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('OrderDetailDelivery', id);
                }
                const updatedOrderDetailDelivery = yield this.findById(id);
                if (!updatedOrderDetailDelivery) {
                    throw new Error('Failed to retrieve updated order detail delivery');
                }
                return updatedOrderDetailDelivery;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'OrderDetailDelivery', id);
            }
        });
    }
    /**
     * Delete order detail delivery by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM order_detail_deliveries WHERE order_detail_delivery_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('OrderDetailDelivery', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'OrderDetailDelivery', id);
            }
        });
    }
    /**
     * Check if order detail delivery exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM order_detail_deliveries WHERE order_detail_delivery_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find order detail deliveries by order detail ID
     */
    findByOrderDetailId(orderDetailId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM order_detail_deliveries WHERE order_detail_id = ? ORDER BY order_detail_delivery_id', [orderDetailId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find order detail deliveries by delivery ID
     */
    findByDeliveryId(deliveryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM order_detail_deliveries WHERE delivery_id = ? ORDER BY order_detail_delivery_id', [deliveryId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get total quantity delivered for an order detail
     */
    getTotalQuantityByOrderDetailId(orderDetailId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT SUM(quantity) as total FROM order_detail_deliveries WHERE order_detail_id = ?', [orderDetailId]);
                return (result === null || result === void 0 ? void 0 : result.total) || 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
}
exports.OrderDetailDeliveriesRepository = OrderDetailDeliveriesRepository;
// Factory function to create repository instance
function createOrderDetailDeliveriesRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new OrderDetailDeliveriesRepository(db);
    });
}
// Singleton instance for default usage
let orderDetailDeliveriesRepo = null;
function getOrderDetailDeliveriesRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        if (!orderDetailDeliveriesRepo) {
            orderDetailDeliveriesRepo = yield createOrderDetailDeliveriesRepository(isTest);
        }
        return orderDetailDeliveriesRepo;
    });
}
