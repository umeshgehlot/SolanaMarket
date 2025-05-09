import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { logger } from './utils/logger';
import connectDB from './config/database';
import { Context } from './types/context';

// Load environment variables
dotenv.config();

async function startServer() {
  // Connect to MongoDB
  await connectDB();
  const app = express();
  
  // Middleware
  app.use(cors({
    origin: 'http://localhost:3001', // Allow requests from the frontend
    credentials: true, // Allow cookies and authorization headers
  }));
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
  });

  // Apollo Server setup
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { req: express.Request }) => {
      // Extract user info from request headers
      // In a real implementation, this would verify the JWT token
      // and extract the user information
      const authHeader = req.headers.authorization;
      let user: Context['user'] = undefined;
      
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
      logger.error('GraphQL Error:', error);
      
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
  apolloServer.applyMiddleware({ 
    app: app as any, 
    path: '/graphql', 
    cors: false // Disable Apollo's CORS to use Express's configuration
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
    logger.info(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
