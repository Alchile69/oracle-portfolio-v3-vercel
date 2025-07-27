import React from 'react';
import { PieChart, BarChart3, TrendingUp, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  return (
    <header className="bg-background-card shadow-md z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <PieChart size={24} className="text-primary-500 mr-2" />
            <h1 className="text-xl font-bold text-white">Oracle Portfolio</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <BarChart3 size={18} className="mr-1.5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
              <TrendingUp size={18} className="mr-1.5" />
              <span>Analytics</span>
            </a>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <button className="btn-primary">
              Get Full Access
            </button>
          </div>
          
          <button 
            className="md:hidden p-2" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-gray-300" />
            ) : (
              <Menu size={24} className="text-gray-300" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-background-card"
        >
          <div className="px-4 py-3 space-y-3">
            <a 
              href="#" 
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-background-cardHover"
            >
              Dashboard
            </a>
            <a 
              href="#" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-background-cardHover"
            >
              Analytics
            </a>
            <div className="pt-2">
              <button className="w-full btn-primary">
                Get Full Access
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;