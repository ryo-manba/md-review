interface ErrorDisplayProps {
  error: Error;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '2rem auto',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
      }}
    >
      <h2 style={{ color: '#c00' }}>Error</h2>
      <p>{error.message}</p>
    </div>
  );
};
