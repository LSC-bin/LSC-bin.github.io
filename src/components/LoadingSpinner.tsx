import './loadingSpinner.css';

interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className="spinner" />
      {label ? <span className="spinner-label">{label}</span> : null}
    </div>
  );
}
