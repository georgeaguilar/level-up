import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Variante cuadrada (sin esquinas redondeadas): iOS aplica su propia
// máscara squircle, así que redondear aquí también dejaría un halo.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#d6432c" />
  <path d="M 132 212 L 256 112 L 380 212" fill="none" stroke="#f3eee3" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 132 392 L 256 292 L 380 392" fill="none" stroke="#f3eee3" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const markDataUri = `data:image/svg+xml,${encodeURIComponent(markSvg)}`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri} width={size.width} height={size.height} alt="" />
      </div>
    ),
    { ...size },
  );
}
