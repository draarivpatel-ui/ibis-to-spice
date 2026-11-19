import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("pullup and pulldown must resolve to distinct ports", () => {
  expect(() =>
    resolveIbisReferences({
      ...referenceFixture(),
      explicitReferences: { pullup: "shared", pulldown: "shared" },
    }),
  ).toThrow(
    expect.objectContaining({
      code: "invalid_reference",
      reason: "shorted",
      message: "1: pullup and pulldown references must differ",
    }),
  )
})
