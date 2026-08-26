// SVG Data URIs matching the exact cute cat-ear mini thermal pocket printer provided by the user.

function encodeSVG(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

// 1. Exact Front View - Cute Cat Mini Thermal Printer (Pink)
export const catPrinterMain = encodeSVG(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDFBF7" />
      <stop offset="100%" stop-color="#F4EFEA" />
    </linearGradient>
    <linearGradient id="earPink" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFB7D5" />
      <stop offset="100%" stop-color="#F48FB1" />
    </linearGradient>
    <linearGradient id="earPinkInner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF80AB" />
      <stop offset="100%" stop-color="#F50057" />
    </linearGradient>
    <linearGradient id="bodyWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F9F7F5" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#3E2723" flood-opacity="0.12" />
    </filter>
    <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="600" height="600" fill="url(#bgGrad)" />

  <!-- Shadow below printer -->
  <ellipse cx="300" cy="510" rx="140" ry="22" fill="#2D1810" opacity="0.1" />

  <!-- Printer Main Group -->
  <g filter="url(#softShadow)">
    
    <!-- Outer Casing Back (Pink Accent Border) -->
    <rect x="156" y="86" width="288" height="398" rx="80" fill="#F48FB1" />

    <!-- Left Cat Ear -->
    <path d="M 190 100 C 180 30, 260 25, 270 96 Z" fill="url(#earPink)" />
    <path d="M 205 98 C 200 50, 250 45, 255 96 Z" fill="url(#earPinkInner)" opacity="0.4" />

    <!-- Right Cat Ear -->
    <path d="M 330 96 C 340 25, 420 30, 410 100 Z" fill="url(#earPink)" />
    <path d="M 345 96 C 350 45, 400 50, 395 98 Z" fill="url(#earPinkInner)" opacity="0.4" />

    <!-- Front White Body Casing -->
    <rect x="162" y="92" width="276" height="386" rx="74" fill="url(#bodyWhite)" stroke="#E8E2DC" stroke-width="2" />

    <!-- Cute Face Details -->
    <!-- Left Whiskers/Blush (( )) -->
    <path d="M 226 226 C 220 220, 220 234, 226 238" stroke="#4A3525" stroke-width="4" stroke-linecap="round" fill="none" />
    <path d="M 216 228 C 210 222, 210 232, 216 236" stroke="#4A3525" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Right Whiskers/Blush (( )) -->
    <path d="M 374 226 C 380 220, 380 234, 374 238" stroke="#4A3525" stroke-width="4" stroke-linecap="round" fill="none" />
    <path d="M 384 228 C 390 222, 390 232, 384 236" stroke="#4A3525" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Left Eye (Big Sparkling Eye) -->
    <circle cx="260" cy="232" r="22" fill="#3D2314" />
    <circle cx="253" cy="225" r="9" fill="#FFFFFF" />
    <circle cx="267" cy="238" r="4.5" fill="#FFFFFF" />

    <!-- Right Eye (Big Sparkling Eye) -->
    <circle cx="340" cy="232" r="22" fill="#3D2314" />
    <circle cx="333" cy="225" r="9" fill="#FFFFFF" />
    <circle cx="347" cy="238" r="4.5" fill="#FFFFFF" />

    <!-- Cute '3' or 'w' Mouth -->
    <path d="M 282 264 C 290 278, 300 274, 300 266 C 300 274, 310 278, 318 264" stroke="#3D2314" stroke-width="5" stroke-linecap="round" fill="none" />

    <!-- Center Division Line / Paper Slot -->
    <line x1="162" y1="300" x2="438" y2="300" stroke="#E2DAD1" stroke-width="3" />

    <!-- Serrated Tear Blade Track -->
    <rect x="190" y="295" width="220" height="10" fill="#2B2B2B" rx="3" />
    <!-- Serrated Teeth -->
    <path d="M 192 300 L 196 295 L 200 300 L 204 295 L 208 300 L 212 295 L 216 300 L 220 295 L 224 300 L 228 295 L 232 300 L 236 295 L 240 300 L 244 295 L 248 300 L 252 295 L 256 300 L 260 295 L 264 300 L 268 295 L 272 300 L 276 295 L 280 300 L 284 295 L 288 300 L 292 295 L 296 300 L 300 295 L 304 300 L 308 295 L 312 300 L 316 295 L 320 300 L 324 295 L 328 300 L 332 295 L 336 300 L 340 295 L 344 300 L 348 295 L 352 300 L 356 295 L 360 300 L 364 295 L 368 300 L 372 295 L 376 300 L 380 295 L 384 300 L 388 295 L 392 300 L 396 295 L 400 300" stroke="#555" stroke-width="1.5" fill="none" />

    <!-- Printed Thermal Paper Coming Out -->
    <g filter="url(#paperShadow)">
      <path d="M 205 300 L 395 300 L 395 440 L 205 440 Z" fill="#FFFFFF" stroke="#E5E0DA" stroke-width="1.5" />
      
      <!-- Printed Content on Paper -->
      <text x="300" y="330" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#222">✨ TODAY'S TO-DO LIST</text>
      <line x1="220" y1="340" x2="380" y2="340" stroke="#333" stroke-width="1" stroke-dasharray="3 3" />

      <!-- Checkbox items -->
      <rect x="222" y="354" width="12" height="12" rx="3" fill="none" stroke="#333" stroke-width="1.5" />
      <path d="M 224 360 L 227 363 L 232 356" stroke="#10B981" stroke-width="2" fill="none" />
      <text x="242" y="364" font-family="sans-serif" font-size="12" font-weight="600" fill="#333">Study Notes & Labels</text>

      <rect x="222" y="378" width="12" height="12" rx="3" fill="none" stroke="#333" stroke-width="1.5" />
      <path d="M 224 384 L 227 387 L 232 380" stroke="#10B981" stroke-width="2" fill="none" />
      <text x="242" y="388" font-family="sans-serif" font-size="12" font-weight="600" fill="#333">Print Cute Stickers 🐱</text>

      <rect x="222" y="402" width="12" height="12" rx="3" fill="none" stroke="#333" stroke-width="1.5" />
      <text x="242" y="412" font-family="sans-serif" font-size="12" font-weight="500" fill="#666">Journaling Memories</text>

      <!-- Thermal Paper Bottom Serrated Edge -->
      <path d="M 205 440 L 210 444 L 215 440 L 220 444 L 225 440 L 230 444 L 235 440 L 240 444 L 245 440 L 250 444 L 255 440 L 260 444 L 265 440 L 270 444 L 275 440 L 280 444 L 285 440 L 290 444 L 295 440 L 300 444 L 305 440 L 310 444 L 315 440 L 320 444 L 325 440 L 330 444 L 335 440 L 340 444 L 345 440 L 350 444 L 355 440 L 360 444 L 365 440 L 370 444 L 375 440 L 380 444 L 385 440 L 390 444 L 395 440" fill="#FFFFFF" stroke="#E5E0DA" stroke-width="1.5" />
    </g>

    <!-- Side Power Button on Right Edge -->
    <rect x="438" y="270" width="10" height="34" rx="4" fill="#F48FB1" />

  </g>
</svg>
`);

// 2. Desk Lifestyle View (Angle Shot on Desk with Pen & Coffee)
export const catPrinterDesk = encodeSVG(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="deskBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF7F2" />
      <stop offset="100%" stop-color="#EFE6DD" />
    </linearGradient>
  </defs>

  <rect width="600" height="600" fill="url(#deskBg)" />

  <!-- Wooden Desk Texture / Mat -->
  <rect x="40" y="80" width="520" height="460" rx="24" fill="#FFFFFF" opacity="0.7" />
  
  <!-- Pastel Gel Pen -->
  <rect x="70" y="160" width="180" height="12" rx="6" fill="#F48FB1" transform="rotate(25 70 160)" />
  <polygon points="230,238 245,245 235,230" fill="#3D2314" />

  <!-- Coffee Cup Top View -->
  <circle cx="480" cy="160" r="45" fill="#E8D5C4" />
  <circle cx="480" cy="160" r="38" fill="#6D4C41" />
  <circle cx="480" cy="160" r="32" fill="#5D4037" />
  <!-- Heart Latte Art -->
  <path d="M 474 158 C 474 150, 480 150, 480 156 C 480 150, 486 150, 486 158 C 486 166, 480 170, 480 174 C 480 170, 474 166, 474 158 Z" fill="#FFF3E0" />

  <!-- Cute Cat Mini Thermal Printer in Center -->
  <g transform="translate(180, 120)">
    <!-- Shadow -->
    <ellipse cx="120" cy="340" rx="100" ry="18" fill="#3E2723" opacity="0.1" />

    <!-- Printer Outer Casing -->
    <rect x="20" y="20" width="200" height="290" rx="55" fill="#F48FB1" />

    <!-- Left Ear -->
    <path d="M 45 28 C 38 -20, 95 -24, 102 24 Z" fill="#FFB7D5" />
    <!-- Right Ear -->
    <path d="M 138 24 C 145 -24, 202 -20, 195 28 Z" fill="#FFB7D5" />

    <!-- Inner White Face -->
    <rect x="25" y="25" width="190" height="280" rx="50" fill="#FFFFFF" />

    <!-- Cat Face -->
    <circle cx="90" cy="120" r="15" fill="#3D2314" />
    <circle cx="85" cy="115" r="6" fill="#FFFFFF" />

    <circle cx="150" cy="120" r="15" fill="#3D2314" />
    <circle cx="145" cy="115" r="6" fill="#FFFFFF" />

    <!-- Mouth -->
    <path d="M 108 142 C 114 152, 120 150, 120 144 C 120 150, 126 152, 132 142" stroke="#3D2314" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <!-- Slot -->
    <rect x="45" y="170" width="150" height="7" fill="#333" rx="2" />

    <!-- Long Strip of Thermal Photo / Label -->
    <rect x="55" y="174" width="130" height="150" fill="#FFFFFF" stroke="#DDD" stroke-width="1" />
    <text x="120" y="205" text-anchor="middle" font-size="11" font-weight="bold" font-family="sans-serif">STUDY NOTES</text>
    <line x1="70" y1="215" x2="170" y2="215" stroke="#888" stroke-width="1" stroke-dasharray="2 2" />
    <circle cx="85" cy="235" r="8" fill="#E8F5E9" />
    <text x="100" y="239" font-size="10" font-family="sans-serif" font-weight="bold">Physics Formulas</text>

    <circle cx="85" cy="260" r="8" fill="#FFF3E0" />
    <text x="100" y="264" font-size="10" font-family="sans-serif" font-weight="bold">Math Diagram</text>
  </g>
</svg>
`);

// 3. Mint Green Cat Ear Edition
export const catPrinterGreen = encodeSVG(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#F1F8E9" />
  <g transform="translate(150, 80)">
    <rect x="0" y="0" width="300" height="420" rx="80" fill="#A5D6A7" />
    <!-- Ears -->
    <path d="M 35 15 C 25 -50, 115 -55, 125 10 Z" fill="#81C784" />
    <path d="M 175 10 C 185 -55, 275 -50, 265 15 Z" fill="#81C784" />
    <!-- White Casing -->
    <rect x="8" y="8" width="284" height="404" rx="72" fill="#FFFFFF" />
    <!-- Eyes -->
    <circle cx="105" cy="150" r="22" fill="#2E4631" />
    <circle cx="98" cy="143" r="9" fill="#FFFFFF" />
    <circle cx="195" cy="150" r="22" fill="#2E4631" />
    <circle cx="188" cy="143" r="9" fill="#FFFFFF" />
    <!-- Mouth -->
    <path d="M 132 185 C 142 198, 150 194, 150 186 C 150 194, 158 198, 168 185" stroke="#2E4631" stroke-width="5" fill="none" stroke-linecap="round" />
    <!-- Slot -->
    <rect x="35" y="220" width="230" height="10" fill="#333" rx="3" />
    <!-- Printed Strip -->
    <rect x="50" y="225" width="200" height="120" fill="#FFFFFF" stroke="#C8E6C9" stroke-width="2" />
    <text x="150" y="265" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#2E4631">🌿 MINT GREEN EDITION</text>
    <text x="150" y="295" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#4CAF50">Bluetooth 5.0 • 200 DPI</text>
  </g>
</svg>
`);

// 4. Sky Blue Cat Ear Edition
export const catPrinterBlue = encodeSVG(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#E3F2FD" />
  <g transform="translate(150, 80)">
    <rect x="0" y="0" width="300" height="420" rx="80" fill="#90CAF9" />
    <!-- Ears -->
    <path d="M 35 15 C 25 -50, 115 -55, 125 10 Z" fill="#64B5F6" />
    <path d="M 175 10 C 185 -55, 275 -50, 265 15 Z" fill="#64B5F6" />
    <!-- White Casing -->
    <rect x="8" y="8" width="284" height="404" rx="72" fill="#FFFFFF" />
    <!-- Eyes -->
    <circle cx="105" cy="150" r="22" fill="#1565C0" />
    <circle cx="98" cy="143" r="9" fill="#FFFFFF" />
    <circle cx="195" cy="150" r="22" fill="#1565C0" />
    <circle cx="188" cy="143" r="9" fill="#FFFFFF" />
    <!-- Mouth -->
    <path d="M 132 185 C 142 198, 150 194, 150 186 C 150 194, 158 198, 168 185" stroke="#1565C0" stroke-width="5" fill="none" stroke-linecap="round" />
    <!-- Slot -->
    <rect x="35" y="220" width="230" height="10" fill="#333" rx="3" />
    <!-- Printed Strip -->
    <rect x="50" y="225" width="200" height="120" fill="#FFFFFF" stroke="#BBDEFB" stroke-width="2" />
    <text x="150" y="265" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1565C0">☁️ SKY BLUE EDITION</text>
    <text x="150" y="295" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1E88E5">Inkless Wireless Thermal</text>
  </g>
</svg>
`);
