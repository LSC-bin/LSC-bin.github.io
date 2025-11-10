import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

type AuthStatus = 'idle' | 'loading' | 'authenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setStatus(authUser ? 'authenticated' : 'idle');
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setStatus('loading');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('authenticated');
    } catch (error) {
      setStatus(auth.currentUser ? 'authenticated' : 'idle');
      throw error;
    }
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setStatus('loading');
      try {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(newUser, { displayName });
        }
        setStatus('authenticated');
      } catch (error) {
        setStatus(auth.currentUser ? 'authenticated' : 'idle');
        throw error;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    setStatus('loading');
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
      setStatus('authenticated');
    } catch (error) {
      setStatus(auth.currentUser ? 'authenticated' : 'idle');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setStatus('loading');
    try {
      await signOut(auth);
      setStatus('idle');
    } catch (error) {
      setStatus(auth.currentUser ? 'authenticated' : 'idle');
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isLoading: status === 'loading',
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout
    }),
    [loginWithEmail, loginWithGoogle, logout, registerWithEmail, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
