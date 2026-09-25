import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Global error boundary — last line of defence against a blank screen.
 *
 * Any render error (or a lazy chunk that fails to load, e.g. an old tab
 * after a new deployment) is caught here and replaced by a small branded
 * screen with a reload button, instead of React unmounting the whole app.
 * When nothing throws, it renders its children untouched.
 */
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[CarVibes] Unexpected error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-5 text-white">
        <div className="max-w-md text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-mist">CARVIBES</p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            This page could not be displayed. Reloading usually fixes it — the site may have
            just been updated.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex items-center justify-center border border-white/20 bg-white px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-white/85"
          >
            RELOAD PAGE
          </button>
        </div>
      </div>
    );
  }
}
