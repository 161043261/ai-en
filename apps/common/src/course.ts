export interface Course {
  id: string;
  name: string;
  value: string;
  description?: string;
  teacher: string;
  url: string;
  price: string;
}

export type CourseList = Course[];
