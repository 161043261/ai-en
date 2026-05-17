import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { WordMarquee } from "../../features/word-marquee";

export type HomeHeroProps = {
  readonly isSignedIn: boolean;
  readonly openAuth: () => void;
};

export function HomeHero({
  isSignedIn,
  openAuth,
}: HomeHeroProps) {
  return (
    <section className="grid items-stretch gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="card overflow-hidden bg-neutral text-neutral-content shadow-2xl">
        <div className="card-body justify-center gap-7 p-8 lg:p-12">
          <div className="badge badge-primary badge-lg gap-2">
            <Sparkles aria-hidden="true" size={18} />
            Five-day speaking streak starter
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-5xl font-black leading-none tracking-tight lg:text-7xl">
              Learn English with an AI scene partner.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-neutral-content/70">
              Move from passive study into guided conversations, course pathways,
              and vocabulary review that keeps the legacy routes intact.
            </p>
          </div>
          <div className="card-actions gap-3">
            {isSignedIn ? (
              <a className="btn btn-primary" href="/chat/index">
                Continue practice
                <ArrowRight aria-hidden="true" size={18} />
              </a>
            ) : (
              <button className="btn btn-primary" onClick={openAuth} type="button">
                Start learning
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            )}
            <a className="btn btn-outline border-white/20 text-white" href="/courses/index">
              <BookOpen aria-hidden="true" size={18} />
              View courses
            </a>
          </div>
        </div>
      </div>
      <WordMarquee />
    </section>
  );
}
