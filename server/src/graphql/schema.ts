import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type NFT {
    id: ID!
    name: String!
    description: String
    image: String!
    collection: Collection
    creator: User!
    owner: User!
    price: Float
    royaltyPercentage: Float
    mintAddress: String!
    tokenAddress: String
    metadata: JSONObject
    listed: Boolean!
    createdAt: String!
    updatedAt: String
  }

  type Collection {
    id: ID!
    name: String!
    description: String
    image: String
    bannerImage: String
    creator: User!
    nfts: [NFT!]
    floorPrice: Float
    volume: Float
    verified: Boolean
    createdAt: String!
    updatedAt: String
  }

  type User {
    id: ID!
    walletAddress: String!
    username: String
    avatar: String
    bio: String
    website: String
    twitter: String
    discord: String
    collections: [Collection!]
    ownedNFTs: [NFT!]
    createdNFTs: [NFT!]
    createdAt: String!
    updatedAt: String
  }

  type Transaction {
    id: ID!
    type: TransactionType!
    nft: NFT!
    from: User
    to: User
    price: Float
    signature: String!
    timestamp: String!
  }
  
  type Offer {
    id: ID!
    nft: NFT!
    from: User!
    price: Float!
    status: OfferStatus!
    expiresAt: String!
    createdAt: String!
  }
  
  type Bid {
    id: ID!
    nft: NFT!
    bidder: User!
    price: Float!
    status: BidStatus!
    expiresAt: String!
    createdAt: String!
  }

  enum TransactionType {
    MINT
    LIST
    UNLIST
    SALE
    TRANSFER
    OFFER
    ACCEPT_OFFER
    CANCEL_OFFER
    BID
    ACCEPT_BID
    CANCEL_BID
  }
  
  enum OfferStatus {
    ACTIVE
    ACCEPTED
    CANCELLED
    EXPIRED
  }
  
  enum BidStatus {
    ACTIVE
    ACCEPTED
    CANCELLED
    EXPIRED
  }

  type MarketStats {
    totalVolume: Float!
    dailyVolume: Float!
    totalNFTs: Int!
    totalCollections: Int!
    totalUsers: Int!
  }

  # For handling arbitrary JSON data
  scalar JSONObject

  type Query {
    # NFT queries
    nft(id: ID!): NFT
    nfts(
      limit: Int
      offset: Int
      filter: NFTFilterInput
      sort: NFTSortInput
    ): [NFT!]!
    
    # Collection queries
    collection(id: ID!): Collection
    collections(
      limit: Int
      offset: Int
      filter: CollectionFilterInput
      sort: CollectionSortInput
    ): [Collection!]!
    
    # User queries
    user(id: ID, walletAddress: String): User
    users(limit: Int, offset: Int): [User!]!
    
    # Transaction queries
    transactions(
      limit: Int
      offset: Int
      filter: TransactionFilterInput
      sort: TransactionSortInput
    ): [Transaction!]!
    
    # Offer queries
    offers(nftId: ID!, status: OfferStatus): [Offer!]!
    offer(id: ID!): Offer
    
    # Bid queries
    bids(nftId: ID!, status: BidStatus): [Bid!]!
    bid(id: ID!): Bid
    
    # Stats queries
    marketStats: MarketStats!
  }

  input NFTFilterInput {
    name: String
    collection: ID
    creator: ID
    owner: ID
    minPrice: Float
    maxPrice: Float
    listed: Boolean
  }

  input NFTSortInput {
    field: NFTSortField!
    direction: SortDirection!
  }

  enum NFTSortField {
    PRICE
    CREATED_AT
    NAME
  }

  input CollectionFilterInput {
    name: String
    creator: ID
    verified: Boolean
  }

  input CollectionSortInput {
    field: CollectionSortField!
    direction: SortDirection!
  }

  enum CollectionSortField {
    FLOOR_PRICE
    VOLUME
    CREATED_AT
    NAME
  }

  input TransactionFilterInput {
    type: TransactionType
    nft: ID
    from: ID
    to: ID
    minPrice: Float
    maxPrice: Float
    startDate: String
    endDate: String
  }

  input TransactionSortInput {
    field: TransactionSortField!
    direction: SortDirection!
  }

  enum TransactionSortField {
    PRICE
    TIMESTAMP
  }

  enum SortDirection {
    ASC
    DESC
  }

  type Mutation {
    # NFT mutations
    createNFT(input: CreateNFTInput!): NFT!
    updateNFT(id: ID!, input: UpdateNFTInput!): NFT!
    listNFT(id: ID!, price: Float!): NFT!
    unlistNFT(id: ID!): NFT!
    buyNFT(id: ID!): Transaction!
    transferNFT(id: ID!, to: String!): Transaction!
    
    # Collection mutations
    createCollection(input: CreateCollectionInput!): Collection!
    updateCollection(id: ID!, input: UpdateCollectionInput!): Collection!
    
    # User mutations
    updateUser(input: UpdateUserInput!): User!
    
    # Offer mutations
    makeOffer(nftId: ID!, price: Float!, expirationDays: Int!): Offer!
    acceptOffer(id: ID!): Transaction!
    cancelOffer(id: ID!): Transaction!
    
    # Bid mutations
    placeBid(nftId: ID!, price: Float!, expirationDays: Int!): Bid!
    acceptBid(id: ID!): Transaction!
    cancelBid(id: ID!): Transaction!
  }

  input CreateNFTInput {
    name: String!
    description: String
    image: String!
    collection: ID
    royaltyPercentage: Float
    mintAddress: String!
    tokenAddress: String
    metadata: JSONObject
  }

  input UpdateNFTInput {
    name: String
    description: String
    image: String
    collection: ID
    price: Float
    metadata: JSONObject
  }

  input CreateCollectionInput {
    name: String!
    description: String
    image: String
    bannerImage: String
  }

  input UpdateCollectionInput {
    name: String
    description: String
    image: String
    bannerImage: String
  }

  input UpdateUserInput {
    username: String
    avatar: String
    bio: String
    website: String
    twitter: String
    discord: String
  }
`;
