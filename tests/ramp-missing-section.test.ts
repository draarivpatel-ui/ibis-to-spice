import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("models without a Ramp section have undefined ramp data", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] IN
Model_type Input
[Model] OUT
Model_type Output
[End]`)
  expect(file.getBuffer("IN").ramp).toBeUndefined()
  expect(file.getBuffer("OUT").ramp).toBeUndefined()
})
