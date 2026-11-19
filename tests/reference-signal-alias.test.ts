import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("a bus can use a rail's signal name as an alias", () => {
  const fixture = referenceFixture(`[Pin Mapping] pulldown_ref pullup_ref
1 VSS VDD`)
  expect(
    resolveIbisReferences({
      ...fixture,
      pinToSourcePort: {
        ...fixture.pinToSourcePort,
        4: "other-supply",
        7: "signal",
      },
    }).pullup,
  ).toBe("supply")
})
