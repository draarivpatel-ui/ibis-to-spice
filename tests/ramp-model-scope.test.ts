import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("case-distinct models keep their own ramp data", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] Fast
Model_type Output
[Ramp]
dV/dt_r 1/1n NA NA
dV/dt_f 1/2n NA NA
[Model Spec]
Vinh 2 NA NA
[Model] FAST
Model_type Output
[ramp]
dv/dt_r 1/4n NA NA
dV/dt_f 1/8n NA NA
[End]`)
  expect(file.getBuffer("Fast").ramp?.rising[0]?.timeSeconds).toBe(1e-9)
  expect(file.getBuffer("FAST").ramp?.rising[0]?.timeSeconds).toBe(4e-9)
})
