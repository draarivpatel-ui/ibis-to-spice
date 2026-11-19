import { expect, test } from "bun:test"
import { bufferTables, convertIbisBuffer } from "../lib"
import {
  referenceVoltageFixture,
  separateReferenceRanges,
} from "./reference-voltage-fixture"

test("separate-reference conversion accepts all four explicit voltages without Voltage Range", () => {
  const document = referenceVoltageFixture({ ranges: separateReferenceRanges })
  const converted = convertIbisBuffer(document, "InputBuffer", {
    corner: "minimum",
    mode: "input",
    separateReferences: true,
  })
  expect(converted.source).toContain("PAD PU_REF PD_REF PC_REF GC_REF")
  expect(bufferTables(converted.buffer, "minimum").refs).toEqual({
    pu: 1.1,
    pd: 0.1,
    pc: 1.4,
    gc: 0.3,
  })
})
