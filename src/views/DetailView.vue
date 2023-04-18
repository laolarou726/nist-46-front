<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-card
        class="mx-auto"
        variant="outlined"
      >
        <v-card-actions>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="returnToSearchResultPage">
            Return To Search Page
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-progress-linear
        v-if="isLoading"
        indeterminate
        color="yellow-darken-2"
      ></v-progress-linear>

      <div class="d-flex text-caption text-left mt-8">
        <v-alert
          type="info"
          title="Tips"
          text="If the preview control doesn't show up, please try click [LOAD] button again!"
          variant="tonal"
        ></v-alert>
      </div>

      <v-container class="pa-0 mt-8">
        <v-row no-gutters>
          <v-col :class="$vuetify.display.xs ? '' : 'pr-3'">
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
                    {{this.selectedSearchResult?.name ?? '-'}}
                  </div>
                  <div class="d-flex text-overline mb-1">
                    <v-chip color="blue">
                      <div class="no-katex-html text-h6" v-html="getFormattedProtonationForm(this.selectedSearchResult?.form ?? '-')"></div>
                    </v-chip>
                    <v-chip color="green" class="ml-3">
                      <div class="no-katex-html text-h6" v-html="getFormattedMetalForm(this.selectedSearchResult?.formula_string ?? '-')"></div>
                    </v-chip>
                  </div>
                </div>
              </v-card-item>
              <v-list class="text-left" density="compact" style="overflow-y: auto; max-height: 400px;">
                <v-list-item>
                  Expression:
                  <span v-if="!this.molecular_formula">-</span>
                  <span v-else v-html="this.molecular_formula"></span>
                </v-list-item>
                <v-list-item>SMILE: {{this.smileStr}}</v-list-item>
                <v-list-item>Ligand ID: {{this.selectedSearchResult?.ligand_id ?? '-'}}</v-list-item>
                <v-list-item>Metal ID: {{this.selectedSearchResult?.metal_id ?? '-'}}</v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col :class="$vuetify.display.xs ? 'pt-8' : 'pl-3'" v-if="this.molData">
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
                    Mol Preview (2D / 3D)
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

              <v-card-actions :class="(this.molLoaded ? '' : 'fill-height')">
                <v-btn variant="outlined" prepend-icon="mdi-cube-scan" @click="loadPreview">
                  Load
                </v-btn>
                <v-btn variant="outlined" :prepend-icon="(this.isIn3DPreviewMode ? 'mdi-video-3d-off' : 'mdi-video-3d')" @click="switchPreviewMode">
                  Switch To {{this.isIn3DPreviewMode ? '2D' : '3D'}} Preview
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-card
        class="mx-auto mt-8"
        variant="outlined"
      >
        <v-card-item>
          <div>
            <div class="d-flex text-overline mb-1">
              TAGS
            </div>
          </div>
        </v-card-item>

        <div class="text-left">
          <v-chip
            v-for="category in this.categories"
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
        v-model:items-per-page="itemsPerPage"
        :group-by="groupBy"
        :headers="headers"
        :items="constants"
        :items-per-page="itemsPerPage"
        class="mt-8 elevation-1"
      >
        <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
          <tr class="text-left">
            <td :colspan="columns.length">
              <VBtn
                size="small"
                variant="text"
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                @click="toggleGroup(item)"
              ></VBtn>
              <span v-html="item.value"></span>
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
                FootNote: <div class="ml-2" v-html="(getFootNote(item.raw.legacy_identifier) ?? 'None')"></div>
              </v-chip>
            </td>
          </tr>
        </template>
        <template v-slot:[`item.constant_kind`]="{ item }">
          <v-chip :color="getConstantKindBadgeColor(item.raw.constant_kind)">
            <div class="no-katex-html" v-html="getFormattedConstantKind(item.raw.constant_kind)"></div>
          </v-chip>
        </template>
        <template v-slot:[`item.expression_string`]="{ item }">
          <div class="no-katex-html" v-html="convertExpressionToLatex(item.raw.expression_string)"></div>
        </template>
        <template v-slot:[`item.value`]="{ item }">
          <div class="no-katex-html" v-html="convertValueWithUncertaintyToLatex(item.raw.value, item.raw.magnitude)"></div>
        </template>
        <template v-slot:[`item.direction`]="{ item }">
          {{item.raw.direction ?? '-'}}
        </template>
      </v-data-table>

      <v-switch color="primary" label="Show Unbalanced data" @click="changeUnbalancedDataState"></v-switch>

      <v-card
        class="mx-auto mt-8"
        variant="outlined"
        v-if="this.references"
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
            :key="ref.title"
            :title="ref.reference"
            :subtitle="ref.code"
          ></v-list-item>
        </v-list>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<style>
