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
const express_1 = __importDefault(require("express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const delivery_1 = __importDefault(require("./routes/delivery"));
const orderDetailDelivery_1 = __importDefault(require("./routes/orderDetailDelivery"));
const product_1 = __importDefault(require("./routes/product"));
const orderDetail_1 = __importDefault(require("./routes/orderDetail"));
const order_1 = __importDefault(require("./routes/order"));
const branch_1 = __importDefault(require("./routes/branch"));
const headquarters_1 = __importDefault(require("./routes/headquarters"));
const supplier_1 = __importDefault(require("./routes/supplier"));
const init_db_1 = require("./init-db");
const errors_1 = require("./utils/errors");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Parse CORS origins from environment variable if available
const corsOrigins = process.env.API_CORS_ORIGINS
    ? process.env.API_CORS_ORIGINS.split(',')
    : [
        'http://localhost:5137',
        'http://localhost:3001',
        'http://127.0.0.1:5137',
        'http://127.0.0.1:3001',
        // Allow all Codespace domains
        /^https:\/\/.*\.app\.github\.dev$/,
        // Allow all Azure Container Apps domains
        /^https:\/\/.*\.azurecontainerapps\.io$/,
    ];
console.log('Configured CORS origins:', corsOrigins);
// Enable CORS for the frontend
app.use((0, cors_1.default)({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express API with Swagger',
            version: '1.0.0',
            description: 'REST API documentation using Swagger/OpenAPI',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Development server (HTTP)',
            },
            {
                url: `https://localhost:${port}`,
                description: 'Development server (HTTPS)',
            },
        ],
    },
    apis: ['./src/models/*.ts', './src/routes/*.ts'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});
app.use(express_1.default.json());
app.use('/api/deliveries', delivery_1.default);
app.use('/api/order-detail-deliveries', orderDetailDelivery_1.default);
app.use('/api/products', product_1.default);
app.use('/api/order-details', orderDetail_1.default);
app.use('/api/orders', order_1.default);
app.use('/api/branches', branch_1.default);
app.use('/api/headquarters', headquarters_1.default);
app.use('/api/suppliers', supplier_1.default);
app.get('/', (req, res) => {
    res.send('Hello, world!');
});
// Add error handling middleware
app.use(errors_1.errorHandler);
// Initialize database and start server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🚀 Initializing database...');
            yield (0, init_db_1.initializeDatabase)(true); // Always attempt seeding - the seeder checks if it's needed
            console.log('✅ Database initialized successfully');
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
                console.log(`API documentation is available at http://localhost:${port}/api-docs`);
            });
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    });
}
startServer();
