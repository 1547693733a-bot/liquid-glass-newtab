/**
 * Liquid Tab - 4K/UHD 多源高清壁纸与艺术摄影引擎 (v2.4)
 * 集成免密钥高画质实测数据源：
 * - 4K 全源精选混播 (Spotlight 4K + Bing UHD + Earth View + Wallhaven 4K)
 * - Windows Spotlight 4K 全球聚焦摄影
 * - Bing 每日 4K UHD (3840×2160)
 * - Google Earth View 卫星航拍精选 (1520 张 gstatic 高速原图)
 * - Wallhaven 4K-8K 榜单 (自然建筑 / 极简光影 / 深空星云 / 二次元数字插画)
 * - 克利夫兰艺术博物馆 CC0 馆藏风景油画
 * - Apple 液态流体精选 & 纯代码实时液态渐变
 */

// 预置高分辨率液态流体与极简摄影兜底库 (3840px 级，离线/超时瞬间兜底，无重复项)
const APPLE_LIQUID_WALLPAPERS = [
  {
    title: "深邃极光液态丝绸",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3840&q=90",
    author: "Apple Aesthetics",
    resolution: "4K"
  },
  {
    title: "极简天青流体折光",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=3840&q=90",
    author: "Minimalist Fluid",
    resolution: "4K"
  },
  {
    title: "暗夜琥珀丝绸波纹",
    url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=3840&q=90",
    author: "Liquid Silk",
    resolution: "4K"
  },
  {
    title: "暮色蓝紫流光曲面",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=3840&q=90",
    author: "Chroma Wave",
    resolution: "4K"
  },
  {
    title: "空间漂浮琉璃光韵",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=3840&q=90",
    author: "Spatial Glass",
    resolution: "4K"
  },
  {
    title: "深海蓝雾柔光曲面",
    url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=3840&q=90",
    author: "Oceanic Refraction",
    resolution: "4K"
  },
  {
    title: "静谧雪峰与群星银河",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=3840&q=90",
    author: "Kalon Wei",
    resolution: "4K"
  },
  {
    title: "冰岛苔原极光夜空",
    url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=3840&q=90",
    author: "Jonatan Pie",
    resolution: "4K"
  },
  {
    title: "极简建筑几何光影",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=3840&q=90",
    author: "Christian Perner",
    resolution: "4K"
  },
  {
    title: "班夫国家公园湖山晨雾",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=3840&q=90",
    author: "Bailey Zindel",
    resolution: "4K"
  }
];

