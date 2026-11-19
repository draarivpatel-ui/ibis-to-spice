import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("an incomplete ramp direction leaves the other direction usable", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] OUT
Model_type Output
[Ramp]
dV/dt_r 1/na NA NA
dV/dt_f 1/2n NA NA
[End]`)
  const ramp = file.getBuffer("OUT").ramp
  expect(ramp?.rising).toEqual([null, null, null])
  expect(ramp?.falling).toEqual([{ voltage: 1, timeSeconds: 2e-9 }, null, null])
})
