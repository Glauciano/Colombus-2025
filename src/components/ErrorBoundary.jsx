import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: 'hsl(40 20% 98%)',
          color: 'hsl(160 30% 10%)',
          fontFamily: '"Inter", sans-serif'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: 'hsl(42 85% 55%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <span style={{ fontWeight: 'bold', fontSize: 24, color: 'hsl(160 30% 10%)' }}>C</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Algo deu errado</h1>
          <p style={{ color: 'hsl(160 10% 45%)', marginBottom: 16, textAlign: 'center', maxWidth: 400 }}>
            Ocorreu um erro inesperado no aplicativo.
          </p>
          <details style={{ marginBottom: 16, maxWidth: 500, width: '100%' }}>
            <summary style={{ cursor: 'pointer', fontSize: 14, color: 'hsl(160 10% 45%)', marginBottom: 8 }}>
              Detalhes do erro
            </summary>
            <pre style={{
              fontSize: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: 'hsl(40 15% 94%)',
              overflow: 'auto',
              maxHeight: 200,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {this.state.error?.message || 'Erro desconhecido'}
              {'\n'}
              {this.state.errorInfo?.componentStack || ''}
            </pre>
          </details>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              backgroundColor: 'hsl(160 45% 22%)',
              color: 'hsl(40 20% 98%)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
