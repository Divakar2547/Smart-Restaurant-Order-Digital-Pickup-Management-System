import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <FiChevronLeft size={16} />
      </button>
      {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
        const p = page <= 3 ? i + 1 : page - 2 + i;
        if (p > pages) return null;
        return (
          <button key={p} onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-purple-600 text-white' : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {p}
          </button>
        );
      })}
      <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