// 纯代码实时液态流体渐变精选预设库
const PURE_CODE_MESH_PRESETS = [
  {
    id: "aurora",
    name: "天青极光 (Aurora)",
    background: "radial-gradient(circle at 20% 25%, #00C6FF 0%, transparent 45%), radial-gradient(circle at 80% 30%, #0072FF 0%, transparent 50%), radial-gradient(circle at 35% 80%, #9D50BB 0%, transparent 50%), radial-gradient(circle at 85% 85%, #0A84FF 0%, transparent 45%), #080c16"
  },
  {
    id: "sunset",
    name: "暮光落霞 (Sunset)",
    background: "radial-gradient(circle at 20% 20%, #FA709A 0%, transparent 45%), radial-gradient(circle at 80% 25%, #FEE140 0%, transparent 45%), radial-gradient(circle at 40% 80%, #FF0844 0%, transparent 50%), radial-gradient(circle at 85% 80%, #7928CA 0%, transparent 50%), #120919"
  },
  {
    id: "midnight",
    name: "暗夜电光 (Midnight)",
    background: "radial-gradient(circle at 25% 25%, #7F00FF 0%, transparent 50%), radial-gradient(circle at 80% 30%, #E100FF 0%, transparent 45%), radial-gradient(circle at 30% 80%, #00F2FE 0%, transparent 45%), radial-gradient(circle at 85% 85%, #4FACFE 0%, transparent 50%), #070913"
  },
  {
    id: "emerald",
    name: "薄荷翠影 (Emerald)",
    background: "radial-gradient(circle at 20% 25%, #43E97B 0%, transparent 45%), radial-gradient(circle at 80% 20%, #38F9D7 0%, transparent 45%), radial-gradient(circle at 30% 80%, #0BA360 0%, transparent 50%), radial-gradient(circle at 85% 85%, #13547A 0%, transparent 50%), #06110f"
  },
  {
    id: "lavender",
    name: "薰衣草雾 (Lavender)",
    background: "radial-gradient(circle at 25% 20%, #A18CD1 0%, transparent 45%), radial-gradient(circle at 80% 30%, #FBC2EB 0%, transparent 45%), radial-gradient(circle at 40% 80%, #8EC5FC 0%, transparent 50%), radial-gradient(circle at 85% 85%, #E0C3FC 0%, transparent 45%), #110d18"
  },
  {
    id: "solar",
    name: "日蚀金辉 (Solar)",
    background: "radial-gradient(circle at 20% 20%, #F5AF19 0%, transparent 45%), radial-gradient(circle at 80% 30%, #E65C00 0%, transparent 45%), radial-gradient(circle at 35% 80%, #FF416C 0%, transparent 50%), radial-gradient(circle at 85% 85%, #870000 0%, transparent 45%), #120807"
  },
  {
    id: "deepspace",
    name: "深空星河 (Cosmos)",
    background: "radial-gradient(circle at 20% 25%, #2E0854 0%, transparent 50%), radial-gradient(circle at 80% 25%, #0052D4 0%, transparent 45%), radial-gradient(circle at 35% 80%, #65C7F7 0%, transparent 45%), radial-gradient(circle at 85% 85%, #9B51E0 0%, transparent 50%), #05060d"
  },
  {
    id: "oceanic",
    name: "深海琉璃 (Oceanic)",
    background: "radial-gradient(circle at 20% 20%, #00B4DB 0%, transparent 45%), radial-gradient(circle at 80% 30%, #0083B0 0%, transparent 45%), radial-gradient(circle at 30% 80%, #1A2980 0%, transparent 50%), radial-gradient(circle at 85% 85%, #26D0CE 0%, transparent 45%), #050d18"
  }
];

const WALLPAPER_POOL_TTL_MS = 6 * 60 * 60 * 1000; // 6 小时刷新一次壁纸池
const EARTHVIEW_TTL_MS = 7 * 24 * 60 * 60 * 1000; // Earth View 1520 张清单缓存 7 天

class WallpaperEngine {
  constructor() {
    this.container = document.getElementById("wallpaperContainer");
    this.layer1 = document.getElementById("wallpaperLayer1");
    this.layer2 = document.getElementById("wallpaperLayer2");
    this.meshBg = document.getElementById("liquidMeshBg");
    this.overlay = document.getElementById("wallpaperOverlay");
    this.infoTag = document.getElementById("wallpaperInfo");
    this.activeLayerIndex = 1;
    this.poolMemory = new Map();
    this.seenUrls = new Set();

    // 默认配置（新用户默认采用 4K 全源精选混播）
    this.config = {
      source: "mixed", // 'mixed' | 'spotlight' | 'bing' | 'earthview' | 'wallhaven_nature' | 'wallhaven_minimal' | 'wallhaven_space' | 'wallhaven_anime' | 'museum' | 'apple' | 'mesh' | 'custom'
      frequency: "every_newtab",
      meshStyle: "auto",
      meshIndex: 0,
      customUrl: "",
      blur: 0,
      maskOpacity: 35,
      lastChangeTime: 0,
      currentWallpaper: null
    };
  }

  async init() {
    await this.loadConfig();
    this.normalizeLegacySource();
    this.bindInfoTagAction();
    this.applyVisualEffects();
    this.evaluateAndApplyWallpaper();
  }

  // 兼容老版本壁纸源键名，自动升级到对应的 4K 实时频道
  normalizeLegacySource() {
    if (this.config.source === "unsplash") {
      this.config.source = "wallhaven_nature";
    } else if (this.config.source === "anime") {
      this.config.source = "wallhaven_anime";
    }
  }

