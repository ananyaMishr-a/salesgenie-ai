import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SalesGenie ErrorBoundary caught an exception]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2.5rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fca5a5',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '320px',
            margin: '1rem',
          }}
        >
          <div
            style={{
              background: '#fef2f2',
              borderRadius: '50%',
              padding: '1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertTriangle size={36} color="#ef4444" />
          </div>

          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '0.5rem',
            }}
          >
            {this.props.fallbackTitle || 'Module Execution Error'}
          </h3>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              maxWidth: '460px',
              lineHeight: '1.5',
              marginBottom: '1.5rem',
            }}
          >
            {this.state.error?.message ||
              'An error occurred while rendering this module. Your session data remains safe.'}
          </p>

          <button
            onClick={this.handleReset}
            className="btn-blue-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
            }}
          >
            <RefreshCw size={16} /> Recover Module State
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
