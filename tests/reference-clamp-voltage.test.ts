import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("the selected corner can require a dedicated clamp rail", () => {
  const fixture = referenceFixture(
    "",
    `[Power Clamp Reference] 1.2 0.8 1.3
[Power Clamp]
-1 -1m -1m -1m
1 1m 1m 1m`,
  )
  expect(
    resolveIbisReferences({
      ...fixture,
      voltageCheck: { buffer: fixture.buffer, corner: "typical" },
    }).powerClamp,
  ).toBe("supply")
  expect(() =>
    resolveIbisReferences({
      ...fixture,
      voltageCheck: { buffer: fixture.buffer, corner: "minimum" },
    }),
  ).toThrow(
    expect.objectContaining({
      code: "ambiguous_reference",
      message:
        "1: explicit powerClamp reference required because vendor scalar reference differs from pullup and no vendor clamp network identifies the rail",
    }),
  )
})
