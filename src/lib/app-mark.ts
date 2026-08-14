// Marca del logo compartida entre los distintos iconos generados
// (`apple-icon.tsx`, `icon-192.png`, `icon-512.png`). Variante cuadrada, sin
// esquinas redondeadas: iOS aplica su propia máscara squircle, así que
// redondear aquí también dejaría un halo.
export const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#d6432c" />
  <path d="M 132 212 L 256 112 L 380 212" fill="none" stroke="#f3eee3" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 132 392 L 256 292 L 380 392" fill="none" stroke="#f3eee3" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export const markDataUri = `data:image/svg+xml,${encodeURIComponent(markSvg)}`;

// Variante con margen: el logo ocupa la zona segura central (~65%) del
// lienzo. La usan los iconos del manifest (`icon-192.png`, `icon-512.png`)
// porque Android puede recortar los iconos "maskable" a un círculo — iOS, en
// cambio, ignora los iconos del manifest y usa `apple-icon` con su propia
// máscara squircle, así que ese no necesita este margen.
export const markSvgPadded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#d6432c" />
  <g transform="translate(87 87) scale(0.66)">
    <path d="M 132 212 L 256 112 L 380 212" fill="none" stroke="#f3eee3" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 132 392 L 256 292 L 380 392" fill="none" stroke="#f3eee3" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

export const markSvgPaddedDataUri = `data:image/svg+xml,${encodeURIComponent(markSvgPadded)}`;
