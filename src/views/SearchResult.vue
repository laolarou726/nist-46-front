<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-card
        class="mx-auto"
        variant="outlined"
      >
        <v-card-item>
          <div>
            <div class="d-flex text-overline mb-1">
              OVERVIEW
            </div>
            <div class="d-flex text-h6 mb-1">
              Search Result
            </div>
            <div class="d-flex text-caption text-left">
              Here you can view the current search results and click on one of the entries to go to the details page for that compound.
              Clicking on the title in the table header will sort the items in ascending/descending order by that column.
              Click on the drop-down boxes and buttons at the bottom to control the content displayed on each page and switch between pages.
            </div>
          </div>
        </v-card-item>

        <v-card-actions>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">
            Return To Search Page
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card
        class="mt-10 text-left"
        title="Options"
        subtitle="Here are some options that you can use it to reorder data"
      >
        <v-card-actions>
          <v-row no-gutters>
            <v-col
              v-for="key in groupKeys"
              :key="key.key"
              cols="12"
              sm="3"
            >
              <v-checkbox
                :label="key.name"
                v-model="key.isChecked"
                color="primary"
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-btn
            class="ml-8"
            variant="flat"
            prepend-icon="mdi-refresh"
            color="secondary"
            @click="regroup"
          >
            Regroup
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-row justify="center" class="pt-10">
        <v-col cols="12">
          <v-data-table
            v-model:items-per-page="itemsPerPage"
            :group-by="groupBy"
            :headers="headers"
            :items="searchResult"
            item-value="name"
            class="elevation-1"
          >
            <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
              <tr class="text-left">
                <td :colspan="columns.length">
                  <VBtn
                    size="small"
                    variant="text"
                    :class="`ml-${item.depth * 5}`"
                    :icon="isGroupOpen(item) ? '$expand' : '$next'"
                    @click="toggleGroup(item)"
                  ></VBtn>
                  <span v-html="item.value"></span>
                </td>
              </tr>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                rounded="pill"
                color="primary"
                prepend-icon="mdi-share"
                @click="goToDetailPage(item)"
              >
                Detail
              </v-btn>
            </template>
            <template v-slot:[`item.preview`]="{ item }">
              <v-dialog
                v-model="item.showDialog"
                width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="text" icon="mdi-cube-scan"></v-btn>
                </template>
                <v-card title="Mol Preview (2D)">
                  <div id="mol2D" :style="molViewStyle" class="pa-5 mt-3"
                        v-if="item.previewLoaded"></div>
                  <v-card-text>
                    Click [Load] To Load The Preview For This Ligand.
                  </v-card-text>
                  <v-alert
                    type="error"
                    variant="outlined"
                    v-if="item.noPreviewAvailable"
                    class="ml-5 mr-5"
                  >
                    No Preview Available For This Ligand!
                  </v-alert>
                  <v-card-actions>
                    <v-btn color="primary" class="ml-4" variant="elevated" @click="loadPreview(item)" prepend-icon="mdi-cube-scan" :loading="item.previewLoading">Load</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="secondary" class="mr-2" @click="item.showDialog = false; item.previewLoaded = false">Close Dialog</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
            <template v-slot:[`item.molecular_formula`]="{ item }">
              <div v-html="item.molecular_formula"></div>
            </template>
            <template v-slot:[`item.form`]="{ item }">
              <div class="no-katex-html" v-html="getFormattedProtonationForm(item.form)"></div>
            </template>
            <template v-slot:[`item.metal_charge`]="{ item }">
              {{ (+item.metal_charge > 0 ? `+${item.metal_charge}` : item.metal_charge) }}
            </template>
            <template v-slot:[`item.formula_string`]="{ item }">
              <div class="no-katex-html" v-html="getFormattedMetalForm(item.formula_string)"></div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script lang="ts">
import "@/assets/latex.css"
import { defineComponent } from 'vue'
import {searchResultStore} from "@/stores/searchResultStore";
import katex from "katex";
import "openchemlib/full"
import MetalDisplayUtils from "@/utils/MetalDisplayUtils";
import ProtonationDisplayUtil from "@/utils/ProtonationDisplayUtil";
import GroupByModel from "@/models/Group/GroupByModel";
import GroupKeyModel from "@/models/Group/GroupKeyModel";
import {LigandSearchResultModel, ProcessedLigandAdvanceSearchResultModel} from "@/models/LigandSearchResultModel";
import {getMolData} from "@/axiosClient";
import {PreviewMethodsMixin, IPreviewMethodsMixin} from "@/mixins/PreviewMethodsMixin";
import {useTheme} from "vuetify";
import RouterMixin from "@/mixins/RouterMixin";

const filterKeyMapping: Record<string, string> = {
  'name': 'Name',
  'form': 'Protonation Level',
  'central_element': 'Metal',
  'metal_charge': 'Metal Charge',
  'formula_string': 'Formula String'
}

export default defineComponent({
  name: "SearchResult",
  mixins: [PreviewMethodsMixin, RouterMixin],
  metaInfo: {
    title: 'Search Results'
  },
  data: () => ({
    itemsPerPage: 50,
    headers: [
      { title: 'Actions', key: 'actions', sortable: false },
      { title: 'Preview', key: 'preview', sortable: false },
      {
        title: 'Name',
        align: 'start',
        key: 'name'
      },
      { title: 'Protonation Level', align: 'end', key: 'form' },
      { title: 'Metal Charge', align: 'end', key: 'metal_charge' },
      { title: 'Formula String', align: 'end', key: 'formula_string'}
    ] as never,
    searchResult: [] as ProcessedLigandAdvanceSearchResultModel[],
    groupBy: [] as GroupByModel[],
    groupKeys: [] as GroupKeyModel[]
  }),
  methods: {
    regroup(){
      const temp = []

      for(const state of this.groupKeys){
        if(!state.isChecked) continue
        temp.push({key: state.key})
      }

      this.groupBy = temp
    },
    goToDetailPage(item: LigandSearchResultModel){
      const store = searchResultStore()

      store.selectedSearchResult = item as ProcessedLigandAdvanceSearchResultModel

      this.$router.push('/detail-view')
    },
    getFormattedMetalForm(form?: string){
      if(!form) return '-'

      const latexStr = MetalDisplayUtils.formatMetalFormulaString(form)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    getFormattedProtonationForm(pro?: string){
      if(!pro) return '-'

      const latexStr = ProtonationDisplayUtil.formatProtonationString(pro)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    async loadPreview(item: LigandSearchResultModel){
      item.previewLoading = true;

      getMolData(item.ligand_id).then(async result => {
        if(!result){
          item.noPreviewAvailable = true
          return
        }

        item.drawCode = result.drawCode
        item.previewLoaded = true
        await (this as unknown as IPreviewMethodsMixin).load2DMol(item.drawCode, () => {})
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        item.previewLoading = false;
      });
    }
  },
  mounted() {
    const store = searchResultStore()

    this.searchResult = store.searchResult
    this.groupBy = [{key: 'name'}, {key: 'central_element'}]

    this.groupKeys = []
    for(const key of store.getKeys){
      if(!filterKeyMapping[key]) continue

      this.groupKeys.push({
        key: key,
        name: filterKeyMapping[key],
        isChecked: (key === "name" || key === "central_element")
      })
    }
  },
  computed: {
    molViewStyle(): string{
      const theme = useTheme()
      const background = theme.global.current.value.dark ? 'gray' : 'transparent'

      return `height: 400px; background: ${background};`
    }
  }
})
</script>
