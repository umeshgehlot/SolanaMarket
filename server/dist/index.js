"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const schema_1 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const logger_1 = require("./utils/logger");
const database_1 = __importDefault(require("./config/database"));
// Load environment variables
dotenv_1.default.config();
async function startServer() {
    // Connect to MongoDB
    await (0, database_1.default)();
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).send('Server is healthy');
    });
    // Apollo Server setup
    const apolloServer = new apollo_server_express_1.ApolloServer({
        typeDefs: schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        context: ({ req }) => {
            // Extract user info from request headers
            // In a real implementation, this would verify the JWT token
            // and extract the user information
            const authHeader = req.headers.authorization;
            let user = null;
            if (authHeader) {
                // Mock user for development
                user = {
                    id: 'user-1',
                    walletAddress: 'mock-wallet-address',
                    username: 'Test User'
                };
            }
            return { user };
        },
        formatError: (error) => {
            logger_1.logger.error('GraphQL Error:', error);
            // In production, hide internal error details
            return {
                message: error.message,
                path: error.path,
                extensions: process.env.NODE_ENV === 'production'
                    ? { code: error.extensions?.code || 'INTERNAL_SERVER_ERROR' }
                    : error.extensions,
            };
        },
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: app, path: '/graphql' });
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        logger_1.logger.info(`Server running at http://localhost:${PORT}`);
        logger_1.logger.info(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
}
startServer().catch((error) => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
