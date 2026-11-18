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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const branch_1 = __importDefault(require("./branch"));
const migrate_1 = require("../db/migrate");
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
let app;
(0, vitest_1.describe)('Branch API', () => {
    (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        // Ensure a fresh in-memory database for each test
        yield (0, sqlite_1.closeDatabase)();
        yield (0, sqlite_1.getDatabase)(true);
        yield (0, migrate_1.runMigrations)(true);
        // Seed required foreign key: headquarters id 1
        const db = yield (0, sqlite_1.getDatabase)();
        yield db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
        // Set up express app
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/branches', branch_1.default);
        // Attach error handler to translate repo errors
        app.use(errors_1.errorHandler);
    }));
    (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sqlite_1.closeDatabase)();
    }));
    (0, vitest_1.it)('should create a new branch', () => __awaiter(void 0, void 0, void 0, function* () {
        const newBranch = {
            headquartersId: 1,
            name: 'Eastside Branch',
            description: 'Eastern district branch',
            address: '321 East St',
            contactPerson: 'Emma Davis',
            email: 'edavis@octo.com',
            phone: '555-0203',
        };
        const response = yield (0, supertest_1.default)(app).post('/branches').send(newBranch);
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(response.body).toMatchObject(newBranch);
        (0, vitest_1.expect)(response.body.branchId).toBeDefined();
    }));
    (0, vitest_1.it)('should get all branches', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/branches');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(response.body)).toBe(true);
    }));
    (0, vitest_1.it)('should get a branch by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        // First create a branch to test getting it
        const newBranch = {
            headquartersId: 1,
            name: 'Test Branch',
            description: 'Test branch',
            address: '123 Test St',
            contactPerson: 'Test Person',
            email: 'test@test.com',
            phone: '555-0000',
        };
        const createResponse = yield (0, supertest_1.default)(app).post('/branches').send(newBranch);
        const branchId = createResponse.body.branchId;
        const response = yield (0, supertest_1.default)(app).get(`/branches/${branchId}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.branchId).toBe(branchId);
    }));
    (0, vitest_1.it)('should update a branch by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        // First create a branch to test updating it
        const newBranch = {
            headquartersId: 1,
            name: 'Original Branch',
            description: 'Original description',
            address: '123 Original St',
            contactPerson: 'Original Person',
            email: 'original@test.com',
            phone: '555-0001',
        };
        const createResponse = yield (0, supertest_1.default)(app).post('/branches').send(newBranch);
        const branchId = createResponse.body.branchId;
        const updatedBranch = Object.assign(Object.assign({}, newBranch), { name: 'Updated Branch Name' });
        const response = yield (0, supertest_1.default)(app).put(`/branches/${branchId}`).send(updatedBranch);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.name).toBe('Updated Branch Name');
    }));
    (0, vitest_1.it)('should delete a branch by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        // First create a branch to test deleting it
        const newBranch = {
            headquartersId: 1,
            name: 'Delete Me Branch',
            description: 'This branch will be deleted',
            address: '123 Delete St',
            contactPerson: 'Delete Person',
            email: 'delete@test.com',
            phone: '555-9999',
        };
        const createResponse = yield (0, supertest_1.default)(app).post('/branches').send(newBranch);
        const branchId = createResponse.body.branchId;
        const response = yield (0, supertest_1.default)(app).delete(`/branches/${branchId}`);
        (0, vitest_1.expect)(response.status).toBe(204);
    }));
    (0, vitest_1.it)('should return 404 for non-existing branch', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/branches/999');
        (0, vitest_1.expect)(response.status).toBe(404);
    }));
});
