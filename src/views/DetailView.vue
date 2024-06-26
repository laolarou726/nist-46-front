<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-card
        class="mx-auto"
        variant="outlined"
      >
        <v-card-actions>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">
            Return To Search Page
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-progress-linear
        v-if="isLoading"
        indeterminate
        color="yellow-darken-2"
      ></v-progress-linear>

      <div class="text-caption text-left mt-8" v-if="failedResources.length !== 0">
        <v-alert
          class="mt-5"
          v-for="failed in failedResources"
          v-bind:key="failed.resourceName"
          density="compact"
          type="error"
          closable
          close-label="Close Alert"
          :title="`Failed To Request: ${failed.resourceName}`"
        >
          This might happen when there are too much traffic for the backend server. You can click [Retry All] button to reload. Detail: {{failed.detail}}
        </v-alert>
        <v-divider class="mt-2 mb-2"></v-divider>
        <div class="d-flex">
          <v-spacer></v-spacer>
          <v-btn color="info" prepend-icon="mdi-refresh" @click="retryFailed">Retry All</v-btn>
        </div>
      </div>

      <div class="d-flex text-caption text-left mt-8" v-if="molData">
        <v-alert
          type="info"
          title="Tips"
          text="If the preview control doesn't show up, please try click [LOAD] button again!"
          variant="tonal"
        ></v-alert>
      </div>

      <v-container class="pa-0 mt-8">
        <v-row no-gutters>
          <v-col :class="$vuetify.display.xs ? 'pt-5' : 'pr-3'" xs="12" :lg="(molData ? 6 : 12)">
            <v-card
              class="mx-auto fill-height"
              variant="outlined"
            >
              <v-card-item>
                <div>
                  <div class="d-flex text-overline mb-1">
                    INFO
                  </div>
                  <div class="d-flex text-h6 mb-1 text-left">
                    {{selectedSearchResult?.name ?? '-'}}
                  </div>
                  <div class="d-flex text-overline mb-1">
                    <v-chip color="blue" v-if="selectedSearchResult?.form">
                      <div class="no-katex-html text-h6" v-html="getFormattedProtonationForm(selectedSearchResult?.form ?? '-')"></div>
                    </v-chip>
                    <v-chip color="green" class="ml-3" v-if="selectedSearchResult?.formula_string">
                      <div class="no-katex-html text-h6" v-html="getFormattedMetalForm(selectedSearchResult?.formula_string ?? '-')"></div>
                    </v-chip>
                  </div>
                </div>
              </v-card-item>
              <v-list class="text-left" density="compact" style="overflow-y: auto; max-height: 400px;">
                <v-list-item>
                  Expression:
                  <span v-if="!molecular_formula">-</span>
                  <span v-else v-html="molecular_formula"></span>
                </v-list-item>
                <v-list-item>SMILES: {{smileStr}}</v-list-item>
                <v-list-item>Ligand ID: {{selectedSearchResult?.ligand_id ?? '-'}}</v-list-item>
                <v-list-item>Metal ID: {{selectedSearchResult?.metal_id ?? '-'}}</v-list-item>
              </v-list>
              <div class="text-left">
                <v-chip
                  v-for="category in categories"
                  :key="category"
                  class="ma-2"
                  color="pink"
                  label
                  text-color="white"
                >
                  <v-icon start icon="mdi-label"></v-icon>
                  {{category}}
                </v-chip>
              </div>
            </v-card>
          </v-col>
          <v-col v-if="molData" xs="12" lg="6"
                 :class="$vuetify.display.xs ? 'pt-5' : ''">
            <v-card
              class="mx-auto fill-height"
              variant="outlined"
            >
              <v-card-item>
                <div>
                  <div class="d-flex text-overline mb-1">
                    PREVIEW
                  </div>
                  <div class="d-flex text-h6 mb-1">
                    Mol Preview ({{isIn3DPreviewMode ? '3D' : '2D'}})
                  </div>
                </div>
              </v-card-item>

              <v-container>
                <v-row no-gutters >
                  <v-col >
                    <div id="mol2D" v-if="!isIn3DPreviewMode" :style="molViewStyle" class="disabled"></div>
                    <div id="mol3D" v-else :style="molViewStyle"></div>
                  </v-col>
                </v-row>
              </v-container>

              <v-card-actions>
                <v-btn variant="outlined" prepend-icon="mdi-cube-scan" @click="loadPreview">
                  Load
                </v-btn>
                <v-btn variant="outlined" :prepend-icon="(isIn3DPreviewMode ? 'mdi-vector-rectangle' : 'mdi-cube')" @click="switchPreviewMode">
                  Switch To {{isIn3DPreviewMode ? '2D' : '3D'}} Preview
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-alert
        v-if="noDataAvailable"
        type="error"
        title="Criteria Not Meet"
        text="Published data do not meet criteria for critical selection."
        variant="tonal"
        icon="mdi-flask-empty-off-outline"
        class="mt-8 text-left"
      ></v-alert>

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

      <v-data-table
        :group-by="groupBy"
        :headers="headers"
        :items="constants"
        :items-per-page="itemsPerPage"
        multi-sort
        class="mt-8 elevation-1"
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
              <span v-html="tryFormatGroupTitle(item.value)" class="no-katex-html"></span>
            </td>
          </tr>
        </template>
        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="text-left">
              <v-chip
                class="ma-2"
                color="primary"
                label
                text-color="white"
              >
                <v-icon start icon="mdi-note-text-outline"></v-icon>
                FootNote: <div class="ml-2" v-html="(getFootNote(item.legacy_identifier ?? '') ?? 'None')"></div>
              </v-chip>
            </td>
          </tr>
        </template>
        <template v-slot:[`item.constant_kind`]="{ item }">
          <v-chip :color="getConstantKindBadgeColor(item.constant_kind ?? '')">
            <div class="no-katex-html" v-html="getFormattedConstantKind(item.constant_kind)"></div>
          </v-chip>
        </template>
        <template v-slot:[`item.expression_string`]="{ item }">
          <div class="no-katex-html" v-html="convertExpressionToLatex(item.expression_string)"></div>
        </template>
        <template v-slot:[`item.value`]="{ item }">
          <tr>
            <td style="min-width: 150px;">
              <div class="no-katex-html pl-3 pr-3" v-html="convertValueWithUncertaintyToLatex1(item.value, item.magnitude, item.direction, item.constant_kind)"></div>
            </td>
            <td v-if="item.constant_kind !== 'Equilibrium'">
              <div class="no-katex-html pl-3 pr-3" v-html="convertValueWithUncertaintyToLatex2(item.value, item.magnitude, item.direction, item.constant_kind)"></div>
            </td>
          </tr>
        </template>
      </v-data-table>

      <v-switch color="primary" class="ml-8" label="Show Unbalanced data" @click="changeUnbalancedDataState"></v-switch>

      <v-card
        class="mx-auto mt-8"
        variant="outlined"
        v-if="(references && references.length !== 0)"
      >
        <v-card-item>
          <div>
            <div class="d-flex text-overline mb-1">
              CREDITS
            </div>
            <div class="d-flex text-h6 mb-1">
              References
            </div>
          </div>
        </v-card-item>
        <v-list lines="one" class="text-left" style="overflow-y: auto; max-height: 400px;">
          <v-list-item
            v-for="ref in references"
            :key="ref.litId"
            :title="ref.reference"
            :subtitle="ref.code"
          ></v-list-item>
        </v-list>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script lang="ts">
