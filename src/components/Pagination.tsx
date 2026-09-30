interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="pager" aria-label="Paginacao">
      <button disabled={currentPage <= 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>Anterior</button>
      <span>{currentPage} / {totalPages}</span>
      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}>Próxima</button>
    </div>
  );
}
