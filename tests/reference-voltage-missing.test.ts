import { expect, test } from "bun:test"
import { convertIbisBuffer } from "../lib"
import {
  referenceVoltageFixture,
  separateReferenceRanges,
} from "./reference-voltage-fixture"

test("each explicit reference is required when Voltage Range is absent", () => {
  const roles = ["pullup", "pulldown", "power clamp", "ground clamp"]
  for (const [index, role] of roles.entries()) {
    const document = referenceVoltageFixture({
      ranges: separateReferenceRanges.filter((_, i) => i !== index),
    })
    expect(() =>
      convertIbisBuffer(document, "InputBuffer", {
        mode: "input",
        separateReferences: true,
      }),
    ).toThrow(
      expect.objectContaining({
        code: "missing_corner",
        message: `${role} reference has no typical value`,
      }),
    )
  }
})