import "@/assets/latex.css"
import "@/assets/common.css"
import { defineComponent } from 'vue'
import {searchResultStore} from "@/stores/searchResultStore";
import {
  LigandAdvanceSearchResultModel,
  ProcessedLigandAdvanceSearchResultModel
} from "@/models/LigandSearchResultModel";
import {getConstants, getMolData, getReferences} from "@/axiosClient";
import {useTheme} from "vuetify";
import FootNoteUtils from "@/utils/FootNoteUtils";
import "openchemlib/full"
import ElementDisplayUtils from "@/utils/ElementDisplayUtils";
import katex from "katex"
import MetalDisplayUtils from "@/utils/MetalDisplayUtils";
import ProtonationDisplayUtil from "@/utils/ProtonationDisplayUtil";
import { ConstantResultModel } from '@/models/ConstantResultModel';
import { MolecularFormula } from '@/models/MolecularFormula';
import { MolDataRawResultModel } from '@/models/MolDataResultModel';
import {ReferenceFetchResultModel} from "@/models/ReferenceFetchResultModel";
import GroupByModel from "@/models/Group/GroupByModel";
import GroupKeyModel from "@/models/Group/GroupKeyModel";
import {unbalancedDataNameList} from "@/Constants";
import UncertaintyUtils from "@/utils/UncertaintyUtils";
import {PreviewMethodsMixin, IPreviewMethodsMixin} from "@/mixins/PreviewMethodsMixin";
import RouterMixin from "@/mixins/RouterMixin";

declare interface RequestFailedModel{
  resourceName: string;
  detail: string;
  action: () => void;
}

