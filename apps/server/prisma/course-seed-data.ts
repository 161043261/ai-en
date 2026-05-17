export type CourseSeedValue =
  | "gk"
  | "zk"
  | "gre"
  | "toefl"
  | "ielts"
  | "cet6"
  | "cet4"
  | "ky";

export interface CourseSeed {
  readonly name: string;
  readonly value: CourseSeedValue;
  readonly description: string;
  readonly teacher: string;
  readonly url: string;
  readonly price: string;
  readonly assetFileName: string;
}

export interface CourseSeedData {
  readonly name: string;
  readonly value: CourseSeedValue;
  readonly description: string;
  readonly teacher: string;
  readonly url: string;
  readonly price: string;
}

export const courseSeedValues: readonly CourseSeedValue[] = [
  "gk",
  "zk",
  "gre",
  "toefl",
  "ielts",
  "cet6",
  "cet4",
  "ky",
];

export const courseSeeds: readonly CourseSeed[] = [
  {
    name: "Gaokao Vocabulary",
    value: "gk",
    description: "Core vocabulary for senior high school entrance preparation.",
    teacher: "AI English",
    url: "/course/gk.png",
    price: "100.00",
    assetFileName: "gk.png",
  },
  {
    name: "Zhongkao Vocabulary",
    value: "zk",
    description: "Core vocabulary for junior high school exam preparation.",
    teacher: "AI English",
    url: "/course/zk.png",
    price: "35.00",
    assetFileName: "zk.png",
  },
  {
    name: "GRE Vocabulary",
    value: "gre",
    description: "Advanced vocabulary for GRE reading and verbal practice.",
    teacher: "AI English",
    url: "/course/gre.png",
    price: "80.00",
    assetFileName: "gre.png",
  },
  {
    name: "TOEFL Vocabulary",
    value: "toefl",
    description:
      "Academic vocabulary for TOEFL listening, speaking, and reading.",
    teacher: "AI English",
    url: "/course/toefl.png",
    price: "80000.00",
    assetFileName: "toefl.png",
  },
  {
    name: "IELTS Vocabulary",
    value: "ielts",
    description:
      "High-frequency vocabulary and paraphrases for IELTS preparation.",
    teacher: "AI English",
    url: "/course/ielts.png",
    price: "7000.00",
    assetFileName: "ielts.png",
  },
  {
    name: "College English Band 6",
    value: "cet6",
    description: "Vocabulary course for CET-6 preparation.",
    teacher: "AI English",
    url: "/course/cet6.png",
    price: "5.00",
    assetFileName: "cet6.png",
  },
  {
    name: "College English Band 4",
    value: "cet4",
    description: "Vocabulary course for CET-4 preparation.",
    teacher: "AI English",
    url: "/course/cet4.png",
    price: "8.00",
    assetFileName: "cet4.png",
  },
  {
    name: "Postgraduate English Vocabulary",
    value: "ky",
    description: "Vocabulary for postgraduate English exam preparation.",
    teacher: "AI English",
    url: "/course/ky.png",
    price: "9.99",
    assetFileName: "ky.png",
  },
];

export const toCourseSeedData = (course: CourseSeed): CourseSeedData => ({
  name: course.name,
  value: course.value,
  description: course.description,
  teacher: course.teacher,
  url: course.url,
  price: course.price,
});
