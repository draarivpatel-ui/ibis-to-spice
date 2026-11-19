import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("inline comments and whitespace do not change parsed ramp data", () => {
  const file = parseIbis(`[IBIS Ver] 7.2
[Model] OUT| model comment
Model_type Output
[Ramp]| section comment
dV/dt_r\t1/1n\tNA\tNA| rising comment
dV/dt_f 1/2n NA NA| falling comment
R_load=300ohms| load comment
[End]`)
  expect(file.getBuffer("OUT").ramp).toEqual({
    rising: [{ voltage: 1, timeSeconds: 1e-9 }, null, null],
    falling: [{ voltage: 1, timeSeconds: 2e-9 }, null, null],
    loadOhms: 300,
  })
})
