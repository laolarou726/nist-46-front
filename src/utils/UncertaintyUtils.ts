import katex from "katex";

export default class UncertaintyUtils{
  public static convertValueWithUncertaintyToLatex1(val?: number, uncertainty?: number, direction?: string, kind?: string): string{
    if(!val) return '-'

    if(!kind) return katex.renderToString(val.toString(), { displayMode: true, throwOnError: false })

    const signDic: Record<string, string> = {
      'Positive': '+',
      'Negative': '-',
      'Both': '\\pm',
      '-': ''
    }
    const unitDic: Record<string, string> = {
      'Enthalpy': '\\frac{kCal}{mol}',
      'Entropy': '\\frac{Cal}{mol \\Kappa}',
      'Equilibrium': '',
      '-': ''
    }
    const latexStr = `${val}${signDic[direction ?? '-']}${uncertainty ?? ''}\\space${unitDic[kind ?? '-']}`

    return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
  }

  public static convertValueWithUncertaintyToLatex2(val?: number, uncertainty?: number, direction?: string, kind?: string){
    if(!val) return '-'

    if(kind && kind !== "Equilibrium"){
      val *= 4.184

      if(uncertainty){
        uncertainty *= 4.184
        uncertainty.toFixed(0)
      }
    }

    if(!kind) return katex.renderToString(val.toString(), { displayMode: true, throwOnError: false })

    const signDic: Record<string, string> = {
      'Positive': '+',
      'Negative': '-',
      'Both': '\\pm',
      '-': ''
    }
    const unitDic: Record<string, string> = {
      'Enthalpy': '\\frac{kJ}{mol}',
      'Entropy': '\\frac{J}{mol \\Kappa}',
      '-': ''
    }
    const latexStr = `${val.toFixed(1)}${signDic[direction ?? '-']}${(uncertainty?.toFixed(0)) ?? ''}\\space${unitDic[kind ?? '-']}`

    return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
  }
}
