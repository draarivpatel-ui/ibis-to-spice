import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("an omitted ramp load leaves loadOhms unset", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] OUT
Model_type Output
[Ramp]
dV/dt_r 1/1n NA NA
dV/dt_f 1/2n NA NA
[End]`)
  const ramp = file.getBuffer("OUT").ramp
  expect(ramp).toBeDefined()
  expect(ramp).not.toHaveProperty("loadOhms")
})
