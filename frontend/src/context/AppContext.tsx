import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  organizationId: string | null;
  organizationName: string | null;
  sessionId: string;
}

interface AppContextType extends AppState {
  setOrganization: (id: string, name: string) => void;
  clearOrganization: () => void;
  regenerateSession: () => void;
  isRegistered: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(uuidv4());

  // Load organization data from localStorage on mount
  useEffect(() => {
    const savedOrgId = localStorage.getItem('organizationId');
    const savedOrgName = localStorage.getItem('organizationName');

    if (savedOrgId && savedOrgName) {
      setOrganizationId(savedOrgId);
      setOrganizationName(savedOrgName);
    }
  }, []);

  const setOrganization = (id: string, name: string) => {
    setOrganizationId(id);
    setOrganizationName(name);
    localStorage.setItem('organizationId', id);
    localStorage.setItem('organizationName', name);
  };

  const clearOrganization = () => {
    setOrganizationId(null);
    setOrganizationName(null);
    localStorage.removeItem('organizationId');
    localStorage.removeItem('organizationName');
    regenerateSession();
  };

  const regenerateSession = () => {
    setSessionId(uuidv4());
  };

  const isRegistered = organizationId !== null;

  return (
    <AppContext.Provider
      value={{
        organizationId,
        organizationName,
        sessionId,
        setOrganization,
        clearOrganization,
        regenerateSession,
        isRegistered,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
