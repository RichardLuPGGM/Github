"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ValidationError = exports.NotFoundError = exports.DatabaseError = void 0;
exports.handleDatabaseError = handleDatabaseError;
exports.errorHandler = errorHandler;
/**
 * Error handling utilities for database operations
 */
class DatabaseError extends Error {
    constructor(message, code = 'DATABASE_ERROR', statusCode = 500) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.DatabaseError = DatabaseError;
class NotFoundError extends DatabaseError {
    constructor(entity, id) {
        super(`${entity} with ID ${id} not found`, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends DatabaseError {
    constructor(message) {
        super(`Validation error: ${message}`, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends DatabaseError {
    constructor(message) {
        super(`Conflict: ${message}`, 'CONFLICT', 409);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
/**
 * Handle database errors and convert SQLite-specific errors to appropriate types
 */
function handleDatabaseError(error, entity, id) {
    if (!(error instanceof DatabaseError)) {
        const message = error instanceof Error ? error.message : error;
        // Default to generic database error
        throw new DatabaseError(`Database operation failed: ${message}`, 'DATABASE_ERROR', 500);
    }
    // SQLite constraint violation (UNIQUE, FOREIGN KEY, etc.)
    if (error.code === 'SQLITE_CONSTRAINT') {
        if (error.message.includes('UNIQUE')) {
            throw new ConflictError('Resource already exists');
        }
        if (error.message.includes('FOREIGN KEY')) {
            throw new ValidationError('Invalid reference to related entity');
        }
        throw new ValidationError(error.message);
    }
    // SQLite busy/locked database
    if (error.code === 'SQLITE_BUSY') {
        throw new DatabaseError('Database is temporarily unavailable', 'DATABASE_BUSY', 503);
    }
    // Handle case where no rows were affected (for updates/deletes)
    if (error.message && error.message.includes('No rows affected') && entity && id) {
        throw new NotFoundError(entity, id);
    }
    throw error;
}
/**
 * Express error handler middleware for database errors
 */
function errorHandler(error, _req, res, _next) {
    if (error instanceof DatabaseError) {
        res.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
            },
        });
        return;
    }
    // Default error handling
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}
