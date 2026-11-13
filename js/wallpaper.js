/**
 * Liquid Tab - 高清壁纸与自动化引擎
 * 支持 Bing 每日壁纸、Apple 原厂液态流体壁纸、Unsplash 风光、二次元插画及多样式纯代码液态渐变
 */

// 预置 Apple 原厂与液态极光壁纸精选库
const APPLE_LIQUID_WALLPAPERS = [
  {
    title: "Liquid Flow - 深邃极光流体",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85",
    author: "Apple Aesthetics"
  },
  {
    title: "macOS Sonoma - 极简天青流光",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2560&q=85",
    author: "Minimalist Horizon"
  },
  {
    title: "visionOS - 空间漂浮光球",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=2560&q=85",
    author: "Spatial Atmosphere"
  },
  {
    title: "Liquid Gradient - 暮色霓虹流体",
    url: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=2560&q=85",
    author: "Fluid Art"
  },
  {
    title: "Apple Glow - 暗夜丝绸液态折射",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85",
    author: "Silk Liquid"
  },
  {
    title: "iOS 18 Glass - 玻璃折射光芒",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85",
    author: "Azure Radiance"
  }
];

// Unsplash 精选大自然与建筑摄影库
const UNSPLASH_WALLPAPERS = [
  {
    title: "班夫国家公园 - 梦幻湖泊雪山",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85",
    author: "Bailey Zindel"
  },
  {
    title: "冰岛苔原与极光夜空",
    url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=2560&q=85",
    author: "Jonatan Pie"
  },
  {
    title: "寂静雪峰与群星银河",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85",
    author: "Kalon Wei"
  },
  {
    title: "极简日落海平线与柔波",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85",
    author: "Sean Oulashin"
  },
  {
    title: "现代建筑光影空间",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=85",
    author: "Christian Perner"
  }
];

// 二次元与插画壁纸精选
const ANIME_WALLPAPERS = [
  {
    title: "治愈天空与云端列车",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2560&q=85",
    author: "Aesthetic Fantasy"
  },
  {
    title: "黄昏电线杆与紫霞天空",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=85",
    author: "Twilight Anime Sky"
  },
  {
    title: "微风夏日向日葵花田",
    url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=2560&q=85",
    author: "Summer Dream"
  }
];

// 纯代码实时液态流体渐变精选预设库 (丰富多样、色调高级、极速离线)
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
    name: "暗夜电光 (Midnight Neon)",
    background: "radial-gradient(circle at 25% 25%, #7F00FF 0%, transparent 50%), radial-gradient(circle at 80% 30%, #E100FF 0%, transparent 45%), radial-gradient(circle at 30% 80%, #00F2FE 0%, transparent 45%), radial-gradient(circle at 85% 85%, #4FACFE 0%, transparent 50%), #070913"
  },
  {
    id: "emerald",
    name: "薄荷翠影 (Emerald Oasis)",
    background: "radial-gradient(circle at 20% 25%, #43E97B 0%, transparent 45%), radial-gradient(circle at 80% 20%, #38F9D7 0%, transparent 45%), radial-gradient(circle at 30% 80%, #0BA360 0%, transparent 50%), radial-gradient(circle at 85% 85%, #13547A 0%, transparent 50%), #06110f"
  },
  {
    id: "lavender",
    name: "梦幻薰衣草 (Dreamy Lavender)",
    background: "radial-gradient(circle at 25% 20%, #A18CD1 0%, transparent 45%), radial-gradient(circle at 80% 30%, #FBC2EB 0%, transparent 45%), radial-gradient(circle at 40% 80%, #8EC5FC 0%, transparent 50%), radial-gradient(circle at 85% 85%, #E0C3FC 0%, transparent 45%), #110d18"
  },
  {
    id: "solar",
    name: "日蚀金辉 (Solar Flare)",
    background: "radial-gradient(circle at 20% 20%, #F5AF19 0%, transparent 45%), radial-gradient(circle at 80% 30%, #E65C00 0%, transparent 45%), radial-gradient(circle at 35% 80%, #FF416C 0%, transparent 50%), radial-gradient(circle at 85% 85%, #870000 0%, transparent 45%), #120807"
  },
  {
    id: "deepspace",
    name: "星河深空 (Deep Cosmos)",
    background: "radial-gradient(circle at 20% 25%, #2E0854 0%, transparent 50%), radial-gradient(circle at 80% 25%, #0052D4 0%, transparent 45%), radial-gradient(circle at 35% 80%, #65C7F7 0%, transparent 45%), radial-gradient(circle at 85% 85%, #9B51E0 0%, transparent 50%), #05060d"
  },
  {
    id: "oceanic",
    name: "深海琉璃 (Oceanic Abyss)",
    background: "radial-gradient(circle at 20% 20%, #00B4DB 0%, transparent 45%), radial-gradient(circle at 80% 30%, #0083B0 0%, transparent 45%), radial-gradient(circle at 30% 80%, #1A2980 0%, transparent 50%), radial-gradient(circle at 85% 85%, #26D0CE 0%, transparent 45%), #050d18"
  }
];

