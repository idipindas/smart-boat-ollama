import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { APP_NAME } from '../../utils/constants';

const Header: React.FC = () => {
  const { organizationName, isRegistered, clearOrganization } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
          </div>

          {/* Navigation and Organization Info */}
          {isRegistered && (
            <div className="flex items-center gap-6">
              {/* Navigation Links */}
              <nav className="flex gap-4">
                <Link
                  to="/upload"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/upload')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upload
                </Link>
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Chat
                </Link>
              </nav>

              {/* Organization Info */}
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Organization</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organizationName}
                  </p>
                </div>
                <button
                  onClick={clearOrganization}
                  className="text-sm text-gray-500 hover:text-error transition-colors"
                  title="Change Organization"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
