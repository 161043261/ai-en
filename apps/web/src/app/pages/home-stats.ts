import {
  Clock3,
  GraduationCap,
  Smile,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type HomeStat = {
  readonly displayValue: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly suffix: string;
  readonly target: number;
};

export const homeStats = [
  {
    displayValue: "1M+",
    icon: UsersRound,
    label: "Learners served",
    suffix: "+",
    target: 1_000_000,
  },
  {
    displayValue: "500+",
    icon: GraduationCap,
    label: "Guided courses",
    suffix: "+",
    target: 500,
  },
  {
    displayValue: "98%",
    icon: Smile,
    label: "Satisfaction",
    suffix: "%",
    target: 98,
  },
  {
    displayValue: "5M+",
    icon: Clock3,
    label: "Practice hours",
    suffix: "+",
    target: 5_000_000,
  },
] as const satisfies readonly HomeStat[];
