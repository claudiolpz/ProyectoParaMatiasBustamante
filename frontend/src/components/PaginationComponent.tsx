import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { PaginationProps } from "../types";

const PaginationComponent = ({ pagination, onPageChange }: PaginationProps) => {
  const startItem = (pagination.current - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.current * pagination.pageSize, pagination.total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const startPage = Math.max(1, pagination.current - Math.floor(maxVisible / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-700 border-t border-slate-600">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-300">
          Mostrando {startItem} a {endItem} de {pagination.total} productos
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(pagination.current - 1)}
          disabled={pagination.current === 1}
          className="p-2 rounded-md border border-slate-500 bg-slate-600 text-slate-300 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LeftOutlined />
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
              page === pagination.current
                ? 'bg-slate-500 text-white border-slate-400'
                : 'bg-slate-600 text-slate-300 border-slate-500 hover:bg-slate-500'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(pagination.current + 1)}
          disabled={pagination.current === pagination.totalPages}
          className="p-2 rounded-md border border-slate-500 bg-slate-600 text-slate-300 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  );
};

export default PaginationComponent;
