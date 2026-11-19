import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("unavailable minimum and maximum ramp corners are null", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] OUT
Model_type Output
[Ramp]
dV/dt_r 1/1n NA 2/2n
dV/dt_f 1/1n 0.5/2n NA
[End]`)
  const ramp = file.getBuffer("OUT").ramp
  expect(ramp?.rising).toEqual([
    { voltage: 1, timeSeconds: 1e-9 },
    null,
    { voltage: 2, timeSeconds: 2e-9 },
  ])
  expect(ramp?.falling).toEqual([
    { voltage: 1, timeSeconds: 1e-9 },
    { voltage: 0.5, timeSeconds: 2e-9 },
    null,
  ])
})
