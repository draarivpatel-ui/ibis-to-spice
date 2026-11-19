import { expect, test } from "bun:test"
import { convertIbisBuffer } from "../lib"
import {
  referenceVoltageFixture,
  separateReferenceRanges,
} from "./reference-voltage-fixture"

test("a supplied Voltage Range still needs a typical value with separate references", () => {
  const document = referenceVoltageFixture({
    ranges: [...separateReferenceRanges, "[Voltage Range] NA 1.1 1.3"],
  })
  expect(() =>
    convertIbisBuffer(document, "InputBuffer", {
      mode: "input",
      separateReferences: true,
    }),
  ).toThrow(
    expect.objectContaining({
      code: "missing_corner",
      message: "voltage has no typical value",
    }),
  )
})
