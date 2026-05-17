import { BookOpen } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "../../shared/ui";
import { useWordBook } from "./use-word-book";
import { WordBookControls } from "./word-book-controls";
import { WordBookPagination } from "./word-book-pagination";
import { WordCard } from "./word-card";

export function WordBook() {
  const state = useWordBook();

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center">
        <div className="badge badge-primary badge-soft mb-3 gap-2">
          <BookOpen aria-hidden="true" size={16} />
          Vocabulary Library
        </div>
        <h1 className="text-4xl font-black">Explore the word book</h1>
        <p className="text-base-content/65 mx-auto mt-3 max-w-2xl">
          Search curated dictionary entries across exam tracks, frequency lists,
          and safe translated notes.
        </p>
      </header>
      <WordBookControls
        filters={state.filters}
        search={state.search}
        setWord={state.setWord}
        toggleFilter={state.toggleFilter}
      />
      {state.error ? <ErrorState /> : null}
      {state.isLoading ? <LoadingState /> : null}
      {!state.isLoading && state.words.length === 0 ? <EmptyState /> : null}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {state.words.map((word) => (
          <WordCard key={word.id} word={word} />
        ))}
      </section>
      {!state.isLoading && state.total > 0 ? (
        <WordBookPagination
          page={state.page}
          setPage={state.setPage}
          total={state.total}
          totalPages={state.totalPages}
        />
      ) : null}
    </div>
  );
}
