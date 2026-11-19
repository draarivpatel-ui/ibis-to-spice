import { parseIbis } from "../lib"

export function referenceFixture(mapping = "", modelReferences = "") {
  const document = parseIbis(`[IBIS Ver] 7.2
[Component] Device
[Pin] signal_name model_name
1 DQ InputBuffer
2 VDD POWER
3 VSS GND
4 VCLAMP power
5 GCLAMP gnd
6 VREF POWER
7 VDD InputBuffer
${mapping}
[Model] InputBuffer
Model_type Input
C_comp 1p 1p 1p
[Voltage Range] 1.2 1.1 1.3
${modelReferences}
[End]`)
  return {
    component: document.components.Device,
    pin: "1",
    pinToSourcePort: { 1: "data", 2: "supply", 3: "ground" },
    buffer: document.getBuffer("InputBuffer"),
  }
}
