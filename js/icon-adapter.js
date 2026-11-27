/**
 * Liquid Tab - 原生矢量 App 图标与多源 Favicon 智能适配引擎
 * 1. 为常用站点与主流 AI / 开发 / 中文产品提供高精原生矢量圆角图标（零模糊、零丑陋角标、零网络延迟）
 * 2. 对未收录的任意网站自动采用深色曜石液态玻璃容器承载原站 Favicon，并按清晰度智能缩放或降级为精排字母徽标
 */

class SiteIconAdapter {
  constructor() {
    this.cache = new Map();
    this.monoPalettes = [
      ["#2563EB", "#1D4ED8"],
      ["#0F766E", "#115E59"],
      ["#4F46E5", "#3730A3"],
      ["#B45309", "#92400E"],
      ["#BE185D", "#9D174D"],
      ["#334155", "#1E293B"],
      ["#0369A1", "#075985"],
      ["#6D28D9", "#5B21B6"]
    ];
  }

  toSvgDataUri(svgBody) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128">${svgBody}</svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  // 主入口：返回 { src, mode: 'brand' | 'custom' | 'favicon' }
  resolve(url = "", title = "", customIcon = "") {
    if (customIcon && customIcon.trim()) {
      return { src: customIcon.trim(), mode: "custom" };
    }

    const domain = this.extractDomain(url).toLowerCase();
    const cleanTitle = String(title || "").trim();
    const cacheKey = `${domain}|${cleanTitle.toLowerCase()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const brandSvg = this.matchBrandSvg(domain, cleanTitle);
    if (brandSvg) {
      const result = { src: this.toSvgDataUri(brandSvg), mode: "brand" };
      this.cache.set(cacheKey, result);
      return result;
    }

    const faviconUrl = domain
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
      : "";
    const fallback = { src: faviconUrl, mode: "favicon", domain };
    this.cache.set(cacheKey, fallback);
    return fallback;
  }

  extractDomain(rawUrl = "") {
    try {
      let u = String(rawUrl || "").trim();
      if (!u) return "";
      if (!/^https?:\/\//i.test(u)) u = "https://" + u;
      return new URL(u).hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  // 为低清失效图标生成优雅的苹果风渐变首字图标
  buildMonogramSvg(title = "", domain = "") {
    const seed = domain || title || "W";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const [c1, c2] = this.monoPalettes[hash % this.monoPalettes.length];
    const clean = String(title || domain || "W").trim();
    const char = clean.charAt(0).toUpperCase() || "W";
    const isCjk = /[\u4e00-\u9fa5]/.test(char);
    const fontSize = isCjk ? 28 : 30;
    const dy = isCjk ? 42 : 43;
    const escaped = char.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return this.toSvgDataUri(`
      <defs>
        <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill="url(#mg)"/>
      <text x="32" y="${dy}" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei UI', sans-serif" font-size="${fontSize}" font-weight="600">${escaped}</text>
    `);
  }

  // 高精原生矢量品牌图标库（先按域名精准匹配，再对多镜像产品按名称兜底匹配）
  matchBrandSvg(domain, title) {
    const d = domain || "";
    const t = String(title || "").toLowerCase();

    // 1. DeepSeek（流线跃水蓝鲸标志轮廓）
    if (d === "deepseek.com" || d.endsWith(".deepseek.com")) {
      return `
        <defs>
          <linearGradient id="ds" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#5377FF"/>
            <stop offset="100%" stop-color="#3552EB"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#ds)"/>
        <path fill="#FFFFFF" d="M47.6 24.4C45.3 25.1 43.3 26.6 41.9 28.4C40.1 22.8 34.8 18.8 28.4 18.8C20.6 18.8 14.5 24.8 14.5 32.5C14.5 40.5 21.1 46.2 30.2 46.2C36.8 46.2 42.1 42.6 44.3 36.8C45.4 33.9 47.4 31.8 50.4 30.8C51.6 30.4 51.8 28.8 50.7 28.1C49.6 27.4 49 26.2 49.5 25C49.9 24.1 48.6 24.1 47.6 24.4ZM24.2 30.6C23 30.6 22 29.6 22 28.4C22 27.2 23 26.2 24.2 26.2C25.4 26.2 26.4 27.2 26.4 28.4C26.4 29.6 25.4 30.6 24.2 30.6Z"/>
        <path d="M20.5 37.6C24.8 41.2 32.6 41.5 37.4 36.8" fill="none" stroke="#3552EB" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M35.5 24.2C36.8 21.6 39.2 19.6 42.2 19C41.8 21.7 40.2 23.8 38.2 25.2" fill="#FFFFFF"/>
      `;
    }

    // 2. GitHub
    if (d === "github.com" || d.endsWith(".github.com")) {
      return `
        <defs>
          <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#24292F"/>
            <stop offset="100%" stop-color="#0D1117"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#gh)"/>
        <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd" d="M32 13C21.5 13 13 21.5 13 32C13 40.4 18.4 47.5 26 50C26.95 50.17 27.3 49.58 27.3 49.08C27.3 48.62 27.28 47.1 27.27 45.48C22 46.63 20.88 43.25 20.88 43.25C20.02 41.05 18.77 40.47 18.77 40.47C17.05 39.29 18.9 39.32 18.9 39.32C20.8 39.45 21.81 41.27 21.81 41.27C23.5 44.17 26.25 43.33 27.34 42.84C27.51 41.61 28 40.78 28.54 40.31C24.31 39.83 19.87 38.2 19.87 30.92C19.87 28.84 20.61 27.15 21.83 25.82C21.63 25.34 20.98 23.4 22.02 20.78C22.02 20.78 23.62 20.27 27.25 22.73C28.77 22.31 30.39 22.1 32 22.09C33.61 22.1 35.23 22.31 36.75 22.73C40.38 20.27 41.97 20.78 41.97 20.78C43.02 23.4 42.36 25.34 42.16 25.82C43.39 27.15 44.13 28.84 44.13 30.92C44.13 38.22 39.68 39.82 35.44 40.3C36.12 40.88 36.73 42.03 36.73 43.79C36.73 46.32 36.71 48.35 36.71 49.08C36.71 49.59 37.05 50.19 38.02 50C45.57 47.49 51 40.39 51 32C51 21.5 42.5 13 32 13Z"/>
      `;
    }

    // 3. 哔哩哔哩 Bilibili (去除原图丑陋 WEB 角标，回归纯净小电视)
    if (d === "bilibili.com" || d.endsWith(".bilibili.com")) {
      return `
        <defs>
          <linearGradient id="bili" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FF7AA2"/>
            <stop offset="100%" stop-color="#FB7299"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#bili)"/>
        <path d="M22.5 16.5L28 22M41.5 16.5L36 22" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round"/>
        <rect x="14.5" y="22.5" width="35" height="25.5" rx="7.5" fill="none" stroke="#FFFFFF" stroke-width="3.2"/>
        <path d="M24 32.5L26.5 34.5L24 36.5" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M40 32.5L37.5 34.5L40 36.5" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M29.2 38.8C30.4 40.3 33.6 40.3 34.8 38.8" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" fill="none"/>
      `;
    }

    // 4. YouTube
    if (d === "youtube.com" || d.endsWith(".youtube.com") || d === "youtu.be") {
      return `
        <rect width="64" height="64" fill="#FFFFFF"/>
        <rect x="11" y="18" width="42" height="28" rx="8.5" fill="#FF0033"/>
        <path d="M28 25.5L39.5 32L28 38.5V25.5Z" fill="#FFFFFF"/>
      `;
    }

    // 5. 少数派 sspai
    if (d === "sspai.com" || d.endsWith(".sspai.com")) {
      return `
        <defs>
          <linearGradient id="sspai" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E52829"/>
            <stop offset="100%" stop-color="#C81418"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#sspai)"/>
        <path d="M18 25.2C20.5 22.8 24 22 29 22H46.5" stroke="#FFFFFF" stroke-width="4.4" stroke-linecap="round" fill="none"/>
        <path d="M26.5 23.2C26.2 31.5 25.2 38.5 22.8 44" stroke="#FFFFFF" stroke-width="4.4" stroke-linecap="round" fill="none"/>
        <path d="M38.5 23.2V39.2C38.5 42.4 40.2 44 43 43.6" stroke="#FFFFFF" stroke-width="4.4" stroke-linecap="round" fill="none"/>
      `;
    }

    // 6. V2EX
    if (d === "v2ex.com" || d.endsWith(".v2ex.com")) {
      return `
        <defs>
          <linearGradient id="v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#262830"/>
            <stop offset="100%" stop-color="#14151A"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#v2)"/>
        <path d="M18 21H33.5L46 32L33.5 43H18L30.5 32L18 21Z" fill="#FFFFFF"/>
      `;
    }

    // 7. 知乎 Zhihu (官方大字「知」原生 App 图标规范)
    if (d === "zhihu.com" || d.endsWith(".zhihu.com")) {
      return `
        <defs>
          <linearGradient id="zh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1480FF"/>
            <stop offset="100%" stop-color="#005CE6"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#zh)"/>
        <text x="32" y="44" text-anchor="middle" fill="#FFFFFF" font-family="'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei UI', sans-serif" font-size="34" font-weight="700">知</text>
      `;
    }

    // 8. Notion
    if (d === "notion.so" || d === "notion.site" || d.endsWith(".notion.so")) {
      return `
        <rect width="64" height="64" fill="#FFFFFF"/>
        <path d="M17.5 18.2L41.5 16.4L47.5 20.8V45.4L23.5 47.2L17.5 42.4V18.2Z" fill="#FFFFFF" stroke="#18181B" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M17.5 18.2L23.2 22.4L47.2 20.8" fill="none" stroke="#18181B" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M23.2 22.4V47.2" stroke="#18181B" stroke-width="2.4"/>
        <path d="M29.2 40.8V28.4L39.6 40V27.6" fill="none" stroke="#18181B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }

    // 9. Flow (Google Labs)
    if (d === "labs.google" || d.endsWith(".labs.google") || t === "flow") {
      return `
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FDCBF1"/>
            <stop offset="100%" stop-color="#F29EDB"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#flow)"/>
        <path d="M26 16H38M28.5 16V27L19 43.2C17.9 45.1 19.2 47.5 21.4 47.5H42.6C44.8 47.5 46.1 45.1 45 43.2L35.5 27V16" fill="none" stroke="#111318" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M23.2 37.5H40.8L44.2 43.6C44.8 44.7 44 46.2 42.6 46.2H21.4C20 46.2 19.2 44.7 19.8 43.6L23.2 37.5Z" fill="#111318"/>
      `;
    }

    // 10. Google Gemini
    if (d === "gemini.google.com" || t.includes("gemini")) {
      return `
        <defs>
          <linearGradient id="gem" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#4285F4"/>
            <stop offset="45%" stop-color="#8B6CF6"/>
            <stop offset="78%" stop-color="#E66480"/>
            <stop offset="100%" stop-color="#F6B73C"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="#FFFFFF"/>
        <path d="M32 11C34.2 23.6 40.4 29.8 53 32C40.4 34.2 34.2 40.4 32 53C29.8 40.4 23.6 34.2 11 32C23.6 29.8 29.8 23.6 32 11Z" fill="url(#gem)"/>
      `;
    }

    // 11. Google AI Studio (Build | Google AI)
    if (d === "aistudio.google.com" || t.includes("build | google") || t.includes("ai studio")) {
      return `
        <defs>
          <linearGradient id="ais1" x1="16" y1="16" x2="48" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#34A853"/>
            <stop offset="100%" stop-color="#4285F4"/>
          </linearGradient>
          <linearGradient id="ais2" x1="16" y1="30" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#4285F4"/>
            <stop offset="55%" stop-color="#8B5CF6"/>
            <stop offset="100%" stop-color="#EA4335"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="#FFFFFF"/>
        <path d="M23 23.5C23 19.4 26.4 16 30.5 16H40.5C43.5 16 46 18.5 46 21.5C46 24.5 43.5 27 40.5 27H26.5C24.6 27 23 25.4 23 23.5Z" fill="url(#ais1)"/>
        <path d="M18 42.5C18 39.5 20.5 37 23.5 37H37.5C39.4 37 41 38.6 41 40.5C41 44.6 37.6 48 33.5 48H23.5C20.5 48 18 45.5 18 42.5Z" fill="#FBBC05"/>
        <path d="M23.5 27H40.5C43.5 27 46 29.5 46 32.5C46 35.5 43.5 38 40.5 38H23.5C20.5 38 18 35.5 18 32.5C18 29.5 20.5 27 23.5 27Z" fill="url(#ais2)"/>
      `;
    }

    // 12. Codex（优先识别名称或域名含 codex）
    if (d.includes("codex") || t.includes("codex")) {
      return `
        <defs>
          <linearGradient id="cdx" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#141923"/>
            <stop offset="100%" stop-color="#090C12"/>
          </linearGradient>
          <linearGradient id="cdxRing" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#2DD4BF"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#cdx)"/>
        <path d="M44.5 23.2C41.8 18.9 37.2 16 32 16C23.2 16 16 23.2 16 32C16 40.8 23.2 48 32 48C37.4 48 42.1 45 44.8 40.5" fill="none" stroke="url(#cdxRing)" stroke-width="5.2" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="4.8" fill="#67E8F9"/>
      `;
    }

    // 13. ChatGPT / OpenAI（官方六瓣互锁六边形花结标准路径）
    if (d === "chatgpt.com" || d === "chat.openai.com" || d === "openai.com" || t.includes("chatgpt")) {
      return `
        <defs>
          <linearGradient id="gpt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1E2028"/>
            <stop offset="100%" stop-color="#0E1014"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#gpt)"/>
        <g transform="translate(13 13) scale(1.583)">
          <path fill="#FFFFFF" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z"/>
        </g>
      `;
    }

    // 14. Claude (Anthropic 标准有机星芒轮廓)
    if (d === "claude.ai" || d === "anthropic.com" || t.includes("claude")) {
      return `
        <defs>
          <linearGradient id="cld" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E38664"/>
            <stop offset="100%" stop-color="#CC6946"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#cld)"/>
        <g stroke="#FFFFFF" stroke-linecap="round" transform="translate(32 32)">
          <line x1="0" y1="-17.5" x2="0" y2="16.5" stroke-width="3.2"/>
          <line x1="-17" y1="-1" x2="17" y2="1" stroke-width="3"/>
          <line x1="-13.5" y1="-12.5" x2="12.5" y2="13.5" stroke-width="3.1"/>
          <line x1="13" y1="-13" x2="-12.5" y2="12.5" stroke-width="3.1"/>
          <line x1="-6.8" y1="-16" x2="6.2" y2="14.5" stroke-width="2.5"/>
          <line x1="7.5" y1="-15.2" x2="-5.8" y2="15.2" stroke-width="2.5"/>
          <line x1="-15.8" y1="-6.5" x2="15" y2="6.8" stroke-width="2.5"/>
          <line x1="15.8" y1="-6.2" x2="-15.2" y2="6.2" stroke-width="2.5"/>
        </g>
        <circle cx="32" cy="32" r="4.2" fill="#FFFFFF"/>
      `;
    }

    // 15. Z-Library (支持所有镜像域名与名称)
    if (d.includes("z-lib") || d.includes("zlibrary") || d.includes("singlelogin") || d.includes("1lib") || t.includes("z-library")) {
      return `
        <defs>
          <linearGradient id="zlib" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2A4B7C"/>
            <stop offset="100%" stop-color="#172A46"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#zlib)"/>
        <path d="M18 19H46L20 45H46" fill="none" stroke="#FFFFFF" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="28" y="49" width="8" height="2.6" rx="1.3" fill="#60A5FA"/>
      `;
    }

    // 16. v0
    if (d === "v0.dev" || d === "v0.app") {
      return `
        <rect width="64" height="64" fill="#0C0D10"/>
        <text x="32" y="42" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-size="28" font-weight="700" letter-spacing="-1">v0</text>
      `;
    }

    // 17. OpenRouter
    if (d === "openrouter.ai") {
      return `
        <defs>
          <linearGradient id="or" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1C202B"/>
            <stop offset="100%" stop-color="#0E1016"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#or)"/>
        <path d="M17 32H28L36 22H46M28 32L36 42H46" fill="none" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="46" cy="22" r="3.6" fill="#60A5FA"/>
        <circle cx="46" cy="42" r="3.6" fill="#34D399"/>
      `;
    }

    // 18. Perplexity
    if (d === "perplexity.ai" || d.endsWith(".perplexity.ai")) {
      return `
        <rect width="64" height="64" fill="#13222A"/>
        <path d="M32 14V50M18 22L32 32L46 22M18 42L32 32L46 42M22 18V46M42 18V46" fill="none" stroke="#22D3EE" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }

    // 19. Kimi
    if (d.includes("moonshot.cn") || d.includes("kimi.com") || t.includes("kimi")) {
      return `
        <rect width="64" height="64" fill="#12141A"/>
        <path d="M22 18V46M42 18L26 32L43 46" fill="none" stroke="#FFFFFF" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="45" cy="18" r="3.4" fill="#3B82F6"/>
      `;
    }

    // 20. Vercel
    if (d === "vercel.com" || d.endsWith(".vercel.com")) {
      return `
        <rect width="64" height="64" fill="#0B0B0E"/>
        <path d="M32 18L49 46H15L32 18Z" fill="#FFFFFF"/>
      `;
    }

    // 21. Figma
    if (d === "figma.com" || d.endsWith(".figma.com")) {
      return `
        <rect width="64" height="64" fill="#1C1E24"/>
        <path d="M26 14H32V26H26C22.7 26 20 23.3 20 20C20 16.7 22.7 14 26 14Z" fill="#F24E1E"/>
        <path d="M32 14H38C41.3 14 44 16.7 44 20C44 23.3 41.3 26 38 26H32V14Z" fill="#FF7262"/>
        <path d="M26 26H32V38H26C22.7 38 20 35.3 20 32C20 28.7 22.7 26 26 26Z" fill="#A259FF"/>
        <circle cx="38" cy="32" r="6" fill="#1ABCFE"/>
        <path d="M26 38H32V44C32 47.3 29.3 50 26 50C22.7 50 20 47.3 20 44C20 40.7 22.7 38 26 38Z" fill="#0ACF83"/>
      `;
    }

    // 22. X / Twitter
    if (d === "x.com" || d === "twitter.com") {
      return `
        <rect width="64" height="64" fill="#0D0E12"/>
        <path d="M19 17H26.5L33.8 27.2L42.5 17H46.5L35.7 29.6L47.5 47H40L32 35.8L22.5 47H18.5L30.1 33.4L19 17Z" fill="#FFFFFF"/>
      `;
    }

    // 23. Google
    if (d === "google.com") {
      return `
        <rect width="64" height="64" fill="#FFFFFF"/>
        <path d="M48.5 32.4C48.5 31.1 48.4 29.9 48.1 28.8H32V35.6H41.3C40.9 37.8 39.6 39.7 37.7 41V45.4H43.4C46.7 42.3 48.5 37.8 48.5 32.4Z" fill="#4285F4"/>
        <path d="M32 49.2C36.6 49.2 40.5 47.7 43.4 45.4L37.7 41C36.2 42 34.3 42.7 32 42.7C27.5 42.7 23.7 39.7 22.4 35.6H16.5V40.1C19.4 45.8 25.2 49.2 32 49.2Z" fill="#34A853"/>
        <path d="M22.4 35.6C22 34.5 21.8 33.3 21.8 32C21.8 30.7 22 29.5 22.4 28.4V23.9H16.5C15.3 26.3 14.6 29.1 14.6 32C14.6 34.9 15.3 37.7 16.5 40.1L22.4 35.6Z" fill="#FBBC05"/>
        <path d="M32 21.3C34.5 21.3 36.8 22.2 38.6 23.9L43.5 19C40.5 16.2 36.6 14.8 32 14.8C25.2 14.8 19.4 18.2 16.5 23.9L22.4 28.4C23.7 24.3 27.5 21.3 32 21.3Z" fill="#EA4335"/>
      `;
    }

    // 24. Wikipedia
    if (d === "wikipedia.org" || d.endsWith(".wikipedia.org")) {
      return `
        <rect width="64" height="64" fill="#F8F9FA"/>
        <text x="32" y="44" text-anchor="middle" fill="#18181B" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="400">W</text>
      `;
    }

    // 25. 小红书
    if (d === "xiaohongshu.com" || d.endsWith(".xiaohongshu.com")) {
      return `
        <rect width="64" height="64" fill="#FF2442"/>
        <text x="32" y="38" text-anchor="middle" fill="#FFFFFF" font-family="'PingFang SC', 'Microsoft YaHei UI', sans-serif" font-size="16" font-weight="700">小红书</text>
      `;
    }

    // 26. 豆瓣
    if (d === "douban.com" || d.endsWith(".douban.com")) {
      return `
        <rect width="64" height="64" fill="#00B51D"/>
        <text x="32" y="44" text-anchor="middle" fill="#FFFFFF" font-family="'PingFang SC', 'Microsoft YaHei UI', sans-serif" font-size="34" font-weight="700">豆</text>
      `;
    }

    // 27. 飞书
    if (d === "feishu.cn" || d.endsWith(".feishu.cn") || d.endsWith(".larksuite.com")) {
      return `
        <rect width="64" height="64" fill="#FFFFFF"/>
        <path d="M18 22L44 17L34 32L18 22Z" fill="#00D6B9"/>
        <path d="M18 22L34 32L24 46L18 22Z" fill="#3370FF"/>
        <path d="M34 32L46 37L24 46L34 32Z" fill="#1456F0"/>
      `;
    }

    // 28. Cursor
    if (d === "cursor.com" || d === "cursor.sh") {
      return `
        <rect width="64" height="64" fill="#111318"/>
        <path d="M32 14L48 23.2V40.8L32 50L16 40.8V23.2L32 14Z" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M32 14L48 23.2L32 32L16 23.2L32 14Z" fill="#FFFFFF" opacity="0.9"/>
        <path d="M32 32V50L48 40.8V23.2L32 32Z" fill="#FFFFFF" opacity="0.4"/>
      `;
    }

    // 29. Linear
    if (d === "linear.app") {
      return `
        <rect width="64" height="64" fill="#171923"/>
        <circle cx="32" cy="32" r="16" fill="none" stroke="#818CF8" stroke-width="3.2"/>
        <path d="M20 35L29 44M18 29L35 46M22 23L41 42" stroke="#C7D2FE" stroke-width="2.8" stroke-linecap="round"/>
      `;
    }

    // 30. Reddit
    if (d === "reddit.com" || d.endsWith(".reddit.com")) {
      return `
        <rect width="64" height="64" fill="#FF4500"/>
        <ellipse cx="32" cy="36" rx="15" ry="11" fill="#FFFFFF"/>
        <circle cx="26.5" cy="35" r="2.2" fill="#FF4500"/>
        <circle cx="37.5" cy="35" r="2.2" fill="#FF4500"/>
        <path d="M27.5 40.5C29.5 42.2 34.5 42.2 36.5 40.5" stroke="#FF4500" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M32 25L35 17L42 18.5" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="43.5" cy="18.8" r="2.4" fill="#FFFFFF"/>
      `;
    }

    return null;
  }
}

window.siteIconAdapter = new SiteIconAdapter();
