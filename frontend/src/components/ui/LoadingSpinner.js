const LoadingSpinner = ({ size = 'md', text }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

export const SkeletonCard = () => (
  <div className="card space-y-3">
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-8 w-1/2" />
    <div className="skeleton h-3 w-1/3" />
  </div>
);

export default LoadingSpinner;
