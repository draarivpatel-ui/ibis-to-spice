import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("pin mapping resolves separate rail buses for all five roles", () => {
  const fixture =
    referenceFixture(`[Pin Mapping] pulldown_ref pullup_ref gnd_clamp_ref power_clamp_ref ext_ref
1 DG DP CG CP ER
2 NC DP NC NC NC
3 DG NC NC NC NC
4 NC NC NC CP NC
5 NC NC CG NC NC
6 NC ER NC NC NC`)
  expect(
    resolveIbisReferences({
      ...fixture,
      pinToSourcePort: {
        ...fixture.pinToSourcePort,
        4: "clamp-supply",
        5: "clamp-ground",
        6: "threshold-supply",
      },
    }),
  ).toStrictEqual({
    pullup: "supply",
    pulldown: "ground",
    powerClamp: "clamp-supply",
    groundClamp: "clamp-ground",
    external: "threshold-supply",
  })
})
