import { defineStore } from 'pinia'
import {
  LigandSearchResultModel,
  ProcessedLigandAdvanceSearchResultModel
} from "@/models/LigandSearchResultModel";

export const searchResultStore = defineStore('searchResult', {
  state: () => ({
    searchResult: [] as LigandSearchResultModel[],
    selectedSearchResult: new ProcessedLigandAdvanceSearchResultModel() as ProcessedLigandAdvanceSearchResultModel
  }),
  getters: {
    getKeys(): string[]{
      return Object.keys(new ProcessedLigandAdvanceSearchResultModel())
    }
  }
})
