export interface Course {
  id: string;
  name: string;
  value: string; // gk 高考, zk 中考, ...
  description?: string;
  teacher: string;
  url: string;
  price: string;
}

export type CourseList = Course[];
