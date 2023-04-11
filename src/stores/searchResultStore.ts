import { defineStore } from 'pinia'
import {
  ProcessedLigandAdvanceSearchResultModel
} from "@/models/LigandSearchResultModel";

export const searchResultStore = defineStore('searchResult', {
  state: () => ({
    searchResult: [] as ProcessedLigandAdvanceSearchResultModel[],
    selectedSearchResult: ProcessedLigandAdvanceSearchResultModel
  }),
  getters: {
    getKeys(): string[]{
      return Object.keys(new ProcessedLigandAdvanceSearchResultModel())
    }
  }
})
