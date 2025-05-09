import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { WalletContextProvider } from './contexts/WalletContext';
import apolloClient from './services/apolloClient';
import Layout from './components/layout/Layout';
import HomePage from './pages/home/HomePage';
import NFTDetailPage from './pages/nft/NFTDetailPage';
import CreateNFTPage from './pages/create/CreateNFTPage';
import ExplorePage from './pages/explore/ExplorePage';
import CollectionsPage from './pages/collections/CollectionsPage';
import CollectionDetailPage from './pages/collections/CollectionDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import StatsPage from './pages/stats/StatsPage';
import SearchResultsPage from './pages/search/SearchResultsPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import './index.css';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <WalletContextProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/nft/:id" element={<NFTDetailPage />} />
              <Route path="/create" element={<CreateNFTPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collection/:id" element={<CollectionDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </WalletContextProvider>
    </ApolloProvider>
  );
}

export default App;
