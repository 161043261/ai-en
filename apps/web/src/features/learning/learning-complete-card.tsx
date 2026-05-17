export type LearningCompleteCardProps = {
  readonly saveMasteredWords: () => Promise<void>;
};

export function LearningCompleteCard({
  saveMasteredWords,
}: LearningCompleteCardProps) {
  return (
    <section className="hero rounded-box bg-base-200 min-h-96">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-black">Batch complete</h2>
          <p className="text-base-content/65 py-4">
            Save this set as mastered and load the next focused practice batch.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => void saveMasteredWords()}
            type="button"
          >
            Practice next batch
          </button>
        </div>
      </div>
    </section>
  );
}
