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
    async getSmileCode(drawCode: string): Promise<string>{
      await this.$loadScript("https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js")

      // @ts-ignore
      const RDKit = await window.initRDKitModule()
      // @ts-ignore
      const smiles = RDKit.get_mol(drawCode).get_smiles()

      return smiles
    },
    async load2DMol(drawCode: string, callback: () => void = () => {}){
      await this.loadPreviewScripts()

      const smiles = await this.getSmileCode(drawCode)

      // @ts-ignore
      // eslint-disable-next-line no-undef
      const molecule2D = new MolViewer.Molecule()
      molecule2D.get2DFromSMILE(smiles);

      const mol2DElement = document.getElementById( "mol2D" );

      // @ts-ignore
      mol2DElement.innerHTML = ''

      // @ts-ignore
      // eslint-disable-next-line no-undef
      const mol2D = new MolViewer.Mol2D(null, mol2DElement);

      mol2D.init();
      mol2D.Molecule = molecule2D;
      mol2D.draw()

      callback();
      await this.unloadPreviewScripts()
    },
    async load3DMol(drawCode: string, callback: () => void = () => {}){
      await this.loadPreviewScripts()

      const smiles = await this.getSmileCode(drawCode)
      // @ts-ignore
      // eslint-disable-next-line no-undef
      const molecule3D = new MolViewer.Molecule()
      molecule3D.get3DFromSMILE(smiles);

      const mol3DElement = document.getElementById( "mol3D" );

      // @ts-ignore
      mol3DElement.innerHTML = ''

      // @ts-ignore
      // eslint-disable-next-line no-undef
      const mol3D = new MolViewer.Mol3D(null, mol3DElement );

      mol3D.init();

      document.addEventListener( "ajaxComplete", () => {
        mol3D.Molecule = molecule3D; mol3D.draw()
      });

      callback();
      await this.unloadPreviewScripts()
    }
  }
}) as unknown as PreviewMethodsMixin;
