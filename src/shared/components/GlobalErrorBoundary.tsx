import { Component, ErrorInfo, ReactNode } from 'react'
import { logService } from '../../core/services/logService'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Report error to backend
    logService.log({
      logLevel: 'Critical',
      message: `Frontend Runtime Error: ${error.message}`,
      stackTrace: error.stack + '\n' + info.componentStack,
      extraData: JSON.stringify({ componentStack: info.componentStack })
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center p-8 bg-zen-card rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              An unexpected error occurred in the application. Please refresh the page or try again later.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
