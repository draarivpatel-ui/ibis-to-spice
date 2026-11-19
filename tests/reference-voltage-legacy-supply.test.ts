import { expect, test } from "bun:test"
import { convertIbisBuffer } from "../lib"
import {
  referenceVoltageFixture,
  separateReferenceRanges,
} from "./reference-voltage-fixture"

test("two-rail conversion needs a supply voltage for its reference offsets", () => {
  const document = referenceVoltageFixture({ ranges: separateReferenceRanges })
  expect(() =>
    convertIbisBuffer(document, "InputBuffer", { mode: "input" }),
  ).toThrow(
    expect.objectContaining({
      code: "missing_corner",
      message: "voltage has no typical value",
    }),
  )
})
