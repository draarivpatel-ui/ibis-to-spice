import { expect, test } from "bun:test"
import { resolveIbisReferenceVoltages } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("absent references use the selected supply voltage and zero volts", () => {
  const { buffer } = referenceFixture()
  expect(resolveIbisReferenceVoltages({ buffer, corner: "minimum" })).toEqual({
    pullup: 1.1,
    pulldown: 0,
    powerClamp: 1.1,
    groundClamp: 0,
  })
})
