"use strict";
/**
 * Database initialization script
 * This script runs migrations and optionally seeds the database
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
exports.initializeDatabase = initializeDatabase;
const migrate_1 = require("./db/migrate");
const seed_1 = require("./db/seed");
const sqlite_1 = require("./db/sqlite");
function initializeDatabase() {
    return __awaiter(this, arguments, void 0, function* (shouldSeed = true) {
        console.log('🚀 Initializing database...');
        try {
            // Run migrations
            yield (0, migrate_1.runMigrations)();
            // Seed database if requested
            if (shouldSeed) {
                yield (0, seed_1.seedDatabase)();
            }
            console.log('✅ Database initialization complete!');
        }
        catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
        finally {
            yield (0, sqlite_1.closeDatabase)();
        }
    });
}
// Run if called directly
if (require.main === module) {
    const shouldSeed = process.argv.includes('--seed') || process.argv.includes('-s');
    initializeDatabase(shouldSeed)
        .then(() => {
        console.log('Database initialization completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Database initialization failed:', error);
        process.exit(1);
    });
}
