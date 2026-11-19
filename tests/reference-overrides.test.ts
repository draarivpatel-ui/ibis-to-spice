import { expect, test } from "bun:test"
import { resolveIbisReferences } from "../lib"
import { referenceFixture } from "./reference-fixture"

test("each reference role accepts an override outside the pin map", () => {
  const explicitReferences = {
    pullup: "drive-supply",
    pulldown: "drive-ground",
    powerClamp: "clamp-supply",
    groundClamp: "clamp-ground",
    external: "threshold-supply",
  }
  expect(
    resolveIbisReferences({ ...referenceFixture(), explicitReferences }),
  ).toStrictEqual(explicitReferences)
})
