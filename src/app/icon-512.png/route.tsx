import { ImageResponse } from "next/og";
import { markSvgPaddedDataUri } from "@/lib/app-mark";

// Icono de 512×512 referenciado desde `manifest.ts` (también como "maskable").
const size = { width: 512, height: 512 };

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markSvgPaddedDataUri} width={size.width} height={size.height} alt="" />
      </div>
    ),
    { ...size },
  );
}