class WallpaperEngine {
  constructor() {
    this.container = document.getElementById("wallpaperContainer");
    this.layer1 = document.getElementById("wallpaperLayer1");
    this.layer2 = document.getElementById("wallpaperLayer2");
    this.meshBg = document.getElementById("liquidMeshBg");
    this.overlay = document.getElementById("wallpaperOverlay");
    this.infoTag = document.getElementById("wallpaperInfo");
    this.activeLayerIndex = 1;
    
    // 默认配置
    this.config = {
      source: "bing", // 'bing' | 'apple' | 'unsplash' | 'anime' | 'mesh' | 'custom'
      frequency: "every_newtab", // 'every_newtab' | 'hourly' | 'daily' | 'static'
      meshStyle: "auto", // 'auto' | 0, 1, 2, 3...
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
    this.applyVisualEffects();
    this.evaluateAndApplyWallpaper();
  }

  // 加载存储中的配置
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

  // 持久化保存配置
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

  // 评估是否需要更换壁纸
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

  // 应用指定的纯代码液态流体样式
  applyMeshPreset(index) {
    const safeIdx = Math.abs(index) % PURE_CODE_MESH_PRESETS.length;
    const preset = PURE_CODE_MESH_PRESETS[safeIdx];
    this.enableMeshMode();
    if (this.meshBg) {
      this.meshBg.style.background = preset.background;
    }
    const wp = {
      title: `动态液态流体: ${preset.name}`,
      author: "Pure Code Shader",
      isMesh: true,
      meshIndex: safeIdx
    };
    this.config.currentWallpaper = wp;
    this.updateInfoUI(wp);
  }

  // 获取下一个壁纸对象
  async fetchAndChangeWallpaper() {
    let wp = null;

    if (this.config.source === "mesh") {
      // 纯代码模式下多样化切换
      let nextIndex = 0;
      if (this.config.meshStyle !== "auto" && !isNaN(parseInt(this.config.meshStyle, 10))) {
        nextIndex = parseInt(this.config.meshStyle, 10);
      } else {
        // 自动轮换或随机到下一款
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

    if (this.config.source === "custom" && this.config.customUrl) {
      wp = {
        title: "自定义壁纸",
        url: this.config.customUrl,
        author: "Custom"
      };
    } else if (this.config.source === "bing") {
      wp = await this.fetchBingWallpaper();
    } else if (this.config.source === "apple") {
      wp = this.getRandomItem(APPLE_LIQUID_WALLPAPERS);
    } else if (this.config.source === "unsplash") {
      wp = this.getRandomItem(UNSPLASH_WALLPAPERS);
    } else if (this.config.source === "anime") {
      wp = this.getRandomItem(ANIME_WALLPAPERS);
    }

    if (!wp || !wp.url) {
      wp = this.getRandomItem(APPLE_LIQUID_WALLPAPERS);
    }

    this.config.currentWallpaper = wp;
    this.config.lastChangeTime = Date.now();
    await this.saveConfig();

    this.renderWallpaper(wp);
  }

  // 获取 Bing 每日壁纸
  async fetchBingWallpaper() {
    const bingApis = [
      "https://bing.biturl.top/?resolution=1920&format=json&index=random&mkt=zh-CN",
      "https://raw.onmicrosoft.cn/bing/api"
    ];

    for (const api of bingApis) {
      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(api, { signal: ctrl.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const imgUrl = data.url_1920 || data.url || data.img_url;
          if (imgUrl) {
            return {
              title: data.copyright || data.title || "Bing 每日高清风光",
              url: imgUrl.startsWith("http") ? imgUrl : `https://cn.bing.com${imgUrl}`,
              author: "Microsoft Bing"
            };
          }
        }
      } catch (err) {
        console.warn("Bing API 超时，切换备用源:", err);
      }
    }

    return {
      title: "Bing 每日精选风光",
      url: `https://bing.img.run/rand.php?t=${Date.now()}`,
      author: "Microsoft Bing"
    };
  }

  getRandomItem(list) {
    if (!list || list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  // 双缓冲平滑淡入切换渲染
  renderWallpaper(wp) {
    if (!wp || !wp.url) return;

    const nextLayer = this.activeLayerIndex === 1 ? this.layer2 : this.layer1;
    const currentLayer = this.activeLayerIndex === 1 ? this.layer1 : this.layer2;

    const img = new Image();
    img.src = wp.url;
    img.onload = () => {
      nextLayer.style.backgroundImage = `url("${wp.url}")`;
      nextLayer.classList.add("active");
      currentLayer.classList.remove("active");
      this.activeLayerIndex = this.activeLayerIndex === 1 ? 2 : 1;
      this.updateInfoUI(wp);
    };
    img.onerror = () => {
      const fallback = APPLE_LIQUID_WALLPAPERS[0];
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

  // 更新左下角壁纸元信息标签
  updateInfoUI(wp) {
    if (!this.infoTag || !wp) return;
    const title = wp.title || "精选艺术壁纸";
    this.infoTag.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <span>${title}</span>
    `;
  }

  // 应用遮罩暗度与高斯模糊度
  applyVisualEffects() {
    if (!this.overlay) return;
    const opacity = (this.config.maskOpacity || 35) / 100;
    const blur = this.config.blur || 0;

    this.overlay.style.background = `radial-gradient(circle at center, rgba(0, 0, 0, ${opacity * 0.55}) 0%, rgba(0, 0, 0, ${opacity}) 100%)`;
    this.overlay.style.backdropFilter = blur > 0 ? `blur(${blur}px)` : "none";
    this.overlay.style.webkitBackdropFilter = blur > 0 ? `blur(${blur}px)` : "none";
  }

  // 更新配置项并生效
  async updateConfig(newValues) {
    this.config = { ...this.config, ...newValues };
    this.applyVisualEffects();
    await this.saveConfig();
    await this.evaluateAndApplyWallpaper(true);
  }

  // 手动点击换壁纸
  async manualNext() {
    await this.fetchAndChangeWallpaper();
  }
}

// 导出全局单例
window.wallpaperEngine = new WallpaperEngine();
