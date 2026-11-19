import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("two rail pins mapped to the same port resolve to one candidate", () => {
  const fixture = referenceFixture()
  expect(
    resolveIbisReferences({
      ...fixture,
      pinToSourcePort: { ...fixture.pinToSourcePort, 4: "supply" },
    }).pullup,
  ).toBe("supply")
})
