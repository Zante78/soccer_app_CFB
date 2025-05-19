import { useState, useCallback } from 'react';

interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export function usePagination({ initialPage = 1, pageSize = 10 }: PaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / pageSize);

  const nextPage = useCallback(() => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setCurrentPage(page => Math.max(page - 1, 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }, [totalPages]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    setTotalItems,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}