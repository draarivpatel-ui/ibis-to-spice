import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("an empty explicit reference is invalid", () => {
  expect(() =>
    resolveIbisReferences({
      ...referenceFixture(),
      explicitReferences: { pullup: "" },
    }),
  ).toThrow(
    expect.objectContaining({
      code: "invalid_reference",
      reason: "invalid",
      message: "1: pullup reference must name a local TSX port",
    }),
  )
})
