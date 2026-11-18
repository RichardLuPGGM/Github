"use strict";
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
const vitest_1 = require("vitest");
const suppliersRepo_1 = require("./suppliersRepo");
const errors_1 = require("../utils/errors");
// Mock the getDatabase function first
vitest_1.vi.mock('../db/sqlite', () => ({
    getDatabase: vitest_1.vi.fn()
}));
// Import the mocked module
const sqlite_1 = require("../db/sqlite");
(0, vitest_1.describe)('SuppliersRepository', () => {
    let repository;
    let mockDb;
    (0, vitest_1.beforeEach)(() => {
        // Create mock database connection
        mockDb = {
            db: {},
            run: vitest_1.vi.fn(),
            get: vitest_1.vi.fn(),
            all: vitest_1.vi.fn(),
            close: vitest_1.vi.fn()
        };
        // Mock getDatabase to return our mock
        sqlite_1.getDatabase.mockResolvedValue(mockDb);
        repository = new suppliersRepo_1.SuppliersRepository(mockDb);
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('findAll', () => {
        (0, vitest_1.it)('should return all suppliers', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResults = [
                { supplier_id: 1, name: 'Test Supplier', description: 'Test', contact_person: 'John', email: 'john@test.com', phone: '555-1234', active: true, verified: true }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = yield repository.findAll();
            (0, vitest_1.expect)(mockDb.all).toHaveBeenCalledWith('SELECT * FROM suppliers ORDER BY supplier_id');
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].supplierId).toBe(1);
            (0, vitest_1.expect)(result[0].name).toBe('Test Supplier');
        }));
        (0, vitest_1.it)('should return empty array when no suppliers exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.all.mockResolvedValue([]);
            const result = yield repository.findAll();
            (0, vitest_1.expect)(result).toEqual([]);
        }));
    });
    (0, vitest_1.describe)('findById', () => {
        (0, vitest_1.it)('should return supplier when found', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResult = {
                supplier_id: 1,
                name: 'Test Supplier',
                description: 'Test',
                contact_person: 'John',
                email: 'john@test.com',
                phone: '555-1234',
                active: true,
                verified: true
            };
            mockDb.get.mockResolvedValue(mockResult);
            const result = yield repository.findById(1);
            (0, vitest_1.expect)(mockDb.get).toHaveBeenCalledWith('SELECT * FROM suppliers WHERE supplier_id = ?', [1]);
            (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.supplierId).toBe(1);
            (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.name).toBe('Test Supplier');
        }));
        (0, vitest_1.it)('should return null when supplier not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.get.mockResolvedValue(undefined);
            const result = yield repository.findById(999);
            (0, vitest_1.expect)(result).toBeNull();
        }));
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create a new supplier and return it', () => __awaiter(void 0, void 0, void 0, function* () {
            const newSupplier = {
                name: 'New Supplier',
                description: 'New Description',
                contactPerson: 'Jane Doe',
                email: 'jane@test.com',
                phone: '555-5678',
                active: true,
                verified: false
            };
            mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
            mockDb.get.mockResolvedValue({
                supplier_id: 2,
                name: 'New Supplier',
                description: 'New Description',
                contact_person: 'Jane Doe',
                email: 'jane@test.com',
                phone: '555-5678',
                active: true,
                verified: false
            });
            const result = yield repository.create(newSupplier);
            (0, vitest_1.expect)(mockDb.run).toHaveBeenCalledWith('INSERT INTO suppliers (name, description, contact_person, email, phone, active, verified) VALUES (?, ?, ?, ?, ?, ?, ?)', ['New Supplier', 'New Description', 'Jane Doe', 'jane@test.com', '555-5678', true, false]);
            (0, vitest_1.expect)(result.supplierId).toBe(2);
            (0, vitest_1.expect)(result.name).toBe('New Supplier');
        }));
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('should update existing supplier and return updated data', () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { name: 'Updated Supplier' };
            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({
                supplier_id: 1,
                name: 'Updated Supplier',
                description: 'Test',
                contact_person: 'John',
                email: 'john@test.com',
                phone: '555-1234',
                active: true,
                verified: true
            });
            const result = yield repository.update(1, updateData);
            (0, vitest_1.expect)(mockDb.run).toHaveBeenCalledWith('UPDATE suppliers SET name = ? WHERE supplier_id = ?', ['Updated Supplier', 1]);
            (0, vitest_1.expect)(result.name).toBe('Updated Supplier');
        }));
        (0, vitest_1.it)('should throw NotFoundError when supplier does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.run.mockResolvedValue({ changes: 0 });
            yield (0, vitest_1.expect)(repository.update(999, { name: 'Updated' }))
                .rejects.toThrow(errors_1.NotFoundError);
        }));
    });
    (0, vitest_1.describe)('delete', () => {
        (0, vitest_1.it)('should delete existing supplier', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.run.mockResolvedValue({ changes: 1 });
            yield repository.delete(1);
            (0, vitest_1.expect)(mockDb.run).toHaveBeenCalledWith('DELETE FROM suppliers WHERE supplier_id = ?', [1]);
        }));
        (0, vitest_1.it)('should throw NotFoundError when supplier does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.run.mockResolvedValue({ changes: 0 });
            yield (0, vitest_1.expect)(repository.delete(999))
                .rejects.toThrow(errors_1.NotFoundError);
        }));
    });
    (0, vitest_1.describe)('exists', () => {
        (0, vitest_1.it)('should return true when supplier exists', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.get.mockResolvedValue({ count: 1 });
            const result = yield repository.exists(1);
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(mockDb.get).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM suppliers WHERE supplier_id = ?', [1]);
        }));
        (0, vitest_1.it)('should return false when supplier does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.get.mockResolvedValue({ count: 0 });
            const result = yield repository.exists(999);
            (0, vitest_1.expect)(result).toBe(false);
        }));
    });
    (0, vitest_1.describe)('findByName', () => {
        (0, vitest_1.it)('should return suppliers matching name pattern', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResults = [
                { supplier_id: 1, name: 'Test Supplier', description: 'Test', contact_person: 'John', email: 'john@test.com', phone: '555-1234', active: true, verified: true }
            ];
            mockDb.all.mockResolvedValue(mockResults);
            const result = yield repository.findByName('Test');
            (0, vitest_1.expect)(mockDb.all).toHaveBeenCalledWith('SELECT * FROM suppliers WHERE name LIKE ? ORDER BY name', ['%Test%']);
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].name).toBe('Test Supplier');
        }));
    });
});
