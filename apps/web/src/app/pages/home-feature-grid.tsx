import type { Ref } from "react";
import { Brain, MessageCircleHeart, ShieldCheck } from "lucide-react";

const features = [
  {
    content:
      "Practice inside realistic scenarios instead of memorizing isolated phrases.",
    icon: MessageCircleHeart,
    title: "Context-first speaking",
  },
  {
    content:
      "Typed AI flows and validated API contracts keep feedback reliable as features migrate.",
    icon: Brain,
    title: "Adaptive AI coaching",
  },
  {
    content:
      "Vocabulary review, streaks, and profile data are staged behind a safe auth boundary.",
    icon: ShieldCheck,
    title: "Progress that follows you",
  },
] as const;

export type HomeFeatureGridProps = {
  readonly motionRef?: Ref<HTMLElement>;
};

export function HomeFeatureGrid({ motionRef }: HomeFeatureGridProps) {
  return (
    <section className="grid gap-5 md:grid-cols-3" ref={motionRef}>
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <article
            className="card bg-base-100 shadow-xl transition-transform duration-300 hover:-translate-y-1"
            key={feature.title}
          >
            <div className="card-body gap-4">
              <div className="rounded-box bg-primary/10 text-primary flex size-14 items-center justify-center">
                <Icon aria-hidden="true" size={28} />
              </div>
              <h3 className="card-title">{feature.title}</h3>
              <p className="text-base-content/65 leading-7">
                {feature.content}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
