import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("an unmapped ground rail requires an explicit pulldown", () => {
  expect(() =>
    resolveIbisReferences({
      ...referenceFixture(),
      pinToSourcePort: { 1: "data", 2: "supply" },
    }),
  ).toThrow(
    expect.objectContaining({
      code: "ambiguous_reference",
      message:
        "1: explicit pulldown reference required; vendor data does not identify exactly one mapped gnd port",
    }),
  )
})
