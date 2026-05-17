import { useState } from "react";
import { useAuthSession } from "../../features/auth";
import { AuthDialog } from "../../features/auth-ui";
import { useAppServices } from "../use-app-services";
import { HomeFeatureGrid } from "./home-feature-grid";
import { HomeHero } from "./home-hero";
import { HomeStatGrid } from "./home-stat-grid";
import { useHomeMotion } from "./use-home-motion";

export function HomePage() {
  const { session } = useAppServices();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuthSession(session);
  const { featureGridRef, heroRef, introRef, statGridRef, statValues } =
    useHomeMotion();

  return (
    <div className="flex flex-col gap-10">
      <section ref={heroRef}>
        <HomeHero
          isSignedIn={Boolean(user)}
          openAuth={() => {
            setIsAuthOpen(true);
          }}
        />
      </section>
      <section className="text-center" ref={introRef}>
        <div className="badge badge-primary badge-soft mb-4">Why AI EN</div>
        <h2 className="text-4xl font-black">A sharper way to practice</h2>
        <p className="text-base-content/65 mx-auto mt-4 max-w-2xl leading-8">
          The React migration keeps the trusted learning flow while adding typed
          API contracts, safer auth, and a lightweight vocabulary stream.
        </p>
      </section>
      <section ref={statGridRef}>
        <HomeStatGrid values={statValues} />
      </section>
      <HomeFeatureGrid motionRef={featureGridRef} />
      <AuthDialog
        close={() => {
          setIsAuthOpen(false);
        }}
        isOpen={isAuthOpen}
      />
    </div>
  );
}
