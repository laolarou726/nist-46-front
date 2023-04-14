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
                  <div class="d-flex text-h6 mb-1">
                    Ligand Basic Information
                    (<div v-html="element_with_charge"></div>)
                  </div>
                </div>
              </v-card-item>
              <v-list :items="items" class="text-left" density="compact" style="overflow-y: auto; height: 160px;">
                <template v-slot:title="{ title }">
                  <div v-html="title"></div>
                </template>
              </v-list>
            </v-card>
          </v-col>
          <v-col :class="$vuetify.display.xs ? 'pt-8' : 'pl-3'">
            <v-card
              class="mx-auto fill-height"
              variant="outlined"
            >
              <v-card-item>
                <div>
                  <div class="d-flex text-overline mb-1">
                    EXTRA
                  </div>
                  <div class="d-flex text-h6 mb-1">
                    Ligand Extra Information
                  </div>
                </div>
              </v-card-item>
              <div class="text-left text-h4 pl-5 pb-8" v-html="this.molecular_formula"></div>
              <div class="text-left pl-5 pb-8" v-if="this.smileStr">Smiles String: {{this.smileStr}}</div>
              <div class="text-left ml-2">
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
          </v-col>
        </v-row>
      </v-container>

      <v-card
        v-if="this.molData"
        class="mx-auto mt-8"
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
            <div class="d-flex text-caption text-left">
              <v-alert
                type="info"
                title="Tips"
                text="If the preview control doesn't show up, please try click [LOAD] button again!"
                variant="tonal"
              ></v-alert>
            </div>
          </div>
        </v-card-item>

        <v-container>
          <v-row no-gutters>
            <v-col xs="12" md="6">
              <div id="mol2D" :style="molViewStyle" class="disabled"></div>
            </v-col>
            <v-col xs="12" md="6">
              <div id="mol3D" :style="molViewStyle"></div>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <v-btn variant="outlined" prepend-icon="mdi-cube-scan" @click="load3DMol">
            Load
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-alert
        v-if="noDataAvailable"
        type="error"
        title="No Data Available"
        text="It appears that this particular combination does not have available data for presentation. Therefore, the data table has been hidden."
        variant="tonal"
        icon="mdi-flask-empty-off-outline"
        class="mt-8 text-left"
      ></v-alert>
      <v-data-table
        v-else
        v-model:items-per-page="itemsPerPage"
        multi-sort
        :headers="headers"
        :items="constants"
        class="mt-8 elevation-1"
      >
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
        <template v-slot:item.constant_kind="{ item }">
          <v-chip :color="getConstantKindBadgeColor(item.raw.constant_kind)">
            <div class="no-katex-html" v-html="getFormattedConstantKind(item.raw.constant_kind)"></div>
          </v-chip>
        </template>
        <template v-slot:item.expression_string="{ item }">
          <div class="no-katex-html" v-html="convertExpressionToLatex(item.raw.expression_string)"></div>
        </template>
      </v-data-table>

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
    itemsPerPage: 5,
    element_with_charge: '',
    headers: [
      {
        title: 'Expression',
        align: 'start',
        key: 'expression_string',
      },
      { title: 'Value', align: 'end', key: 'value' },
      { title: 'Constant Kind', align: 'end', key: 'constant_kind' },
      { title: 'Temp (°C)', align: 'end', key: 'temperature' },
      { title: 'Ionic Strength', align: 'end', key: 'ionic_strength' },
      { title: '', key: 'data-table-expand' }
    ],
    constants: [],
    selectedSearchResult: new ProcessedLigandAdvanceSearchResultModel(),
    isLoading: true,
    molLoaded: false,
    molData: null,
    references: null,
    smileStr: null,
    noDataAvailable: false
  }),
  methods: {
    async load3DMol(){
      const srcLinks = [
        "https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js",
        "https://d3js.org/d3.v5.js",
        "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/build/three.min.js",
        "https://cdn.jsdelivr.net/gh/BoboRett/MolViewer@v0.52/molViewer.js",
        "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/effects/OutlineEffect.js",
        "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/controls/OrbitControls.js"
      ]

      for(const src of srcLinks){
        await this.$loadScript(src)
      }

      const RDKit = await window.initRDKitModule();
      const smiles = RDKit.get_mol(this.molData?.drawCode).get_smiles();

      // eslint-disable-next-line no-undef
      const molecule3D = new MolViewer.Molecule()
      molecule3D.get3DFromSMILE(smiles);

      const molecule2D = new MolViewer.Molecule()
      molecule2D.get2DFromSMILE(smiles);

      const mol2DElement = document.getElementById( "mol2D" );
      const mol3DElement = document.getElementById( "mol3D" );

      mol2DElement.innerHTML = ''
      mol3DElement.innerHTML = ''

      // eslint-disable-next-line no-undef
      const mol2D = new MolViewer.Mol2D(null, mol2DElement );
      const mol3D = new MolViewer.Mol3D(null, mol3DElement );

      mol2D.init();
      mol3D.init();

      document.addEventListener( "ajaxComplete", () => {
        mol3D.Molecule = molecule3D; mol3D.draw()
        mol2D.Molecule = molecule2D; mol2D.draw()
      } );

      this.molLoaded = true

      for(const src of srcLinks){
        await this.$unloadScript(src)
      }
    },
    getFootNote(id: string){
      return FootNoteUtils.fromLegacyId(id)
    },
    returnToSearchResultPage(){
      this.$router.go(-1)
    },
    getFormattedConstantKind(kind: string){
      const latexStr = ElementDisplayUtils.formatConstantKindLatex(kind)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    getConstantKindBadgeColor(kind: string){
      return ElementDisplayUtils.constantKindColor(kind)
    },
    convertExpressionToLatex(str: string){
      const latexStr = ElementDisplayUtils.formatExpressionToLatex(str)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
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
          return
        }

        this.constants = result
      })
      .finally(() => {
        this.isLoading = false
      })

    getMolData(this.selectedSearchResult.ligand_id)
      .then(async result => {
        if(!result) return

        this.molData = result

        await this.$loadScript("https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js")

        const RDKit = await window.initRDKitModule()
        const smiles = RDKit.get_mol(this.molData?.drawCode).get_smiles()

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
