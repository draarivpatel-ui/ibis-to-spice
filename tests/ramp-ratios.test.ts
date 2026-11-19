import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("rising and falling ramp ratios preserve corner order and scale units", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] OUT
Model_type Output
[Ramp]
dV/dt_r 500mV/2n 250mV/4ns 1V/8p
dV/dt_f 1V/4p 0.5V/8ps 2V/1.e-9
[End]`)
  const ramp = file.getBuffer("OUT").ramp
  expect(ramp?.rising).toEqual([
    { voltage: 0.5, timeSeconds: 2e-9 },
    { voltage: 0.25, timeSeconds: 4e-9 },
    { voltage: 1, timeSeconds: 8e-12 },
  ])
  expect(ramp?.falling).toEqual([
    { voltage: 1, timeSeconds: 4e-12 },
    { voltage: 0.5, timeSeconds: 8e-12 },
    { voltage: 2, timeSeconds: 1e-9 },
  ])
})
