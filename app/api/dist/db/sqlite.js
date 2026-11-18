"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SQLite database connection and helper functions
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = exports.SQLiteHelper = void 0;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
/*
 * Database connection and query execution
 * Wraps better-sqlite3 Database to maintain API compatibility
 */
class DatabaseConnection {
    constructor(db) {
        this.db = db;
    }
    /**
     * Execute a SQL statement that modifies data (INSERT, UPDATE, DELETE)
     * @param sql SQL statement to execute
     * @param params Parameters to bind to the SQL statement
     * @returns Object containing lastID (for INSERT) and number of changes
     * @throws Error if lastInsertRowid exceeds JavaScript's safe integer range
     * @note better-sqlite3 returns lastInsertRowid as number | bigint. We convert bigint to number
     *       and validate it's within safe integer range to prevent silent truncation.
     */
    run(sql, params = []) {
        const info = this.db.prepare(sql).run(...params);
        const lastID = info.lastInsertRowid;
        // Convert bigint to number with safety check to prevent silent truncation
        if (typeof lastID === 'bigint') {
            if (lastID > Number.MAX_SAFE_INTEGER || lastID < Number.MIN_SAFE_INTEGER) {
                throw new Error(`Row ID ${lastID} exceeds safe integer range (${Number.MIN_SAFE_INTEGER} to ${Number.MAX_SAFE_INTEGER})`);
            }
            return Promise.resolve({ lastID: Number(lastID), changes: info.changes });
        }
        return Promise.resolve({ lastID, changes: info.changes });
    }
    get(sql, params = []) {
        const row = this.db.prepare(sql).get(...params);
        return Promise.resolve(row);
    }
    all(sql, params = []) {
        const rows = this.db.prepare(sql).all(...params);
        return Promise.resolve(rows);
    }
    close() {
        this.db.close();
        return Promise.resolve();
    }
}
exports.DatabaseConnection = DatabaseConnection;
class SQLiteHelper {
    constructor() {
        this.connection = null;
    }
    static getInstance() {
        if (!SQLiteHelper.instance) {
            SQLiteHelper.instance = new SQLiteHelper();
        }
        return SQLiteHelper.instance;
    }
    /**
     * Initialize database connection
     */
    connect() {
        return __awaiter(this, arguments, void 0, function* (isTest = false) {
            const config = isTest ? config_1.TEST_DB_CONFIG : config_1.DB_CONFIG;
            // Ensure data directory exists for file-based databases
            if (config.DB_FILE !== ':memory:') {
                const dataDir = path_1.default.dirname(config.DB_FILE);
                if (!fs_1.default.existsSync(dataDir)) {
                    fs_1.default.mkdirSync(dataDir, { recursive: true });
                }
            }
            try {
                // better-sqlite3 constructor options
                const options = {
                    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
                    timeout: config.TIMEOUT
                };
                this.connection = new better_sqlite3_1.default(config.DB_FILE, options);
                // Configure database settings
                this.setupDatabase(config);
                const wrappedConnection = this.wrapConnection(this.connection);
                return wrappedConnection;
            }
            catch (err) {
                throw new Error(`Failed to connect to database: ${err.message}`);
            }
        });
    }
    /**
     * Configure database settings
     */
    setupDatabase(config) {
        if (!this.connection)
            return;
        // Enable foreign key constraints
        if (config.FOREIGN_KEYS) {
            try {
                this.connection.pragma('foreign_keys = ON');
            }
            catch (err) {
                throw new Error(`Failed to enable foreign key constraints: ${err.message}`);
            }
        }
        // Enable WAL mode for better concurrency (only for file databases)
        if (config.ENABLE_WAL && config.DB_FILE !== ':memory:') {
            try {
                this.connection.pragma('journal_mode = WAL');
            }
            catch (err) {
                throw new Error(`Failed to enable WAL mode: ${err.message}`);
            }
        }
    }
    /**
     * Wrap the database connection with promisified methods
     */
    wrapConnection(db) {
        return new DatabaseConnection(db);
    }
    /**
     * Close database connection
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                try {
                    this.connection.close();
                    this.connection = null;
                }
                catch (err) {
                    throw new Error(`Failed to close database: ${err.message}`);
                }
            }
        });
    }
}
exports.SQLiteHelper = SQLiteHelper;
// Global database connection instance
let dbConnection = null;
/**
 * Get the global database connection
 */
function getDatabase() {
    return __awaiter(this, arguments, void 0, function* (isTest = false) {
        if (!dbConnection) {
            const helper = SQLiteHelper.getInstance();
            dbConnection = yield helper.connect(isTest);
        }
        return dbConnection;
    });
}
/**
 * Close the global database connection
 */
function closeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (dbConnection) {
            yield dbConnection.close();
            dbConnection = null;
        }
    });
}
