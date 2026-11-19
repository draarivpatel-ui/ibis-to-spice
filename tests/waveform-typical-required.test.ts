import { expect, test } from "bun:test"
import { parseIbis } from "../lib"

test("both waveform directions require a typical voltage at every time", () => {
  for (const kind of ["Rising", "Falling"]) {
    const document = parseIbis(`[IBIS Ver] 7.2
[Model] Driver
Model_type Output
C_comp 1p 1p 1p
[Voltage Range] 1.2 1.1 1.3
[${kind} Waveform]
R_fixture = 50
V_fixture = 0
0 0 NA NA
1n NA 0.6 NA
2n 1.2 NA NA
[End]`)
    expect(() => document.getBuffer("Driver")).toThrow(
      expect.objectContaining({
        code: "missing_corner",
        message: `Driver: ${kind.toLowerCase()} waveform sample at 1e-9 s has no typical value`,
      }),
    )
  }
})
