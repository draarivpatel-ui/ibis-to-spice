import { cornerValue, IbisError } from "./parse-ibis"
import type {
  IbisBuffer,
  IbisComponent,
  IbisCorner,
  IbisReferencePorts,
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
    const { buffer, corner } = voltageCheck
    const nominalPullup = cornerValue(
      buffer.pullupReference ?? buffer.voltage,
      corner,
      "pullup reference",
    )
    const nominalPulldown = cornerValue(
      buffer.pulldownReference ?? [0, 0, 0],
      corner,
      "pulldown reference",
    )
    if (
      buffer.powerClamp &&
      !explicit.powerClamp &&
      !vendor?.powerClamp &&
      cornerValue(
        buffer.powerClampReference ?? buffer.voltage,
        corner,
        "power clamp reference",
      ) !== nominalPullup
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
      cornerValue(
        buffer.groundClampReference ?? [0, 0, 0],
        corner,
        "ground clamp reference",
      ) !== nominalPulldown
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
