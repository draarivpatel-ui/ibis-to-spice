import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("an explicit ramp load is parsed in ohms", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] OUT
Model_type Output
[Ramp]
dV/dt_r 1/1n NA NA
dV/dt_f 1/2n NA NA
R_load = 0.3kohms
[End]`)
  expect(file.getBuffer("OUT").ramp?.loadOhms).toBe(300)
})