.disabled{
  pointer-events: none;
}

.no-katex-html .katex-html{
  display: none;
}
</style>

<script lang="ts">
import {searchResultStore} from "@/stores/searchResultStore";
import {
  LigandAdvanceSearchResultModel,
  ProcessedLigandAdvanceSearchResultModel
} from "@/models/LigandSearchResultModel";
import {getConstants, getMolData, getReferences} from "@/axiosClient";
import {useTheme} from "vuetify";
import FootNoteUtils from "@/utils/FootNoteUtils";
import { useMeta } from 'vue-meta'
import "openchemlib/full"
import ElementDisplayUtils from "@/utils/ElementDisplayUtils";
import katex from "katex"
import MetalDisplayUtils from "@/utils/MetalDisplayUtils";
import ProtonationDisplayUtil from "@/utils/ProtonationDisplayUtil";

const srcLinks = [
  "https://cdn.jsdelivr.net/gh/BoboRett/MolViewer@v0.52/molViewer.js",
  "https://d3js.org/d3.v5.js",
  "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/build/three.min.js",
  "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/effects/OutlineEffect.js",
  "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/controls/OrbitControls.js"
]

const unbalancedDataNameList = [
  "[L]/[ML(s,amorphous)]",
  "[L]/[ML(s,am)]",
  "[OH][L]/[MOHL(s)]"
]

