import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Stripe-styled SVG favicon with signature blurple gradient squircle, subtle inner highlight, and crisp white "J" lettermark
function getStripeFaviconSvg(isDark = false) {
  const bgGrad1 = isDark ? '#726BFF' : '#726BFF';
  const bgGrad2 = isDark ? '#635BFF' : '#635BFF';
  const bgGrad3 = isDark ? '#4338CA' : '#4F46E5';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="stripeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGrad1}" />
      <stop offset="48%" stop-color="${bgGrad2}" />
      <stop offset="100%" stop-color="${bgGrad3}" />
    </linearGradient>
    <linearGradient id="stripeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.08" />
    </linearGradient>
  </defs>

  <!-- Stripe signature squircle tile -->
  <rect width="128" height="128" rx="28" fill="url(#stripeGrad)" />
  <rect x="0.75" y="0.75" width="126.5" height="126.5" rx="27.25" fill="none" stroke="url(#stripeBorder)" stroke-width="1.5" />

  <!-- Iconic Stripe-Styled Geometric "J" Lettermark (Centered: 64, 64) -->
  <path
    fill="#FFFFFF"
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M 71 32 L 89 32 L 89 72 C 89 85.5 78 96 64 96 C 50 96 39 85.5 39 72 L 39 63 L 57 63 L 57 71 C 57 75 60 78 64 78 C 68 78 71 75 71 71 L 71 32 Z"
  />
</svg>`;
}

// 512x512 High-Res App Icon for Apple Touch Icon & PWA Launchers
function getStripeAppIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="stripeGrad512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7A73FF" />
      <stop offset="50%" stop-color="#635BFF" />
      <stop offset="100%" stop-color="#4338CA" />
    </linearGradient>
    <linearGradient id="stripeBorder512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1" />
    </linearGradient>
  </defs>

  <!-- Background tile with subtle border -->
  <rect width="512" height="512" rx="112" fill="url(#stripeGrad512)" />
  <rect x="3" y="3" width="506" height="506" rx="109" fill="none" stroke="url(#stripeBorder512)" stroke-width="6" />

  <!-- Centered Stripe-Styled "J" Icon scaled 4x -->
  <g transform="scale(4)">
    <path
      fill="#FFFFFF"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M 71 32 L 89 32 L 89 72 C 89 85.5 78 96 64 96 C 50 96 39 85.5 39 72 L 39 63 L 57 63 L 57 71 C 57 75 60 78 64 78 C 68 78 71 75 71 71 L 71 32 Z"
    />
  </g>
</svg>`;
}

// 1024x1024 Social Avatar & Hero Asset
function getStripeAvatarSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="stripeGrad1024" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7A73FF" />
      <stop offset="48%" stop-color="#635BFF" />
      <stop offset="100%" stop-color="#4338CA" />
    </linearGradient>
    <linearGradient id="stripeBorder1024" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.08" />
    </linearGradient>
  </defs>

  <!-- Canvas background -->
  <rect width="1024" height="1024" fill="#0B0E17" />

  <!-- Centered squircle tile -->
  <g transform="translate(162, 162)">
    <rect width="700" height="700" rx="155" fill="url(#stripeGrad1024)" />
    <rect x="4" y="4" width="692" height="692" rx="151" fill="none" stroke="url(#stripeBorder1024)" stroke-width="8" />

    <!-- Centered Stripe J Icon -->
    <g transform="translate(30, 0) scale(5.0)">
      <path
        fill="#FFFFFF"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M 71 32 L 89 32 L 89 72 C 89 85.5 78 96 64 96 C 50 96 39 85.5 39 72 L 39 63 L 57 63 L 57 71 C 57 75 60 78 64 78 C 68 78 71 75 71 71 L 71 32 Z"
      />
    </g>
  </g>
</svg>`;
}

async function run() {
  const publicDir = path.resolve('public');

  // 1. Dynamic SVG favicons
  const stripeFaviconSvg = getStripeFaviconSvg(false);
  const stripeDarkFaviconSvg = getStripeFaviconSvg(true);

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), stripeFaviconSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon-light.svg'), stripeFaviconSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon-dark.svg'), stripeDarkFaviconSvg);
  console.log('Wrote Stripe-styled J SVG favicons');

  // 2. High-res rasterizations using sharp
  const svgBuffer = Buffer.from(stripeFaviconSvg);
  const darkSvgBuffer = Buffer.from(stripeDarkFaviconSvg);
  const appIconBuffer = Buffer.from(getStripeAppIconSvg());
  const avatarSvgBuffer = Buffer.from(getStripeAvatarSvg());

  // 32x32 light & dark
  await sharp(svgBuffer, { density: 300 })
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-light-32x32.png'));

  await sharp(darkSvgBuffer, { density: 300 })
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-dark-32x32.png'));

  // Main 32x32, 16x16, 48x48
  await sharp(svgBuffer, { density: 300 })
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharp(svgBuffer, { density: 300 })
    .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  await sharp(svgBuffer, { density: 300 })
    .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon-48x48.png'));

  // Main favicon.png (512x512)
  await sharp(appIconBuffer, { density: 600 })
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon.png'));

  // Apple Touch Icon (180x180) & Launcher icons (192, 512)
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

  await sharp(appIconBuffer, { density: 600 })
    .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  await sharp(appIconBuffer, { density: 600 })
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  await sharp(appIconBuffer, { density: 600 })
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 1024x1024 OpenGraph avatar
  await sharp(avatarSvgBuffer, { density: 300 })
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'justclub-avatar.jpg'));

  // Also write 32x32 PNG as favicon.ico
  const ico32Buffer = await sharp(svgBuffer, { density: 300 })
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32Buffer);

  console.log('All Stripe-styled "J" favicons, app icons, and avatar images generated successfully!');
}

run().catch(console.error);