  // 点击左下角壁纸标签可直接在新标签页欣赏/保存 4K 原图
  bindInfoTagAction() {
    if (!this.infoTag) return;
    this.infoTag.style.cursor = "pointer";
    this.infoTag.title = "点击查看当前高清壁纸原图";
    this.infoTag.addEventListener("click", () => {
      const wp = this.config.currentWallpaper;
      if (wp && wp.url && !wp.isMesh) {
        window.open(wp.sourcePage || wp.url, "_blank", "noopener,noreferrer");
      }
    });
  }

  async loadConfig() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get("wallpaperConfig");
        if (data.wallpaperConfig) {
          this.config = { ...this.config, ...data.wallpaperConfig };
        }
      } else {
        const saved = localStorage.getItem("liquid_wallpaperConfig");
        if (saved) {
          this.config = { ...this.config, ...JSON.parse(saved) };
        }
      }
    } catch (e) {
      console.warn("读取壁纸设置失败，使用默认配置:", e);
    }
  }

  async saveConfig() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ wallpaperConfig: this.config });
      } else {
        localStorage.setItem("liquid_wallpaperConfig", JSON.stringify(this.config));
      }
    } catch (e) {
      console.error("保存壁纸设置失败:", e);
    }
  }

  // 读写本地壁纸池缓存（避免每次换壁纸重复请求接口，且支持秒切换）
  getCachedPool(key, ttlMs = WALLPAPER_POOL_TTL_MS) {
    const mem = this.poolMemory.get(key);
    if (mem && Array.isArray(mem.items) && mem.items.length && (Date.now() - mem.ts) < ttlMs) {
      return mem.items;
    }
    try {
      const raw = localStorage.getItem(`liquid_wp_pool_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length && (Date.now() - parsed.ts) < ttlMs) {
          this.poolMemory.set(key, parsed);
          return parsed.items;
        }
      }
    } catch (e) {}
    return null;
  }

  setCachedPool(key, items) {
    if (!Array.isArray(items) || !items.length) return;
    const payload = { ts: Date.now(), items };
    this.poolMemory.set(key, payload);
    try {
      // Earth View 清单较大，只把轻量精简数组落盘
      if (items.length <= 200) {
        localStorage.setItem(`liquid_wp_pool_${key}`, JSON.stringify(payload));
      }
    } catch (e) {}
  }

  // 从池中选取未展示过的高清壁纸，避免连续重复
  pickFreshFromPool(pool) {
    if (!Array.isArray(pool) || !pool.length) return null;
    const currentUrl = this.config.currentWallpaper && this.config.currentWallpaper.url;
    let candidates = pool.filter(it => it && it.url && it.url !== currentUrl && !this.seenUrls.has(it.url));
    if (!candidates.length) {
      this.seenUrls.clear();
      candidates = pool.filter(it => it && it.url && it.url !== currentUrl);
    }
    if (!candidates.length) candidates = pool;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (chosen && chosen.url) this.seenUrls.add(chosen.url);
    return chosen;
  }

  async fetchJsonWithTimeout(url, timeoutMs = 5500) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async evaluateAndApplyWallpaper(forceChange = false) {
    const now = Date.now();
    let needNew = forceChange;

    if (!needNew && !this.config.currentWallpaper) {
      needNew = true;
    } else if (!needNew) {
      switch (this.config.frequency) {
        case "every_newtab":
          needNew = true;
          break;
        case "hourly":
          needNew = (now - (this.config.lastChangeTime || 0)) > 60 * 60 * 1000;
          break;
        case "daily":
          needNew = (now - (this.config.lastChangeTime || 0)) > 24 * 60 * 60 * 1000;
          break;
        case "static":
          needNew = false;
          break;
      }
    }

    if (needNew) {
      await this.fetchAndChangeWallpaper();
    } else if (this.config.currentWallpaper) {
      if (this.config.source === "mesh") {
        this.applyMeshPreset(this.config.meshIndex || 0);
      } else {
        this.renderWallpaper(this.config.currentWallpaper);
      }
    }
  }

  applyMeshPreset(index) {
    const safeIdx = Math.abs(index) % PURE_CODE_MESH_PRESETS.length;
    const preset = PURE_CODE_MESH_PRESETS[safeIdx];
    this.enableMeshMode();
    if (this.meshBg) {
      this.meshBg.style.background = preset.background;
    }
    const wp = {
      title: `动态液态流体 · ${preset.name}`,
      author: "Pure Code Shader",
      isMesh: true,
      meshIndex: safeIdx
    };
    this.config.currentWallpaper = wp;
    this.updateInfoUI(wp);
  }

  async fetchAndChangeWallpaper() {
    let wp = null;
    const src = this.config.source || "mixed";

    if (src === "mesh") {
      let nextIndex = 0;
      if (this.config.meshStyle !== "auto" && !isNaN(parseInt(this.config.meshStyle, 10))) {
        nextIndex = parseInt(this.config.meshStyle, 10);
      } else {
        const currentIdx = typeof this.config.meshIndex === "number" ? this.config.meshIndex : 0;
        nextIndex = (currentIdx + 1) % PURE_CODE_MESH_PRESETS.length;
      }
      this.config.meshIndex = nextIndex;
      this.applyMeshPreset(nextIndex);
      this.config.lastChangeTime = Date.now();
      await this.saveConfig();
      return;
    }

    this.disableMeshMode();

    if (src === "custom" && this.config.customUrl) {
      wp = { title: "自定义高清壁纸", url: this.config.customUrl, author: "Custom" };
    } else if (src === "mixed") {
      wp = await this.fetchMixedPremiumWallpaper();
    } else {
      wp = await this.fetchFromSource(src);
    }

    if (!wp || !wp.url) {
      wp = this.pickFreshFromPool(APPLE_LIQUID_WALLPAPERS);
    }

    this.config.currentWallpaper = wp;
    this.config.lastChangeTime = Date.now();
    await this.saveConfig();
    this.renderWallpaper(wp);
  }

  // 4K 全源精选混播：按权重在 Spotlight 4K、Bing UHD、Earth View 卫星航拍与 Wallhaven 4K 之间轮转
  async fetchMixedPremiumWallpaper() {
    const channels = [
      "spotlight",
      "bing",
      "wallhaven_nature",
      "wallhaven_minimal",
      "earthview"
    ];
    const startIdx = Math.floor(Math.random() * channels.length);
    for (let i = 0; i < channels.length; i++) {
      const ch = channels[(startIdx + i) % channels.length];
      const item = await this.fetchFromSource(ch);
      if (item && item.url) return item;
    }
    return this.pickFreshFromPool(APPLE_LIQUID_WALLPAPERS);
  }

  async fetchFromSource(src) {
    switch (src) {
      case "spotlight":
        return await this.fetchSpotlight4k();
      case "bing":
        return await this.fetchBingUhd();
      case "earthview":
        return await this.fetchEarthView();
      case "wallhaven_nature":
        return await this.fetchWallhavenChannel("nature", "q=landscape+nature&sorting=toplist&topRange=6M&atleast=3840x2160&ratios=16x9,16x10,21x9&purity=100&categories=100", "Wallhaven 4K 自然建筑");
      case "wallhaven_minimal":
        return await this.fetchWallhavenChannel("minimal", "q=minimalism&sorting=toplist&topRange=1y&atleast=3840x2160&ratios=16x9,16x10,21x9&purity=100&categories=100", "Wallhaven 4K 极简美学");
      case "wallhaven_space":
        return await this.fetchWallhavenChannel("space", "q=space&sorting=toplist&topRange=1y&atleast=3840x2160&ratios=16x9,16x10,21x9&purity=100&categories=100", "Wallhaven 4K 深空星云");
      case "wallhaven_anime":
        return await this.fetchWallhavenChannel("anime", "sorting=toplist&topRange=3M&atleast=3840x2160&ratios=16x9,16x10&purity=100&categories=010", "Wallhaven 4K 数字插画");
      case "museum":
        return await this.fetchMuseumPainting();
      case "apple":
        return this.pickFreshFromPool(APPLE_LIQUID_WALLPAPERS);
      default:
        return await this.fetchBingUhd();
    }
  }

  // 1. Windows Spotlight 4K 全球聚焦摄影（微软官方公开 4K 锁屏摄影接口）
  async fetchSpotlight4k() {
    const cached = this.getCachedPool("spotlight", 3 * 60 * 60 * 1000);
    if (cached && cached.length >= 2) {
      const picked = this.pickFreshFromPool(cached);
      if (picked) return picked;
    }

    const endpoints = [
      "https://fd.api.iris.microsoft.com/v4/api/selection?&placement=88000820&bcnt=4&country=CN&locale=zh-CN&fmt=json",
      "https://fd.api.iris.microsoft.com/v4/api/selection?&placement=88000820&bcnt=4&country=US&locale=en-US&fmt=json"
    ];

    const collected = [];
    for (const ep of endpoints) {
      try {
        const data = await this.fetchJsonWithTimeout(ep, 4500);
        const rawItems = data && data.batchrsp && Array.isArray(data.batchrsp.items) ? data.batchrsp.items : [];
        rawItems.forEach(entry => {
          try {
            const parsed = typeof entry.item === "string" ? JSON.parse(entry.item) : entry.item;
            const ad = parsed && parsed.ad;
            const imgUrl = (ad && ad.landscapeImage && ad.landscapeImage.asset)
              || (ad && ad.image_fullscreen_001_landscape && ad.image_fullscreen_001_landscape.u);
            if (imgUrl && /^https?:\/\//i.test(imgUrl)) {
              const title = (ad.title || ad.iconHoverText || "Windows Spotlight 4K").split("\n")[0].trim();
              const sub = ad.copyright || "Windows Spotlight";
              collected.push({
                title: `${title}`,
                url: imgUrl,
                author: sub,
                resolution: "4K Spotlight",
                sourcePage: imgUrl
              });
            }
          } catch (e) {}
        });
        if (collected.length >= 2) break;
      } catch (e) {
        console.warn("[Wallpaper] Spotlight 4K 拉取跳过:", e.message);
      }
    }

    if (collected.length) {
      const merged = cached ? [...collected, ...cached].filter((v, i, a) => a.findIndex(x => x.url === v.url) === i).slice(0, 20) : collected;
      this.setCachedPool("spotlight", merged);
      return this.pickFreshFromPool(merged);
    }
    return null;
  }

  // 2. Bing 每日 4K UHD (3840×2160 原图，升级自旧版 1080p)
  async fetchBingUhd() {
    const cached = this.getCachedPool("bing_uhd", 4 * 60 * 60 * 1000);
    if (cached && cached.length >= 3) {
      const picked = this.pickFreshFromPool(cached);
      if (picked) return picked;
    }

    // 优先请求微软官方 8 日 4K UHD 归档
    try {
      const data = await this.fetchJsonWithTimeout(
        "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN&uhd=1&uhdwidth=3840&uhdheight=2160",
        4500
      );
      if (data && Array.isArray(data.images) && data.images.length) {
        const list = data.images
          .filter(img => img && img.urlbase)
          .map(img => {
            const fullUrl = `https://www.bing.com${img.urlbase}_UHD.jpg`;
            const cleanTitle = (img.title || (img.copyright || "").split("(")[0] || "Bing 4K 每日风光").trim();
            return {
              title: `${cleanTitle} · Bing 4K`,
              url: fullUrl,
              author: img.copyright || "Microsoft Bing UHD",
              resolution: "4K UHD",
              sourcePage: fullUrl
            };
          });
        if (list.length) {
          this.setCachedPool("bing_uhd", list);
          return this.pickFreshFromPool(list);
        }
      }
    } catch (e) {
      console.warn("[Wallpaper] Bing 官方 UHD 归档超时，切备用源:", e.message);
    }

    // 备用：bing.biturl.top UHD (3840x2160)
    try {
      const idx = Math.floor(Math.random() * 8);
      const data = await this.fetchJsonWithTimeout(
        `https://bing.biturl.top/?resolution=UHD&format=json&index=${idx}&mkt=zh-CN`,
        4000
      );
      if (data && data.url) {
        const cleanTitle = (data.copyright || "").split("(")[0].trim() || "Bing 4K 每日风光";
        return {
          title: `${cleanTitle} · Bing 4K`,
          url: data.url,
          author: data.copyright || "Microsoft Bing UHD",
          resolution: "4K UHD",
          sourcePage: data.url
        };
      }
    } catch (e) {
      console.warn("[Wallpaper] Bing biturl UHD 超时:", e.message);
    }

    return null;
  }

  // 3. Google Earth View 卫星航拍精选（1,520 张全球卫星地貌，gstatic 高速原图）
  async fetchEarthView() {
    let pool = this.getCachedPool("earthview_sample", EARTHVIEW_TTL_MS);
    if (!pool) {
      try {
        const rawList = await this.fetchJsonWithTimeout(
          "https://raw.githubusercontent.com/limhenry/earthview/master/earthview.json",
          6000
        );
        if (Array.isArray(rawList) && rawList.length) {
          // 均匀抽样 120 张存入轻量本地池，既覆盖全球地貌又极省本地存储
          const step = Math.max(1, Math.floor(rawList.length / 120));
          const sampled = [];
          for (let i = 0; i < rawList.length && sampled.length < 120; i += step) {
            const it = rawList[i];
            if (it && it.image) {
              const loc = [it.region, it.country].filter(Boolean).join(" · ") || "Earth View";
              sampled.push({
                title: `${loc} · 卫星航拍`,
                url: it.image,
                author: "Google Earth View",
                resolution: "Aerial HD",
                sourcePage: it.map || it.image
              });
            }
          }
          if (sampled.length) {
            this.setCachedPool("earthview_sample", sampled);
            pool = sampled;
          }
        }
      } catch (e) {
        console.warn("[Wallpaper] Earth View 拉取失败:", e.message);
      }
    }
    return pool ? this.pickFreshFromPool(pool) : null;
  }

  // 4. Wallhaven 4K-8K 榜单（免 API Key，严格过滤横屏 3840x2160+ & SFW）
  async fetchWallhavenChannel(channelKey, queryString, label) {
    const cacheKey = `wh_${channelKey}`;
    const cached = this.getCachedPool(cacheKey, WALLPAPER_POOL_TTL_MS);
    if (cached && cached.length >= 4) {
      const picked = this.pickFreshFromPool(cached);
      if (picked) return picked;
    }

    try {
      const firstPage = Math.random() < 0.7 ? 1 : 2;
      let data = await this.fetchJsonWithTimeout(
        `https://wallhaven.cc/api/v1/search?${queryString}&page=${firstPage}`,
        6000
      );
      if ((!data || !Array.isArray(data.data) || !data.data.length) && firstPage !== 1) {
        data = await this.fetchJsonWithTimeout(
          `https://wallhaven.cc/api/v1/search?${queryString}&page=1`,
          6000
        );
      }
      if (data && Array.isArray(data.data) && data.data.length) {
        const list = data.data
          .filter(it => it && it.path && Number(it.dimension_x) >= 2560 && Number(it.dimension_x) > Number(it.dimension_y))
          .map(it => ({
            title: `${label} · ${it.resolution || "4K"}`,
            url: it.path,
            author: "Wallhaven TopList",
            resolution: it.resolution || "4K",
            sourcePage: it.url || it.path
          }));
        if (list.length) {
          this.setCachedPool(cacheKey, list);
          return this.pickFreshFromPool(list);
        }
      }
    } catch (e) {
      console.warn(`[Wallpaper] Wallhaven (${channelKey}) 拉取失败:`, e.message);
    }
    return null;
  }

  // 5. 克利夫兰艺术博物馆 CC0 馆藏油画（严格筛选横幅风景油画高分辨率扫描原图）
  async fetchMuseumPainting() {
    const cached = this.getCachedPool("museum_cc0", 24 * 60 * 60 * 1000);
    if (cached && cached.length >= 4) {
      const picked = this.pickFreshFromPool(cached);
      if (picked) return picked;
    }

    try {
      const data = await this.fetchJsonWithTimeout(
        "https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&cc0=1&q=landscape&type=Painting&limit=40",
        7000
      );
      if (data && Array.isArray(data.data)) {
        const list = data.data
          .filter(art => {
            const web = art && art.images && art.images.web;
            if (!web || !web.url) return false;
            const w = Number(web.width) || 0;
            const h = Number(web.height) || 0;
            return w > h * 1.15 && w >= 850;
          })
          .map(art => {
            const printImg = art.images && art.images.print && art.images.print.url;
            const webImg = art.images && art.images.web && art.images.web.url;
            const creator = (Array.isArray(art.creators) && art.creators[0] && art.creators[0].description)
              ? art.creators[0].description.split("(")[0].trim()
              : "Cleveland Museum of Art";
            const cleanArtTitle = String(art.title || "馆藏风景名画").replace(/\s+/g, " ").trim();
            return {
              title: `${cleanArtTitle} — ${creator}`,
              url: printImg || webImg,
              author: creator,
              resolution: "Museum CC0",
              sourcePage: art.url || printImg || webImg
            };
          });
        if (list.length) {
          this.setCachedPool("museum_cc0", list);
          return this.pickFreshFromPool(list);
        }
      }
    } catch (e) {
      console.warn("[Wallpaper] 博物馆名画拉取失败:", e.message);
    }
    return null;
  }

  getRandomItem(list) {
    if (!list || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  // 双缓冲平滑淡入切换渲染
  renderWallpaper(wp) {
    if (!wp || !wp.url) return;

    const nextLayer = this.activeLayerIndex === 1 ? this.layer2 : this.layer1;
    const currentLayer = this.activeLayerIndex === 1 ? this.layer1 : this.layer2;

    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src = wp.url;
    img.onload = () => {
      nextLayer.style.backgroundImage = `url("${wp.url}")`;
      nextLayer.classList.add("active");
      currentLayer.classList.remove("active");
      this.activeLayerIndex = this.activeLayerIndex === 1 ? 2 : 1;
      this.updateInfoUI(wp);
    };
    img.onerror = () => {
      const fallback = this.pickFreshFromPool(APPLE_LIQUID_WALLPAPERS) || APPLE_LIQUID_WALLPAPERS[0];
      nextLayer.style.backgroundImage = `url("${fallback.url}")`;
      nextLayer.classList.add("active");
      currentLayer.classList.remove("active");
      this.activeLayerIndex = this.activeLayerIndex === 1 ? 2 : 1;
      this.updateInfoUI(fallback);
    };
  }

  enableMeshMode() {
    this.container.classList.add("mesh-mode");
    this.layer1.classList.remove("active");
    this.layer2.classList.remove("active");
  }

  disableMeshMode() {
    this.container.classList.remove("mesh-mode");
  }

  // 更新左下角壁纸元信息标签（点击可查看原图）
  updateInfoUI(wp) {
    if (!this.infoTag || !wp) return;
    const title = wp.title || "4K 精选壁纸";
    this.infoTag.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <span>${title}</span>
    `;
  }

  applyVisualEffects() {
    if (!this.overlay) return;
    const opacity = (this.config.maskOpacity || 35) / 100;
    const blur = this.config.blur || 0;

    this.overlay.style.background = `radial-gradient(circle at center, rgba(0, 0, 0, ${opacity * 0.55}) 0%, rgba(0, 0, 0, ${opacity}) 100%)`;
    this.overlay.style.backdropFilter = blur > 0 ? `blur(${blur}px)` : "none";
    this.overlay.style.webkitBackdropFilter = blur > 0 ? `blur(${blur}px)` : "none";
  }

  async updateConfig(newValues) {
    this.config = { ...this.config, ...newValues };
    this.applyVisualEffects();
    await this.saveConfig();
    await this.evaluateAndApplyWallpaper(true);
  }

  async manualNext() {
    await this.fetchAndChangeWallpaper();
  }
}

window.wallpaperEngine = new WallpaperEngine();
