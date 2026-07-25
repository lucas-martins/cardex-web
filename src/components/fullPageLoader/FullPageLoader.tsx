import "./FullPageLoader.css";

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({
  message = "Loading...",
}: FullPageLoaderProps) {
  return (
    <main
      className="full-page-loader"
      role="status"
      aria-live="polite"
    >
      <div className="full-page-loader__spinner" />

      <span>{message}</span>
    </main>
  );
}