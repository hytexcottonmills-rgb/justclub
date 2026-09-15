import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Clean, razor-sharp SVG source for JustClub emblem (NO destructive blur filters!)
function getSvg(isDark = false) {
  const emblemColor = isDark ? '#FFFFFF' : '#4A154B';
  const ringColor = isDark ? '#FFFFFF' : '#4A154B';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <mask id="clubCutout">
      <!-- Reveal base -->
      <rect width="128" height="128" fill="white" />
      <!-- Cutout the 3-leaf club clover geometry inside the 'd' loop -->
      <circle cx="53" cy="66.5" r="6.8" fill="black" />
      <circle cx="45.5" cy="75" r="6.8" fill="black" />
      <circle cx="60.5" cy="75" r="6.8" fill="black" />
      <circle cx="53" cy="72.5" r="5.2" fill="black" />
      <path d="M 53 72.5 L 47.8 84 L 58.2 84 Z" fill="black" />
    </mask>
  </defs>

  <g mask="url(#clubCutout)">
    <!-- Outer Circular Ring with opening for vertical stem -->
    <path
      d="M 64.5 26 A 46 46 0 1 0 100 66"
      fill="none"
      stroke="${ringColor}"
      stroke-width="9.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Lower loop of lowercase 'd' / musical note -->
    <circle cx="53" cy="73.5" r="21.5" fill="${emblemColor}" />

    <!-- Musical note stem with beveled angled apex -->
    <path
      d="M 64.5 73.5 L 64.5 27 L 75.5 18 L 75.5 73.5 Z"
      fill="${emblemColor}"
    />
  </g>
</svg>`;
}

// App-icon style with dark luxury background for apple-touch-icon & rich favicons
function getAppIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1035" />
      <stop offset="50%" stop-color="#120A24" />
      <stop offset="100%" stop-color="#090514" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#6366F1" stop-opacity="0.2" />
    </linearGradient>
    <mask id="clubCutout512">
      <rect width="512" height="512" fill="white" />
      <!-- Scale 128 -> 512 = factor of 4. Offset centered: (X*3.2 + 51.2) -->
      <!-- We scale the inner group directly -->
    </mask>
  </defs>

  <!-- Background tile with subtle border -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect x="4" y="4" width="504" height="504" rx="108" fill="none" stroke="url(#borderGrad)" stroke-width="4" />

  <!-- Centered Emblem (scaled 3.2x and centered: offset 51.2, 51.2) -->
  <g transform="translate(51.2, 51.2) scale(3.2)">
    <mask id="innerCutout">
      <rect width="128" height="128" fill="white" />
      <circle cx="53" cy="66.5" r="6.8" fill="black" />
      <circle cx="45.5" cy="75" r="6.8" fill="black" />
      <circle cx="60.5" cy="75" r="6.8" fill="black" />
      <circle cx="53" cy="72.5" r="5.2" fill="black" />
      <path d="M 53 72.5 L 47.8 84 L 58.2 84 Z" fill="black" />
    </mask>

    <g mask="url(#innerCutout)">
      <path
        d="M 64.5 26 A 46 46 0 1 0 100 66"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="9.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="53" cy="73.5" r="21.5" fill="#FFFFFF" />
      <path
        d="M 64.5 73.5 L 64.5 27 L 75.5 18 L 75.5 73.5 Z"
        fill="#FFFFFF"
      />
    </g>
  </g>
</svg>`;
}

async function run() {
  const publicDir = path.resolve('public');

  // 1. Dynamic SVG favicon (supports light & dark mode in browser tabs with zero blur!)
  const dynamicFaviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <style>
    :root {
      --emblem-fill: #4A154B;
      --ring-stroke: #4A154B;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --emblem-fill: #FFFFFF;
        --ring-stroke: #FFFFFF;
      }
    }
  </style>
  <defs>
    <mask id="clubMask">
      <rect width="128" height="128" fill="white" />
      <circle cx="53" cy="66.5" r="6.8" fill="black" />
      <circle cx="45.5" cy="75" r="6.8" fill="black" />
      <circle cx="60.5" cy="75" r="6.8" fill="black" />
      <circle cx="53" cy="72.5" r="5.2" fill="black" />
      <path d="M 53 72.5 L 47.8 84 L 58.2 84 Z" fill="black" />
    </mask>
  </defs>
  <g mask="url(#clubMask)">
    <path
      d="M 64.5 26 A 46 46 0 1 0 100 66"
      fill="none"
      stroke="var(--ring-stroke)"
      stroke-width="9.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="53" cy="73.5" r="21.5" fill="var(--emblem-fill)" />
    <path
      d="M 64.5 73.5 L 64.5 27 L 75.5 18 L 75.5 73.5 Z"
      fill="var(--emblem-fill)"
    />
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), dynamicFaviconSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon-light.svg'), getSvg(false));
  fs.writeFileSync(path.join(publicDir, 'favicon-dark.svg'), getSvg(true));
  console.log('Wrote favicon SVGs');

  // 2. High-res rasterizations using sharp
  // For standard transparent favicons:
  const lightSvgBuffer = Buffer.from(getSvg(false));
  const darkSvgBuffer = Buffer.from(getSvg(true));
  const appIconBuffer = Buffer.from(getAppIconSvg());

  // Transparent 32x32 light & dark
  await sharp(lightSvgBuffer, { density: 300 })
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-light-32x32.png'));

  await sharp(darkSvgBuffer, { density: 300 })
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-dark-32x32.png'));

  // Main 32x32, 16x16, 48x48
  await sharp(lightSvgBuffer, { density: 300 })
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharp(lightSvgBuffer, { density: 300 })
    .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  await sharp(lightSvgBuffer, { density: 300 })
    .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-48x48.png'));

  // Main favicon.png (512x512)
  await sharp(lightSvgBuffer, { density: 600 })
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon.png'));

  // Apple Touch Icon (180x180) & Launcher icons (192, 512) with luxury brand tile
  await sharp(appIconBuffer, { density: 600 })
    .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(appIconBuffer, { density: 600 })
    .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'justclub-launcher-192.png'));

  await sharp(appIconBuffer, { density: 600 })
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'justclub-launcher-512.png'));

  console.log('All favicons and app icons generated successfully with sharp!');
}

run().catch(console.error);
