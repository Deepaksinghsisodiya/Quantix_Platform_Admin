import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppRouter } from './router';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { injectStore } from './core/services/axiosInstance';
import AuthProvider from './modules/auth/AuthProvider';
import { ThemeProvider } from './shared/context/ThemeContext';

// Inject store into axios instance to handle 401s and token retrieval
injectStore(store);

export function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster position="top-center" richColors closeButton />
    </Provider>
  );
}