export default defineComponent({
  name: "DetailView",
  mixins: [PreviewMethodsMixin, RouterMixin],
  metaInfo: {
    title: 'Detail'
  },
  data() {
    return {
      categories: null as string[] | null,
      molecular_formula: null as string | null,
      element_with_charge: '',
      headers: [
        {
          title: 'Expression',
          align: 'start',
          key: 'expression_string',
        },
        { title: 'Constant Kind', align: 'end', key: 'constant_kind' },
        { title: 'Temp (°C)', align: 'end', key: 'temperature' },
        { title: 'Ionic Strength (M)', align: 'center', key: 'ionic_strength' },
        { title: 'Value', align: 'start', key: 'value' },
        { title: 'FootNotes', key: 'data-table-expand' },
      ] as never,
      constants: [] as ConstantResultModel[],
      selectedSearchResult: null as ProcessedLigandAdvanceSearchResultModel | null,
      isLoading: true,
      molLoaded: false,
      molData: null as MolDataRawResultModel | null,
      references: [] as ReferenceFetchResultModel[],
      smileStr: null as string | null,
      noDataAvailable: false,
      isIn3DPreviewMode: false,
      groupKeys: [] as GroupKeyModel[],
      groupBy: [] as GroupByModel[],
      itemsPerPage: 40,
      originalData: [] as ConstantResultModel[],
      showUnbalancedData: false,
      failedResources: [] as RequestFailedModel[],
      failedConstantCount: 0,
      failedMolDataCount: 0,
      failedReferenceCount: 0
    }
  },
  methods: {
    getFootNote(id: string){
      return FootNoteUtils.fromLegacyId(id)
    },
    getFormattedConstantKind(kind?: string){
      if(!kind) return '-'

      const latexStr = ElementDisplayUtils.formatConstantKindLatex(kind)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    getConstantKindBadgeColor(kind: string){
      return ElementDisplayUtils.constantKindColor(kind)
    },
    convertExpressionToLatex(str?: string){
      if(!str) return '-'

      const latexStr = ElementDisplayUtils.formatExpressionToLatex(str)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    convertValueWithUncertaintyToLatex1(val?: number, uncertainty?: number, direction?: string, kind?: string){
      return UncertaintyUtils.convertValueWithUncertaintyToLatex1(val, uncertainty, direction, kind)
    },
    convertValueWithUncertaintyToLatex2(val?: number, uncertainty?: number, direction?: string, kind?: string){
      return UncertaintyUtils.convertValueWithUncertaintyToLatex2(val, uncertainty, direction, kind)
    },
    switchPreviewMode(){
      this.isIn3DPreviewMode = !this.isIn3DPreviewMode
      this.molLoaded = false
    },
    async loadPreview(){
      if(!this.molData?.drawCode) return
      if(this.isIn3DPreviewMode)
        await (this as unknown as IPreviewMethodsMixin).load3DMol(this.molData.drawCode, this.notifyMolLoaded)
      else{
        await (this as unknown as IPreviewMethodsMixin).load2DMol(this.molData.drawCode, this.notifyMolLoaded)
        await (this as unknown as IPreviewMethodsMixin).load2DMol(this.molData.drawCode, this.notifyMolLoaded)
      }

      this.molLoaded = true
    },
    getFormattedMetalForm(form?: string){
      if(!form || form === '-') return '-'

      const latexStr = MetalDisplayUtils.formatMetalFormulaString(form)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    getFormattedProtonationForm(pro?: string){
      if(!pro || pro === '-') return '-'

      const latexStr = ProtonationDisplayUtil.formatProtonationString(pro)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    regroup(){
      const temp = []

      for(const state of this.groupKeys){
        if(!state.isChecked) continue
        temp.push({key: state.key})
      }

      this.groupBy = temp
    },
    changeUnbalancedDataState(){
      this.showUnbalancedData = !this.showUnbalancedData

      if(this.showUnbalancedData){
        this.constants = this.originalData
      }
      else{
        this.constants = this.originalData.filter(d => d.expression_string !== undefined).filter(d => unbalancedDataNameList.indexOf(d.expression_string!) === -1)
      }
    },
    retryFailed(){
      for(const fail of this.failedResources)
        fail.action()

      this.failedResources = []
    },
    loadConstants(){
      const store = searchResultStore()

      getConstants(store.selectedSearchResult.ligand_id, store.selectedSearchResult.metal_id)
        .then(result => {
          if(!result) return

          if(!this.categories || this.categories.length === 0){
            let resultCategories: string[] = []
            for(const constant of result){
              resultCategories = resultCategories.concat(constant.categories ?? [])
            }

            this.categories = Array.from(new Set(resultCategories))

            if(this.categories.length === 0)
              this.categories = null
          }

          if(!this.molecular_formula){
            const temp = new LigandAdvanceSearchResultModel();
            temp.molecular_formula = result[0].molecular_formula ?? new MolecularFormula()

            this.molecular_formula = ProcessedLigandAdvanceSearchResultModel.process(temp).molecular_formula
          }

          if(result.length === 1 && result[0].expression_string === "*"){
            this.noDataAvailable = true
          }

          const filteredData = []

          for(let i = result.length - 1; i > 0; i--){
            const constant = result[i]

            if(constant.expression_string === undefined) continue
            if(unbalancedDataNameList.indexOf(constant.expression_string) === -1){
              filteredData.push(constant)
            }
          }

          this.originalData = result
          this.constants = filteredData

          this.groupBy = [{key: 'expression_string'}, {key: 'constant_kind'}]
          this.groupKeys = [
            {
              key: 'expression_string',
              name: 'Expression',
              isChecked: true
            },
            {
              key: 'constant_kind',
              name: 'Constant Kind',
              isChecked: true
            },
            {
              key: 'ionic_strength',
              name: 'Ionic Strength',
              isChecked: false
            },
            {
              key: 'value',
              name: 'Value',
              isChecked: false
            },
            {
              key: 'temperature',
              name: 'Temperature',
              isChecked: false
            }
          ]
        })
        .catch(async err => {
          this.failedConstantCount += 1

          if(this.failedConstantCount < 3){
            await new Promise(r => setTimeout(r, 500 * this.failedConstantCount));
            this.loadConstants()
            return
          }

          this.failedResources.push({
            resourceName: 'Constants',
            detail: err,
            action: () => this.loadConstants()
          })
        })
    },
    notifyMolLoaded(){
      this.molLoaded = true
    },
    loadMolData(){
      if(!this.selectedSearchResult?.ligand_id) return

      getMolData(this.selectedSearchResult.ligand_id)
        .then(async result => {
          if(!result) return

          this.molData = result
          await (this as unknown as IPreviewMethodsMixin).load2DMol(result.drawCode, this.notifyMolLoaded);
          await (this as unknown as IPreviewMethodsMixin).load2DMol(result.drawCode, this.notifyMolLoaded);

          const smiles = await (this as unknown as IPreviewMethodsMixin).getSmileCode(result.drawCode)

          this.smileStr = smiles
        })
        .catch(async err => {
          this.failedMolDataCount += 1

          if(this.failedMolDataCount < 3){
            await new Promise(r => setTimeout(r, 500 * this.failedMolDataCount));
            this.loadMolData()
            return
          }

          this.failedResources.push({
            resourceName: 'MolData',
            detail: err,
            action: () => this.loadMolData()
          })
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    loadReferences(){
      if(!this.selectedSearchResult?.ligand_id) return

      getReferences(this.selectedSearchResult.ligand_id)
        .then(result => {
          if(!result) return

          this.references = result
        })
        .catch(async err => {
          this.failedReferenceCount += 1

          if(this.failedReferenceCount < 3){
            await new Promise(r => setTimeout(r, 500 * this.failedReferenceCount));
            this.loadReferences()
            return
          }

          this.failedResources.push({
            resourceName: 'References',
            detail: err,
            action: () => this.loadReferences()
          })
        })
    },
    tryFormatGroupTitle(str: string): string{
      if(str.indexOf("/") !== -1 && str.indexOf("L") !== -1 && str.indexOf("[") !== -1 && str.indexOf("]") !== -1)
        return this.convertExpressionToLatex(str).replace("display=\"block\"", "")

      return str
    }
  },
  mounted() {
    const store = searchResultStore()

    this.failedConstantCount = 0
    this.failedMolDataCount = 0
    this.failedReferenceCount = 0

    this.selectedSearchResult = store.selectedSearchResult
    this.categories = store.selectedSearchResult.categories == '' ? null : store.selectedSearchResult.categories?.split(',') ?? null
    this.molecular_formula = store.selectedSearchResult.molecular_formula
    this.element_with_charge = `${store.selectedSearchResult.central_element}<sup>${ElementDisplayUtils.formatElementCharge(+store.selectedSearchResult.metal_charge)}</sup>`

    this.isLoading = true

    this.loadConstants()
    this.loadMolData()
    this.loadReferences()
  },
  computed: {
    molViewStyle(): string{
      const theme = useTheme()
      const background = theme.global.current.value.dark ? 'gray' : 'transparent'

      return `height: 400px; background: ${background}; ${this.molLoaded ? '' : 'display: none;'}`
    }
  }
})
</script>
