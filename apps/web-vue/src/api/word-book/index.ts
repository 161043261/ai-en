import { mainApi, type Response } from '..'
import type { WordList, WordQuery } from '@ai-en/common/types/word'

export const getWordBookListApi = (params: WordQuery) =>
  mainApi.get<Response<WordList>>('/word-book', { params })
