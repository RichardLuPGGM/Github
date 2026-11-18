"use strict";
/**
 * Repository for branches data access
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
exports.BranchesRepository = void 0;
exports.createBranchesRepository = createBranchesRepository;
exports.getBranchesRepository = getBranchesRepository;
const sqlite_1 = require("../db/sqlite");
const errors_1 = require("../utils/errors");
const sql_1 = require("../utils/sql");
class BranchesRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all branches
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM branches ORDER BY branch_id');
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Get branch by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const row = yield this.db.get('SELECT * FROM branches WHERE branch_id = ?', [id]);
                return row ? (0, sql_1.objectToCamelCase)(row) : null;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Create a new branch
     */
    create(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildInsertSQL)('branches', branch);
                const result = yield this.db.run(sql, values);
                const createdBranch = yield this.findById(result.lastID || 0);
                if (!createdBranch) {
                    throw new Error('Failed to retrieve created branch');
                }
                return createdBranch;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Update branch by ID
     */
    update(id, branch) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sql, values } = (0, sql_1.buildUpdateSQL)('branches', branch, 'branch_id = ?');
                const result = yield this.db.run(sql, [...values, id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Branch', id);
                }
                const updatedBranch = yield this.findById(id);
                if (!updatedBranch) {
                    throw new Error('Failed to retrieve updated branch');
                }
                return updatedBranch;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Branch', id);
            }
        });
    }
    /**
     * Delete branch by ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.run('DELETE FROM branches WHERE branch_id = ?', [id]);
                if (result.changes === 0) {
                    throw new errors_1.NotFoundError('Branch', id);
                }
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error, 'Branch', id);
            }
        });
    }
    /**
     * Check if branch exists
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.get('SELECT COUNT(*) as count FROM branches WHERE branch_id = ?', [id]);
                return ((result === null || result === void 0 ? void 0 : result.count) || 0) > 0;
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find branches by headquarters ID
     */
    findByHeadquartersId(headquartersId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM branches WHERE headquarters_id = ? ORDER BY name', [headquartersId]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
    /**
     * Find branches by name (partial match)
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield this.db.all('SELECT * FROM branches WHERE name LIKE ? ORDER BY name', [`%${name}%`]);
                return (0, sql_1.mapDatabaseRows)(rows);
            }
            catch (error) {
                (0, errors_1.handleDatabaseError)(error);
            }
        });
    }
}
exports.BranchesRepository = BranchesRepository;
// Factory function to create repository instance
function createBranchesRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const db = yield (0, sqlite_1.getDatabase)(isTest);
        return new BranchesRepository(db);
    });
}
// Singleton instance for default usage
let branchesRepo = null;
function getBranchesRepository() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
        if (isTestEnv) {
            // In tests, always return a fresh repository bound to the current in-memory DB
            return createBranchesRepository(true);
        }
        if (!branchesRepo) {
            branchesRepo = yield createBranchesRepository(false);
        }
        return branchesRepo;
    });
}
