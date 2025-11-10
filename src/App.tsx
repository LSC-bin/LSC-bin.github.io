import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
