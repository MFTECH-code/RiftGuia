interface RiftGuiaLogoProps {
  compact?: boolean;
}

export function RiftGuiaLogo({ compact = false }: RiftGuiaLogoProps) {
  return (
    <div className={`site-logo ${compact ? 'compact' : ''}`.trim()} aria-label="Rift Guia Brasil">
      <svg className="site-logo-mark" viewBox="0 0 96 96" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="rgGold" x1="18" x2="78" y1="10" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff2b0" />
            <stop offset="0.48" stopColor="#f1b75f" />
            <stop offset="1" stopColor="#b46f2b" />
          </linearGradient>
          <linearGradient id="rgBrazil" x1="18" x2="80" y1="76" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#159447" />
            <stop offset="0.48" stopColor="#f4d35e" />
            <stop offset="1" stopColor="#1f6feb" />
          </linearGradient>
          <radialGradient id="rgGlow" cx="50%" cy="44%" r="52%">
            <stop offset="0" stopColor="#61c6ff" stopOpacity="0.95" />
            <stop offset="0.48" stopColor="#1f6feb" stopOpacity="0.54" />
            <stop offset="1" stopColor="#061015" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="site-logo-shadow" fill="rgba(0, 0, 0, 0.56)" d="M48 5 85 25v42L48 91 11 67V25L48 5Z" />
        <path className="site-logo-frame" fill="url(#rgGold)" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.2" d="M48 8 82 27v39L48 88 14 66V27L48 8Z" />
        <path className="site-logo-inner" fill="#07151b" stroke="rgba(97, 198, 255, 0.24)" strokeWidth="1" d="M48 17 73 31v29L48 78 23 60V31L48 17Z" />
        <circle className="site-logo-glow" fill="url(#rgGlow)" cx="48" cy="47" r="24" />
        <path className="site-logo-rift" fill="rgba(234, 248, 255, 0.92)" d="M62 25c-13 2-25 11-25 24 0 10 8 16 18 15-3 5-9 8-16 8-12 0-21-9-21-21 0-18 18-32 44-26Z" />
        <path className="site-logo-rift-cut" fill="rgba(6, 16, 21, 0.94)" d="M35 48c5-8 16-13 28-12-4 6-10 10-18 12 6 2 11 6 14 12-12 1-22-3-24-12Z" />
        <path className="site-logo-ribbon" fill="url(#rgBrazil)" d="M19 63c18-6 35-12 58-9-13 5-24 12-32 24-7-8-15-12-26-15Z" />
        <path className="site-logo-star" fill="#f4d35e" d="M48 34 51 43 60 46 51 49 48 58 45 49 36 46 45 43 48 34Z" />
      </svg>
      <span className="site-logo-copy">
        <span className="site-logo-kicker">Rift</span>
        <span className="site-logo-name">Guia</span>
        <span className="site-logo-country">Brasil</span>
      </span>
    </div>
  );
}
