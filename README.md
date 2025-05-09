# SolanaMarket - Modern NFT Marketplace
A professional-grade decentralized NFT marketplace built on the Solana blockchain with a modern, minimalist UI design. This platform enables creators and collectors to mint, buy, sell, and trade NFTs with low transaction fees and high throughput.


## ✨ Features

- **Core Marketplace Functionality**
  - NFT minting, listing, buying, and selling
  - Collection creation and management
  - Bidding and offer system
  - Royalty enforcement for creators

- **Modern User Experience**
  - Responsive design with glass-morphism UI elements
  - Dark/light mode support
  - Real-time updates for bids and offers
  - Advanced search and filtering capabilities

- **Wallet Integration**
  - Seamless connection with Phantom, Solflare, and other Solana wallets
  - Transaction signing and verification
  - Wallet activity history

- **Advanced Features**
  - On-chain analytics and transaction history
  - Magic Eden integration for wider marketplace access
  - Auction functionality with timed bidding
  - Verified creator profiles

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Apollo Client for GraphQL data
- **Styling**: Tailwind CSS with custom design system
- **Wallet Connectivity**: Solana Wallet Adapter
- **Build Tools**: Webpack, React App Rewired

### Backend
- **Server**: Node.js with Express
- **API**: GraphQL with Apollo Server
- **Database**: MongoDB (with mock data support for development)
- **Authentication**: JWT with wallet signature verification

### Blockchain
- **Network**: Solana (Mainnet, Testnet, Devnet)
- **Smart Contracts**: Rust with Anchor framework
- **NFT Standard**: Metaplex Token Metadata Standard
- **Development Tools**: Solana CLI, Anchor CLI

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Solana CLI tools (for smart contract development)
- Rust (for smart contract development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/solana-nft-marketplace.git
cd solana-nft-marketplace
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend .env file
cp server/.env.example server/.env

# Frontend .env file
cp frontend/.env.example frontend/.env
```

4. Start the development servers
```bash
# Start backend server (in server directory)
npm run dev

# Start frontend development server (in frontend directory)
npm start
```

5. Access the application
- Frontend: http://localhost:3001
- Backend GraphQL Playground: http://localhost:4002/graphql

## 🏗️ Project Structure

```
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source files
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main application component
│
├── server/                  # Node.js backend server
│   ├── src/                 # Source files
│   │   ├── config/          # Configuration files
│   │   ├── graphql/         # GraphQL schema and resolvers
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Utility functions
│
└── smart-contracts/         # Solana smart contracts
    ├── programs/            # Anchor programs
    └── tests/               # Contract tests
```

## 📝 Development Roadmap

- [x] Initial project setup and architecture
- [x] Frontend UI components and styling
- [x] Backend GraphQL API structure
- [x] Frontend-Backend integration
- [ ] Wallet integration and authentication
- [ ] NFT minting functionality
- [ ] Marketplace listing and purchasing
- [ ] User profiles and collections
- [ ] Bidding and offer system
- [ ] Analytics and reporting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

