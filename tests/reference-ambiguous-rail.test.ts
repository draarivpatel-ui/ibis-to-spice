import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("multiple mapped ports require an explicit rail", () => {
  const fixture = referenceFixture()
  expect(() =>
    resolveIbisReferences({
      ...fixture,
      pinToSourcePort: { ...fixture.pinToSourcePort, 4: "other-supply" },
    }),
  ).toThrow(
    expect.objectContaining({
      code: "ambiguous_reference",
      message:
        "1: explicit pullup reference required; vendor data does not identify exactly one mapped power port",
    }),
  )
})
