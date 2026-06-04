import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContextType, AuthState, User } from '@/types';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
};

function loadFromStorage(): Partial<AuthState> {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user: User | null = userStr ? JSON.parse(userStr) : null;

    return {
      accessToken,
      refreshToken,
      user,
      isAuthenticated: !!(accessToken && user),
    };
  } catch {
    return {};
  }
}

function saveToStorage(accessToken: string, refreshToken: string, user: User) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = loadFromStorage();
    return {
      user: stored.user || null,
      accessToken: stored.accessToken || null,
      refreshToken: stored.refreshToken || null,
      isAuthenticated: stored.isAuthenticated || false,
      isLoading: false,
    };
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await authService.login(email, password);
      const { user, access_token, refresh_token } = res.data!;

      saveToStorage(access_token, refresh_token, user);
      setState({
        user,
        accessToken: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await authService.register(email, password, username);
      const data = res.data!;

      // Nếu không cần confirm email, tự động đăng nhập
      if (!data.needs_email_confirmation && data.access_token && data.refresh_token) {
        saveToStorage(data.access_token, data.refresh_token, data.user);
        setState({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

      return {
        needsEmailConfirmation: data.needs_email_confirmation,
        message: res.message,
      };
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      if (state.accessToken) {
        await authService.logout(state.accessToken);
      }
    } catch {
      // Bỏ qua lỗi logout phía server, vẫn xoá local storage
      console.warn('Logout error on server side, clearing local state anyway.');
    } finally {
      clearStorage();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [state.accessToken]);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = state.refreshToken || localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return;

    try {
      const res = await authService.refreshToken(refreshToken);
      const { access_token, refresh_token, user } = res.data!;

      saveToStorage(access_token, refresh_token, user);
      setState(prev => ({
        ...prev,
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
        isAuthenticated: true,
      }));
    } catch {
      // Token hết hạn hoặc invalid → logout
      clearStorage();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [state.refreshToken]);

  // Auto-refresh token khi app load (nếu có stored token)
  useEffect(() => {
    if (state.refreshToken && !state.isAuthenticated) {
      refreshAccessToken();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
