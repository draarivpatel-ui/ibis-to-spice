import { parseIbis } from "../lib"

export const separateReferenceRanges = [
  "[Pullup Reference] 1.2 1.1 1.3",
  "[Pulldown Reference] 0.2 0.1 0.3",
  "[POWER Clamp Reference] 1.5 1.4 1.6",
  "[GND Clamp Reference] 0.4 0.3 0.5",
]

export function referenceVoltageFixture({ ranges }: { ranges: string[] }) {
  return parseIbis(`[IBIS Ver] 7.2
[Model] InputBuffer
Model_type Input
C_comp 1p 1p 1p
${ranges.join("\n")}
[End]`)
}
