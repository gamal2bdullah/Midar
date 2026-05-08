import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'owner' | 'editor' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scaffold: In the future, this is where Firebase onAuthStateChanged would go.
    // Preserving local-first behavior for now, so we simulate a local session or no session.
    const storedUser = localStorage.getItem('midar_auth_v1');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async () => {
    // Scaffold: Replace with Google Popup Auth or similar
    const fakeUser: User = { uid: 'local-123', email: 'guest@midar', displayName: 'Local User', role: 'owner' };
    setUser(fakeUser);
    localStorage.setItem('midar_auth_v1', JSON.stringify(fakeUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('midar_auth_v1');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
