export type WordBookPaginationProps = {
  readonly page: number;
  readonly setPage: (page: number) => void;
  readonly total: number;
  readonly totalPages: number;
};

export function WordBookPagination({
  page,
  setPage,
  total,
  totalPages,
}: WordBookPaginationProps) {
  return (
    <div className="join mx-auto">
      <button
        className="btn join-item"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        type="button"
      >
        Previous
      </button>
      <span className="btn join-item no-animation">
        Page {page} / {totalPages} · {total} words
      </span>
      <button
        className="btn join-item"
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        type="button"
      >
        Next
      </button>
    </div>
  );
}
