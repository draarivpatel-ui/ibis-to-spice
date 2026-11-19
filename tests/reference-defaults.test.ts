import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("unmapped clamps follow the inferred drive rails", () => {
  expect(resolveIbisReferences(referenceFixture())).toStrictEqual({
    pullup: "supply",
    pulldown: "ground",
    powerClamp: "supply",
    groundClamp: "ground",
  })
})
