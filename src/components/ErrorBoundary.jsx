import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Display Rendering Warning</h3>
            <p className="text-xs text-slate-400 mb-4">
              A temporary issue occurred while formatting the paper components.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg text-left text-xs font-mono text-rose-400 mb-5 overflow-auto max-h-32 border border-slate-800">
              {this.state.error?.message || 'Unknown render exception'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <RotateCcw size={14} />
              <span>Reset to Default Paper</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
