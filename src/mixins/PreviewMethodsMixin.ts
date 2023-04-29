import {srcLinks} from "@/Constants";
import { defineComponent } from 'vue'

interface PreviewMethodsMixin{
  loadPreviewScripts(): Promise<void>;
  unloadPreviewScripts(): Promise<void>;
  getSmileCode(): Promise<string>;
}

export default defineComponent({
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

      // @ts-ignore
      const RDKit = await window.initRDKitModule()
      // @ts-ignore
      const smiles = RDKit.get_mol(this.molData?.drawCode).get_smiles()

      return smiles
    }
  }
}) as unknown as PreviewMethodsMixin;
