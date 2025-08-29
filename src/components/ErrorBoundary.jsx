// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Algo salió mal</h1>
            <p className="mb-4">Ocurrió un error inesperado. Por favor, intenta de nuevo.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/login';
              }}
              className="rounded-md bg-[#e50914] px-4 py-2 font-semibold"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;