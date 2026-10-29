const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8" role="status" aria-live="polite">
      <div className="spinner mb-4" aria-hidden="true"></div>
      <p className="text-gray-600 text-sm md:text-base">{message}</p>
      <span className="sr-only">Loading, please wait</span>
    </div>
  );
};

export default Loading;