export default {
  name: "DetailView",
  setup: () => {
    useMeta({
      title: 'Detail'
    })
  },
  data: () => ({
    items: [],
    categories: [],
    molecular_formula: null,
    element_with_charge: '',
    headers: [
      {
        title: 'Expression',
        align: 'start',
        key: 'expression_string',
      },
      { title: 'Constant Kind', align: 'end', key: 'constant_kind' },
      { title: 'Temp (°C)', align: 'end', key: 'temperature' },
      { title: 'Ionic Strength (M)', align: 'end', key: 'ionic_strength' },
      { title: 'Value', align: 'end', key: 'value' },
      {title: 'Uncertainty Direction', key: 'direction'},
      { title: '', key: 'data-table-expand' },
    ],
    constants: [],
    selectedSearchResult: new ProcessedLigandAdvanceSearchResultModel(),
    isLoading: true,
    molLoaded: false,
    molData: null,
    references: null,
    smileStr: null,
    noDataAvailable: false,
    isIn3DPreviewMode: false,
    groupKeys: [],
    groupBy: [],
    itemsPerPage: 40,
    originalData: [],
    showUnbalancedData: false
  }),
  methods: {
    async loadPreviewScripts(){
      for(const src of srcLinks){
        await this.$loadScript(src)
      }
    },
    async unloadPreviewScripts(){
      for(const src of srcLinks){
        await this.$unloadScript(src)
      }
    },
    async getSmileCode(): Promise<string>{
      await this.$loadScript("https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js")

      const RDKit = await window.initRDKitModule()
      const smiles = RDKit.get_mol(this.molData?.drawCode).get_smiles()

      return smiles
    },
    async load2DMol(){
      await this.loadPreviewScripts()

      const smiles = await this.getSmileCode()
      const molecule2D = new MolViewer.Molecule()
      molecule2D.get2DFromSMILE(smiles);

      const mol2DElement = document.getElementById( "mol2D" );

      mol2DElement.innerHTML = ''

      const mol2D = new MolViewer.Mol2D(null, mol2DElement);

      mol2D.init();
      mol2D.Molecule = molecule2D;
      mol2D.draw()

      this.molLoaded = true
      await this.unloadPreviewScripts()
    },
    async load3DMol(){
      await this.loadPreviewScripts()

      const smiles = await this.getSmileCode()
      const molecule3D = new MolViewer.Molecule()
      molecule3D.get3DFromSMILE(smiles);

      const mol3DElement = document.getElementById( "mol3D" );

      mol3DElement.innerHTML = ''

      // eslint-disable-next-line no-undef
      const mol3D = new MolViewer.Mol3D(null, mol3DElement );

      mol3D.init();

      document.addEventListener( "ajaxComplete", () => {
        mol3D.Molecule = molecule3D; mol3D.draw()
      });

      this.molLoaded = true
      await this.unloadPreviewScripts()
    },
    getFootNote(id: string){
      return FootNoteUtils.fromLegacyId(id)
    },
    returnToSearchResultPage(){
      this.$router.go(-1)
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
    convertValueWithUncertaintyToLatex(val?: number, uncertainty?: number){
      if(!val) return '-'
      if(!uncertainty) return katex.renderToString(val.toString(), { displayMode: true, throwOnError: false })

      const latexStr = `${val}\\pm${uncertainty}`

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    switchPreviewMode(){
      this.isIn3DPreviewMode = !this.isIn3DPreviewMode
      this.molLoaded = false
    },
    async loadPreview(){
      if(this.isIn3DPreviewMode)
        await this.load3DMol()
      else
        await this.load2DMol()
    },
    getFormattedMetalForm(form: string){
      const latexStr = MetalDisplayUtils.formatMetalFormulaString(form)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    getFormattedProtonationForm(pro: string){
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
        this.constants = this.originalData.filter(d => unbalancedDataNameList.indexOf(d.expression_string) === -1)
      }
    }
  },
  mounted() {
    const store = searchResultStore()

    this.selectedSearchResult = store.selectedSearchResult
    this.categories = store.selectedSearchResult.categories?.split(',')
    this.molecular_formula = store.selectedSearchResult.molecular_formula
    this.element_with_charge = `${store.selectedSearchResult.central_element}<sup>${ElementDisplayUtils.formatElementCharge(store.selectedSearchResult.metal_charge)}</sup>`
    this.items = []

    for(const key of Object.keys(store.selectedSearchResult)){
      if(!store.selectedSearchResult[key]) continue

      this.items.push(`${key}: ${store.selectedSearchResult[key]}`)
    }

    this.isLoading = true
    getConstants(store.selectedSearchResult.ligand_id, store.selectedSearchResult.metal_id)
      .then(result => {
        if(!result) return

        if(!this.categories || this.categories.length === 0){
          let resultCategories = []
          for(const constant of result){
            resultCategories = resultCategories.concat(constant.categories)
          }

          this.categories = Array.from(new Set(resultCategories))
        }

        if(!this.molecular_formula){
          const temp = new LigandAdvanceSearchResultModel();
          temp.molecular_formula = result[0].molecular_formula

          this.molecular_formula = ProcessedLigandAdvanceSearchResultModel.process(temp).molecular_formula
        }

        if(result.length === 1 && result[0].expression_string === "*"){
          this.noDataAvailable = true
        }

        const filteredData = []

        for(let i = result.length - 1; i > 0; i--){
          const constant = result[i]

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
      .finally(() => {
        this.isLoading = false
      })

    getMolData(this.selectedSearchResult.ligand_id)
      .then(async result => {
        if(!result) return

        this.molData = result

        await this.$loadScript("https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js")

        const smiles = await this.getSmileCode()

        this.smileStr = smiles
      })

    getReferences(this.selectedSearchResult.ligand_id)
      .then(result => {
        if(!result) return

        this.references = result
      })
  },
  computed: {
    molViewStyle(): string{
      const theme = useTheme()
      const background = theme.global.current.value.dark ? 'gray' : 'transparent'

      return `height: 400px; background: ${background}; ${this.molLoaded ? '' : 'display: none;'}`
    }
  }
}
</script>

<style scoped>

</style>
