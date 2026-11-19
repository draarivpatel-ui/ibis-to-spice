import { cornerValue, IbisError } from "./parse-ibis"
import type {
  IbisBuffer,
  IbisComponent,
  IbisCorner,
  IbisRange,
  IbisReferencePorts,
  IbisReferenceVoltages,
  ResolvedIbisReferencePorts,
} from "./types"

export const IBIS_REFERENCE_ERROR_CODES = {
  ambiguous: "ambiguous_reference",
  invalid: "invalid_reference",
  shorted: "invalid_reference",
} as const

/** The reason distinguishes shorted drive rails from malformed overrides. */
export class IbisReferenceError extends IbisError {
  constructor(
    public readonly reason: keyof typeof IBIS_REFERENCE_ERROR_CODES,
    message: string,
  ) {
    super(IBIS_REFERENCE_ERROR_CODES[reason], message)
  }
}

const GROUND_REFERENCE: IbisRange = [0, 0, 0]

/** Resolve the four scalar references using the IBIS 7.2 §6.1 defaults. */
export function resolveIbisReferenceVoltages({
  buffer,
  corner,
}: {
  buffer: IbisBuffer
  corner: IbisCorner
}): IbisReferenceVoltages {
  const { voltage } = buffer
  // Without [Voltage Range], all four references are required.
  if (voltage) cornerValue(voltage, "typical", "voltage")
  const ground = voltage ? GROUND_REFERENCE : undefined
  return {
    pullup: cornerValue(
      buffer.pullupReference ?? voltage,
      corner,
      "pullup reference",
    ),
    pulldown: cornerValue(
      buffer.pulldownReference ?? ground,
      corner,
      "pulldown reference",
    ),
    powerClamp: cornerValue(
      buffer.powerClampReference ?? voltage,
      corner,
      "power clamp reference",
    ),
    groundClamp: cornerValue(
      buffer.groundClampReference ?? ground,
      corner,
      "ground clamp reference",
    ),
  }
}

/** Resolve the local reference ports for a physical IBIS signal pin. */
export function resolveIbisReferences({
  component,
  pin,
  pinToSourcePort,
  explicitReferences,
  voltageCheck,
}: {
  component: IbisComponent
  pin: string
  pinToSourcePort: Readonly<Record<string, string>>
  explicitReferences?: IbisReferencePorts
  /** Check whether the selected buffer and corner require separate clamp rails. */
  voltageCheck?: { buffer: IbisBuffer; corner: IbisCorner }
}): ResolvedIbisReferencePorts {
  const explicit = explicitReferences ?? {}
  const vendor = component.pinMapping[pin]
  for (const [role, port] of Object.entries(explicit)) {
    if (port !== undefined && (typeof port !== "string" || !port)) {
      throw new IbisReferenceError(
        "invalid",
        `${pin}: ${role} reference must name a local TSX port`,
      )
    }
  }

  const infer = (role: keyof IbisReferencePorts): string => {
    const override = explicit[role]
    if (override) return override

    const kind = role === "pulldown" || role === "groundClamp" ? "gnd" : "power"
    const network = vendor?.[role]
    const railRole = role === "external" ? "pullup" : role
    const candidates = new Set<string>()
    for (const [railPin, port] of Object.entries(pinToSourcePort)) {
      const candidate = component.pins[railPin]
      if (candidate?.model.toLowerCase() !== kind) continue
      if (
        !network ||
        component.pinMapping[railPin]?.[railRole] === network ||
        candidate.signal === network ||
        railPin === network
      ) {
        candidates.add(port)
      }
    }
    const [port] = candidates
    if (candidates.size !== 1) {
      throw new IbisReferenceError(
        "ambiguous",
        `${pin}: explicit ${role} reference required; vendor data does not identify exactly one mapped ${kind} port`,
      )
    }
    return port
  }

  const pullup = infer("pullup")
  const pulldown = infer("pulldown")
  if (voltageCheck) {
    const { buffer } = voltageCheck
    const nominal = resolveIbisReferenceVoltages(voltageCheck)
    if (
      buffer.powerClamp &&
      !explicit.powerClamp &&
      !vendor?.powerClamp &&
      nominal.powerClamp !== nominal.pullup
    ) {
      throw new IbisReferenceError(
        "ambiguous",
        `${pin}: explicit powerClamp reference required because vendor scalar reference differs from pullup and no vendor clamp network identifies the rail`,
      )
    }
    if (
      buffer.groundClamp &&
      !explicit.groundClamp &&
      !vendor?.groundClamp &&
      nominal.groundClamp !== nominal.pulldown
    ) {
      throw new IbisReferenceError(
        "ambiguous",
        `${pin}: explicit groundClamp reference required because vendor scalar reference differs from pulldown and no vendor clamp network identifies the rail`,
      )
    }
  }

  // Missing clamp mappings follow their corresponding drive rails.
  const references: ResolvedIbisReferencePorts = {
    pullup,
    pulldown,
    powerClamp:
      explicit.powerClamp || vendor?.powerClamp ? infer("powerClamp") : pullup,
    groundClamp:
      explicit.groundClamp || vendor?.groundClamp
        ? infer("groundClamp")
        : pulldown,
  }
  if (pullup === pulldown) {
    throw new IbisReferenceError(
      "shorted",
      `${pin}: pullup and pulldown references must differ`,
    )
  }
  if (explicit.external || vendor?.external) {
    const external = infer("external")
    if (external) references.external = external
  }
  return references
}
