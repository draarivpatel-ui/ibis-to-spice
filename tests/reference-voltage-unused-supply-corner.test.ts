import { expect, test } from "bun:test"
import { convertIbisBuffer } from "../lib"
import {
  referenceVoltageFixture,
  separateReferenceRanges,
} from "./reference-voltage-fixture"

test("explicit minimum references permit NA in an unused minimum supply column", () => {
  const document = referenceVoltageFixture({
    ranges: [...separateReferenceRanges, "[Voltage Range] 1.2 NA 1.3"],
  })
  const converted = convertIbisBuffer(document, "InputBuffer", {
    corner: "minimum",
    mode: "input",
    separateReferences: true,
  })
  expect(converted.source).toContain("PAD PU_REF PD_REF PC_REF GC_REF")
})
