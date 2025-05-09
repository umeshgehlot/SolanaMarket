import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import SearchBar from '../search/SearchBar';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { connected } = useWallet();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Collections', path: '/collections' },
    { name: 'Create', path: '/create' },
    { name: 'Stats', path: '/stats' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-5">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg rounded-full max-w-7xl mx-auto border border-gray-100/30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="mx-4">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search NFTs, collections, users..."
                className="rounded-full"
              />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-white bg-primary-600 shadow-sm'
                    : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {connected && (
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/profile')
                    ? 'text-white bg-primary-600 shadow-sm'
                    : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                My Profile
              </Link>
            )}

            <WalletMultiButton className="!bg-white/30 !backdrop-blur-md hover:!bg-white/40 !border !border-white/50 !rounded-full !px-6 !py-2 !shadow-md !transition-all !duration-300 hover:!shadow-lg hover:!scale-105 !text-indigo-600 !font-medium" />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 focus:outline-none shadow-md transition-all duration-300 hover:shadow-lg"
                aria-expanded="false"
              >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <div className="mx-4 my-2">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search NFTs, collections, users..."
              className="rounded-full"
            />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-4 py-2 rounded-full text-base font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? 'text-white bg-primary-600 shadow-sm'
                  : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {connected && (
            <Link
              to="/profile"
              className={`block px-4 py-2 rounded-full text-base font-medium transition-all duration-200 ${
                isActive('/profile')
                  ? 'text-white bg-primary-600 shadow-sm'
                  : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              My Profile
            </Link>
          )}

          <div className="mt-4 px-3">
            <WalletMultiButton className="!bg-white/30 !backdrop-blur-md hover:!bg-white/40 !border !border-white/50 w-full !justify-center !rounded-full !py-2.5 !shadow-md !transition-all !duration-300 hover:!shadow-lg !text-indigo-600 !font-medium" />
          </div>
        </div>
      </div>
    </nav>
    </div>
  );
};

export default Navbar;
