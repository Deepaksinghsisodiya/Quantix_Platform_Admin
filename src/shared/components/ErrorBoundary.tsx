import { Component, ErrorInfo, ReactNode } from 'react';
import { logService } from '../../core/services/logService';
import { ATMButton } from '../ui';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary to catch React rendering errors
 * and report them to the backend.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report error to backend
    logService.log({
      logLevel: 'Critical',
      message: `React Rendering Error: ${error.message}`,
      stackTrace: error.stack + '\n\nComponent Stack:\n' + errorInfo.componentStack,
      extraData: JSON.stringify({ componentStack: errorInfo.componentStack })
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-800 p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/30">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Something went wrong
            </h1>
            
            <p className="text-slate-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
              An unexpected error occurred while rendering this page. The issue has been reported to our technical team.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-slate-50 dark:bg-gray-800 rounded-xl text-left overflow-auto max-h-40 border border-slate-200 dark:border-gray-700">
                <p className="text-[10px] font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <ATMButton 
                onClick={this.handleReset} 
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                <span>Reload Application</span>
              </ATMButton>
              
              <button 
                onClick={this.handleGoHome}
                className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest">
                Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
