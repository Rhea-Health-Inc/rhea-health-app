import type { DeviceStatus } from "@/lib/devices";

/**
 * Visual representation of a registered device, keyed by the device's
 * modelId. Models with a render get the 3D-style illustration; any other
 * model falls back to its flat product image treatment. When Rhea ships
 * real per-model assets, they slot into this registry — the rest of the
 * Devices UI does not change.
 */
export function DeviceVisual({
  modelId,
  status,
  className = "w-24 h-24",
}: {
  modelId: string;
  status?: DeviceStatus;
  className?: string;
}) {
  if (modelId === "rhea-recorder") {
    return <RecorderRender status={status} className={className} />;
  }
  return <ProductImageFallback className={className} />;
}

const LED: Record<DeviceStatus, string> = {
  connected: "#3E9B6B",
  pairing: "#E8A33D",
  disconnected: "#9AA39C",
};

function RecorderRender({ status, className }: { status?: DeviceStatus; className?: string }) {
  const led = status ? LED[status] : LED.connected;
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Rhea Recorder">
      <defs>
        <linearGradient id="dv-body" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#FEFEFD" />
          <stop offset="55%" stopColor="#EFF1ED" />
          <stop offset="100%" stopColor="#D9DDD6" />
        </linearGradient>
        <linearGradient id="dv-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C6CBC2" />
          <stop offset="12%" stopColor="#F4F5F2" />
          <stop offset="88%" stopColor="#F4F5F2" />
          <stop offset="100%" stopColor="#B9BFB4" />
        </linearGradient>
        <linearGradient id="dv-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232B26" />
          <stop offset="100%" stopColor="#141916" />
        </linearGradient>
        <radialGradient id="dv-btn" cx="0.38" cy="0.34" r="0.9">
          <stop offset="0%" stopColor="#3A453E" />
          <stop offset="100%" stopColor="#171D19" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="100" cy="180" rx="58" ry="9" fill="#1A2B20" opacity="0.16" />
      <ellipse cx="100" cy="178" rx="40" ry="6" fill="#1A2B20" opacity="0.14" />

      {/* body */}
      <rect
        x="52"
        y="18"
        width="96"
        height="160"
        rx="27"
        fill="url(#dv-body)"
        stroke="url(#dv-edge)"
        strokeWidth="1.5"
      />
      <rect
        x="52"
        y="18"
        width="96"
        height="160"
        rx="27"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.5"
      />

      {/* side button */}
      <rect x="146" y="62" width="4" height="26" rx="2" fill="#B9BFB4" />

      {/* display */}
      <rect x="66" y="32" width="68" height="30" rx="9" fill="url(#dv-screen)" />
      <g fill="#57B77E">
        <rect x="74" y="44" width="3.5" height="7" rx="1.75" />
        <rect x="81" y="41" width="3.5" height="13" rx="1.75" />
        <rect x="88" y="38" width="3.5" height="19" rx="1.75" />
        <rect x="95" y="42" width="3.5" height="11" rx="1.75" />
        <rect x="102" y="39" width="3.5" height="17" rx="1.75" />
        <rect x="109" y="44" width="3.5" height="7" rx="1.75" />
      </g>
      {/* battery glyph on display */}
      <g stroke="#8FAE9B" fill="none" strokeWidth="1.3">
        <rect x="117" y="42" width="11" height="6.5" rx="1.8" />
      </g>
      <rect x="118.6" y="43.6" width="6" height="3.3" rx="0.8" fill="#8FAE9B" />
      <circle cx="74" cy="54.5" r="1.6" fill={led} />

      {/* microphone grille */}
      <g fill="#A9AEA4">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <circle key={`${r}-${c}`} cx={78 + c * 11} cy={76 + r * 7} r="1.7" />
          )),
        )}
      </g>

      {/* record control */}
      <circle cx="100" cy="128" r="27" fill="none" stroke="#2F6B4F" strokeWidth="3" />
      <circle cx="100" cy="128" r="21.5" fill="url(#dv-btn)" />
      {/* mic glyph */}
      <g stroke="#F2F4F1" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <rect x="96.4" y="117" width="7.2" height="12" rx="3.6" fill="#F2F4F1" stroke="none" />
        <path d="M91.5 125.5a8.5 8.5 0 0 0 17 0" />
        <path d="M100 134v5" />
      </g>

      {/* status LED + USB-C */}
      <circle cx="76" cy="166" r="3" fill={led} />
      <rect x="90" y="163.5" width="20" height="5.5" rx="2.75" fill="#C2C7BE" />
      <rect x="92.5" y="165.2" width="15" height="2.1" rx="1" fill="#8E948A" />
    </svg>
  );
}

/**
 * Fallback for a model without a render: a flat side-profile "product
 * image" treatment on a soft backdrop, used until an approved asset for
 * that model is added to the registry above.
 */
function ProductImageFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Recording device">
      <rect x="14" y="14" width="172" height="172" rx="24" fill="#EFF3EE" />
      <ellipse cx="100" cy="152" rx="46" ry="7" fill="#1A2B20" opacity="0.14" />
      <rect
        x="58"
        y="42"
        width="84"
        height="112"
        rx="24"
        fill="#E3E7E1"
        stroke="#C6CBC2"
        strokeWidth="1.5"
      />
      <rect x="70" y="54" width="60" height="24" rx="8" fill="#232B26" />
      <circle cx="100" cy="112" r="19" fill="none" stroke="#2F6B4F" strokeWidth="3" />
      <circle cx="100" cy="112" r="13" fill="#171D19" />
      <rect x="88" y="142" width="24" height="5" rx="2.5" fill="#C2C7BE" />
    </svg>
  );
}
