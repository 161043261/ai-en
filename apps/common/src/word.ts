export type Word = {
  id: string;
  word: string;
  phonetic?: string;
  definition?: string;
  translation?: string;
  pos?: string;
  collins?: string;
  oxford?: string;
  tag?: string;
  bnc?: string;
  frq?: string;
  exchange?: string;
  gk?: boolean;
  zk?: boolean;
  gre?: boolean;
  toefl?: boolean;
  ielts?: boolean;
  cet6?: boolean;
  cet4?: boolean;
  ky?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WordList = {
  list: Word[];
  total: number;
};

export interface WordQuery {
  page: number;
  pageSize: number;
  word?: string;
  gk?: boolean;
  zk?: boolean;
  gre?: boolean;
  toefl?: boolean;
  ielts?: boolean;
  cet6?: boolean;
  cet4?: boolean;
  ky?: boolean;
}
