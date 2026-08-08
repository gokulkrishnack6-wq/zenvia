// SVG Data URIs matching the exact cute cat-ear mini thermal pocket printer provided by the user.

function encodeSVG(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

// 1. Exact Front View - Cute Cat Mini Thermal Printer (Pink)
export const catPrinterMain = "https://tse4.mm.bing.net/th/id/OIP.djdoxepVxGVA960II8lpcAHaHa?r=0&w=640&h=640&rs=1&pid=ImgDetMain&o=7&rm=3";


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
