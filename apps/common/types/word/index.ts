export interface Word {
  id: string; // 单词 ID
  word: string; // 单词
  phonetic?: string; // 音标
  definition?: string; // 定义
  translation?: string; // 翻译
  pos?: string; // 词性
  collins?: string; // 柯林斯
  oxford?: string; // 牛津
  tag?: string; // 标签
  bnc?: string; // BNC, 英国国家语料库
  frq?: string; // 频率
  exchange?: string; // 同义词
  gk?: boolean; // 高考
  zk?: boolean; // 中考
  gre?: boolean; // GRE
  toefl?: boolean; // TOEFL
  ielts?: boolean; // IELTS
  cet6?: boolean; // 英语六级
  cet4?: boolean; // 英语四级
  ky?: boolean; // 考研
  createdAt: string; // 创建时间, ISO 字符串
  updatedAt: string; // 更新时间, ISO 字符串
}

export interface WordList {
  list: Word[];
  total: number;
}

export interface WordQuery {
  page: number; // 页号
  pageSize: number; // 每页数量
  word?: string; // 单词
  gk?: boolean; // 高考
  zk?: boolean; // 中考
  gre?: boolean; // GRE
  toefl?: boolean; // TOEFL
  ielts?: boolean; // IELTS
  cet6?: boolean; // 英语六级
  cet4?: boolean; // 英语四级
  ky?: boolean; // 考研
}
