/**
 * Liquid Tab - 全网多源聚合与智能中文深度提炼引擎
 * 打破信息茧房：聚合 Solidot 奇客、少数派 sspai、阮一峰科技爱好者周刊、极客公园、Hacker News、AIHot 前沿资讯
 * 聚合 Product Hunt 新品榜、GitHub 热榜极客工具、Show HN 全球独立创新、V2EX 创想工坊
 * 支持用户自定义 RSS/Atom 订阅源，奇趣探索低频更新源 (3天更新周期) 与自动历史时间线归档
 */

// 内置 12 大跨界破茧资讯源配置清单 (人文思辨 / 全球视野 / 宏观财经 / 自然科学 / 艺术美学 / 前沿科技)
const BUILTIN_NEWS_SOURCES = [
  {
    id: "zhihudaily",
    name: "知乎日报精选",
    shortName: "知乎日报",
    sourceType: "知乎日报",
    badge: "生活百科",
    domainStyle: "humanities",
    icon: "知",
    desc: "历史掌故、社会心理、博物科普与日常奇思妙问，拓展常识与生活维度",
    enabled: true
  },
  {
    id: "aeon",
    name: "Aeon 人文思想",
    shortName: "Aeon 人文",
    sourceType: "Aeon 人文",
    badge: "人文哲学",
    domainStyle: "humanities",
    icon: "Æ",
    desc: "全球顶尖人文长篇：哲学思辨、历史文化、社会人类学与当代思想深度碰撞",
    enabled: true
  },
  {
    id: "bbc_zh",
    name: "BBC 中文全球视野",
    shortName: "BBC 中文",
    sourceType: "BBC 中文",
    badge: "全球视野",
    domainStyle: "world",
    icon: "🌍",
    desc: "世界地缘政治、国际社会观察、跨文化深度特写与全球热点新闻",
    enabled: true
  },
  {
    id: "ft_zh",
    name: "FT中文网财经商业",
    shortName: "FT中文网",
    sourceType: "FT中文网",
    badge: "宏观财经",
    domainStyle: "finance",
    icon: "📈",
    desc: "全球宏观经济脉动、金融市场趋势、企业管理策略与商业深度评论",
    enabled: true
  },
  {
    id: "sciencedaily",
    name: "ScienceDaily 自然生命",
    shortName: "自然科学",
    sourceType: "自然科学",
    badge: "生命宇宙",
    domainStyle: "science",
    icon: "🧬",
    desc: "前沿自然科学发现：天文学、生命医学、气候生态、脑科学与地球探索",
    enabled: true
  },
  {
    id: "colossal",
    name: "Colossal 艺术美学",
    shortName: "艺术美学",
    sourceType: "艺术美学",
    badge: "艺术设计",
    domainStyle: "art",
    icon: "🎨",
    desc: "当代视觉艺术、建筑空间、人文摄影、插画与手作创意设计灵感",
    enabled: true
  },
  {
    id: "solidot",
    name: "Solidot 奇客",
    shortName: "Solidot 奇客",
    sourceType: "Solidot",
    badge: "开源科学",
    domainStyle: "tech",
    icon: "🔬",
    desc: "开源软件、网络安全、前沿科学、天文宇宙与数字自由观察",
    enabled: true
  },
  {
    id: "ruanyifeng",
    name: "阮一峰科技爱好者周刊",
    shortName: "阮一峰周刊",
    sourceType: "阮一峰周刊",
    badge: "科技周刊",
    domainStyle: "tech",
    icon: "📖",
    desc: "每周精选科技视野、开发者思想随笔、未来技术与奇趣站点",
    enabled: true
  },
  {
    id: "sspai",
    name: "少数派 sspai",
    shortName: "少数派",
    sourceType: "少数派",
    badge: "数字生活",
    domainStyle: "tech",
    icon: "π",
    desc: "高效工作流、数字生活、软硬件深度体验与品质指南",
    enabled: true
  },
  {
    id: "geekpark",
    name: "极客公园 GeekPark",
    shortName: "极客公园",
    sourceType: "极客公园",
    badge: "极客创新",
    domainStyle: "tech",
    icon: "🚀",
    desc: "前沿产业科技、硬核硬件突破与改变未来的新物种报道",
    enabled: true
  },
  {
    id: "hackernews",
    name: "Hacker News 精选",
    shortName: "Hacker News",
    sourceType: "Hacker News",
    badge: "全球极客",
    domainStyle: "tech",
    icon: "Y",
    desc: "硅谷极客工程文化、全球工程师技术探讨与独立创造作品",
    enabled: true
  },
  {
    id: "aihot",
    name: "AIHot 前沿资讯",
    shortName: "AI 前沿",
    sourceType: "AIHot",
    badge: "AI新品资讯",
    domainStyle: "tech",
    icon: "🤖",
    desc: "AI 大模型产业、前沿动态与新品资讯",
    enabled: true
  }
];

class DailyToolsSyncEngine {
  constructor() {
    this.storageKey = "liquid_daily_tools_cache_v10"; // 升级至 v10：跨界人文/财经/全球/自然/艺术+科技真破茧多源聚合
    this.funStorageKey = "liquid_fun_explore_cache_v1"; // 奇趣探索独立低频更新源
    this.newsConfigKey = "liquid_news_config_v1"; // 破茧资讯源与用户自定义 RSS 订阅配置
    this.dailyTools = [];
    this.funExploreTools = [];
    this.newsConfig = null;
    this.lastSyncTime = 0;
    this.funLastSync = 0;
    this.isSyncing = false;
    this.isFunSyncing = false;
  }

  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // 清除旧版本残留缓存
  async cleanOldCaches() {
    const oldKeys = [
      "liquid_daily_tools_cache",
      "liquid_daily_tools_cache_v2",
      "liquid_daily_tools_cache_v3",
      "liquid_daily_tools_cache_v4",
      "liquid_daily_tools_cache_v5",
      "liquid_daily_tools_cache_v6",
      "liquid_daily_tools_cache_v7",
      "liquid_daily_tools_cache_v8",
      "liquid_daily_tools_cache_v9"
    ];
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove(oldKeys);
      }
      oldKeys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn("清理旧缓存提示:", e);
    }
  }

  // 加载破茧资讯订阅源与自定义 RSS 配置
  async loadNewsConfig() {
    const defaultCfg = {
      enabledSources: {
        zhihudaily: true,
        aeon: true,
        bbc_zh: true,
        ft_zh: true,
        sciencedaily: true,
        colossal: true,
        solidot: true,
        ruanyifeng: true,
        sspai: true,
        geekpark: true,
        hackernews: true,
        aihot: true
      },
      customFeeds: []
    };

    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(this.newsConfigKey);
        if (data && data[this.newsConfigKey]) {
          const saved = data[this.newsConfigKey];
          this.newsConfig = {
            enabledSources: Object.assign({}, defaultCfg.enabledSources, saved.enabledSources || {}),
            customFeeds: Array.isArray(saved.customFeeds) ? saved.customFeeds : []
          };
          return this.newsConfig;
        }
      } else {
        const savedStr = localStorage.getItem(this.newsConfigKey);
        if (savedStr) {
          const saved = JSON.parse(savedStr);
          this.newsConfig = {
            enabledSources: Object.assign({}, defaultCfg.enabledSources, saved.enabledSources || {}),
            customFeeds: Array.isArray(saved.customFeeds) ? saved.customFeeds : []
          };
          return this.newsConfig;
        }
      }
    } catch (e) {
      console.warn("读取破茧资讯配置异常:", e);
    }

    this.newsConfig = defaultCfg;
    return this.newsConfig;
  }

  // 保存破茧资讯订阅源与自定义 RSS 配置
  async saveNewsConfig(cfg) {
    if (cfg) this.newsConfig = cfg;
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.newsConfigKey]: this.newsConfig });
      } else {
        localStorage.setItem(this.newsConfigKey, JSON.stringify(this.newsConfig));
      }
    } catch (e) {
      console.error("保存破茧资讯配置失败:", e);
    }
  }

  // 添加自定义 RSS 订阅源
  async addCustomFeed(name, url) {
    if (!name || !url) return null;
    if (!this.newsConfig) await this.loadNewsConfig();
    const feed = {
      id: "custom-" + Date.now(),
      name: name.trim(),
      url: url.trim(),
      enabled: true
    };
    this.newsConfig.customFeeds.push(feed);
    await this.saveNewsConfig();
    return feed;
  }

  // 移除自定义 RSS 订阅源
  async removeCustomFeed(id) {
    if (!this.newsConfig) await this.loadNewsConfig();
    this.newsConfig.customFeeds = this.newsConfig.customFeeds.filter(f => f.id !== id);
    await this.saveNewsConfig();
  }

  // 开启/关闭指定资讯源
  async toggleSource(sourceId, enabled) {
    if (!this.newsConfig) await this.loadNewsConfig();
    if (this.newsConfig.enabledSources && this.newsConfig.enabledSources.hasOwnProperty(sourceId)) {
      this.newsConfig.enabledSources[sourceId] = enabled;
    } else {
      const feed = this.newsConfig.customFeeds.find(f => f.id === sourceId);
      if (feed) feed.enabled = enabled;
    }
    await this.saveNewsConfig();
  }

  // 格式化资讯发布时间友好文案
  formatNewsDate(dateStr) {
    if (!dateStr) return "今日快讯";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const now = Date.now();
        const diffMs = now - d.getTime();
        const diffHours = Math.floor(diffMs / (3600 * 1000));
        if (diffHours < 1) return "刚刚更新";
        if (diffHours < 24) return `${diffHours} 小时前`;
        if (diffHours < 48) return "昨天";
        return `${d.getMonth() + 1}月${d.getDate()}日`;
      }
    } catch (e) {}
    return "今日发布";
  }

  async init() {
    await this.cleanOldCaches();
    await this.loadNewsConfig();
    await this.loadFromCache();
    await this.loadFunCache();

    const today = this.getTodayDateString();

    // 检查缓存中是否有未完成中文翻译的残留条目
    const hasUntranslated = this.dailyTools.some(t => {
      const text = t.descZh || t.desc || "";
      return !/[\u4e00-\u9fa5]{3,}/.test(text);
    });

    const needSync = !this.dailyTools.length || (this.cachedDate !== today) || hasUntranslated;

    if (needSync) {
      // 启动后台静默更新，完成后自动派发事件重绘界面
      this.syncDailyTools(false).then(() => {
        window.dispatchEvent(new CustomEvent("dailyToolsUpdated"));
      });
    } else {
      this.ensureAllItemsTranslated().then(() => {
        window.dispatchEvent(new CustomEvent("dailyToolsUpdated"));
      });
    }

    // 检查奇趣探索是否到期需静默低频刷新 (3 天周期)
    const threeDaysMs = 3 * 24 * 3600 * 1000;
    if (Date.now() - this.funLastSync > threeDaysMs) {
      this.syncFunExploreTools(false).then(() => {
        window.dispatchEvent(new CustomEvent("funToolsUpdated"));
      });
    }

    return this.dailyTools;
  }

  // 异步检查并确保全部条目均完成中文转译与 AI 深度扫描
  async ensureAllItemsTranslated() {
    let hasUpdate = false;
    for (const item of this.dailyTools) {
      const currentDesc = item.descZh || item.desc || "";
      if (!/[\u4e00-\u9fa5]{3,}/.test(currentDesc)) {
        const trans = await this.translateToChinese(item.rawDesc || currentDesc || item.name);
        if (trans && /[\u4e00-\u9fa5]/.test(trans)) {
          item.descZh = trans;
          item.desc = trans;
          hasUpdate = true;
        }
      }
      if (!item.titleZh) {
        item.titleZh = this.extractChineseTitle(item.name, item.descZh || item.desc);
      }
    }

    // 若开启了 AI，在后台对尚未生成 AI 概要的条目执行深度提炼
    if (window.aiService && window.aiService.isEnabled()) {
      const unscanned = this.dailyTools.filter(t => !t.aiGenerated);
      if (unscanned.length > 0) {
        try {
          await window.aiService.batchScanDailyTools(unscanned);
          hasUpdate = true;
        } catch (e) {
          console.warn("后台 AI 增量扫描提炼跳过:", e);
        }
      }
    }

    if (hasUpdate) {
      await this.saveToCache();
    }
  }

  async loadFromCache() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(this.storageKey);
        if (data && data[this.storageKey]) {
          const cache = data[this.storageKey];
          this.dailyTools = cache.items || [];
          this.lastSyncTime = cache.lastSync || 0;
          this.cachedDate = cache.date || "";
        }
      } else {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const cache = JSON.parse(saved);
          this.dailyTools = cache.items || [];
          this.lastSyncTime = cache.lastSync || 0;
          this.cachedDate = cache.date || "";
        }
      }
    } catch (e) {
      console.warn("读取每日工具缓存异常:", e);
    }

    if (!this.dailyTools.length) {
      this.dailyTools = this.getFallbackDailyTools();
    }

    // 自动沉淀至历史记录归档
    if (window.archiveManager && window.archiveManager.recordHistory) {
      window.archiveManager.recordHistory(this.dailyTools);
    }
  }

  async saveToCache() {
    const cache = {
      date: this.getTodayDateString(),
      lastSync: Date.now(),
      items: this.dailyTools
    };
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.storageKey]: cache });
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(cache));
      }
    } catch (e) {
      console.error("保存每日工具缓存失败:", e);
    }

    // 同步沉淀进历史足迹
    if (window.archiveManager && window.archiveManager.recordHistory) {
      window.archiveManager.recordHistory(this.dailyTools);
    }
  }

  // 读取奇趣探索缓存
  async loadFunCache() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(this.funStorageKey);
        if (data && data[this.funStorageKey]) {
          const cache = data[this.funStorageKey];
          this.funExploreTools = cache.items || [];
          this.funLastSync = cache.lastSync || 0;
        }
      } else {
        const saved = localStorage.getItem(this.funStorageKey);
        if (saved) {
          const cache = JSON.parse(saved);
          this.funExploreTools = cache.items || [];
          this.funLastSync = cache.lastSync || 0;
        }
      }
    } catch (e) {
      console.warn("读取奇趣探索缓存异常:", e);
    }

    if (!this.funExploreTools.length) {
      this.funExploreTools = this.getFallbackFunTools();
    }

    if (window.archiveManager && window.archiveManager.recordHistory) {
      window.archiveManager.recordHistory(this.funExploreTools);
    }
  }

  // 保存奇趣探索缓存
  async saveFunCache() {
    const cache = {
      lastSync: this.funLastSync || Date.now(),
      items: this.funExploreTools
    };
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.funStorageKey]: cache });
      } else {
        localStorage.setItem(this.funStorageKey, JSON.stringify(cache));
      }
    } catch (e) {
      console.error("保存奇趣探索缓存失败:", e);
    }

    if (window.archiveManager && window.archiveManager.recordHistory) {
      window.archiveManager.recordHistory(this.funExploreTools);
    }
  }

  // 深度清洗 RSS 中的 HTML 垃圾与 Discussion/Link 标签
  cleanRssHtml(html) {
    if (!html) return "";
    return html
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<a[^>]*>(?:Discussion|Comments|Link)<\/a>/gi, "")
      .replace(/<[^>]*>?/gm, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\b(?:Discussion|Comments|Link)\b[\s\S]*$/gi, "")
      .replace(/[\s|]+/g, " ")
      .trim();
  }

  // 正则解析 RSS / Atom XML (高可用跨环境容错兜底)
  parseXmlWithRegex(xmlText, isAtom = false, maxItems = 8) {
    const items = [];
    const itemTag = isAtom ? "entry" : "item";
    const regex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, "gi");
    let match;
    while ((match = regex.exec(xmlText)) !== null && items.length < maxItems) {
      const block = match[1];
      const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const title = this.cleanRssHtml(titleMatch ? titleMatch[1] : "");

      let link = "";
      if (isAtom) {
        const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["']/i) || block.match(/<link[^>]*>([^<]+)<\/link>/i);
        link = linkMatch ? linkMatch[1].trim() : "";
      } else {
        const linkMatch = block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
        link = this.cleanRssHtml(linkMatch ? linkMatch[1] : "");
      }

      const descMatch = block.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/i);
      const desc = this.cleanRssHtml(descMatch ? descMatch[1] : "");

      const dateMatch = block.match(/<(?:pubDate|published|updated)[^>]*>([^<]+)<\/(?:pubDate|published|updated)>/i);
      const date = dateMatch ? dateMatch[1].trim() : "";

      if (title && link) {
        items.push({ title, link, desc: desc.slice(0, 180), date });
      }
    }
    return items;
  }

  // 高性能全平台 XML 解析引擎 (优先浏览器原生 DOMParser，正则无缝兜底)
  parseXmlFeed(xmlText, isAtom = false, maxItems = 8) {
    if (!xmlText) return [];
    try {
      if (typeof DOMParser !== "undefined") {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, "text/xml");
        const isAtomDoc = isAtom || !!doc.querySelector("feed");
        const entries = isAtomDoc ? Array.from(doc.querySelectorAll("entry")) : Array.from(doc.querySelectorAll("item"));
        if (entries && entries.length > 0) {
          return entries.slice(0, maxItems).map(el => {
            const title = (el.querySelector("title")?.textContent || "").trim();
            let link = "";
            if (isAtomDoc) {
              const linkEl = el.querySelector("link[href]") || el.querySelector("link");
              link = linkEl?.getAttribute("href") || linkEl?.textContent || "";
            } else {
              link = (el.querySelector("link")?.textContent || "").trim();
            }
            const descEl = el.querySelector("description") || el.querySelector("summary") || el.querySelector("content");
            const descRaw = descEl?.textContent || "";
            const desc = this.cleanRssHtml(descRaw);
            const dateEl = el.querySelector("pubDate") || el.querySelector("published") || el.querySelector("updated");
            const date = dateEl?.textContent?.trim() || "";
            return { title, link, desc: desc.slice(0, 180), date };
          }).filter(it => it.title && it.link);
        }
      }
    } catch (e) {
      console.warn("DOMParser 解析失败，采用正则回退解析:", e);
    }
    return this.parseXmlWithRegex(xmlText, isAtom, maxItems);
  }

  // 多通道超高可用智能中文翻译引擎
  async translateToChinese(text) {
    if (!text || !text.trim()) return "";
    let trimmed = this.cleanRssHtml(text);
    if (!trimmed) return "";

    // 如果本身已经是地道中文（含 3 个以上汉字），直接返回
    if (/[\u4e00-\u9fa5]{3,}/.test(trimmed)) {
      return trimmed;
    }

    // 通道 1: 网易有道开放通道（国内直连无 GFW 限制）
    try {
      const res = await fetch("https://aidemo.youdao.com/trans", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "q=" + encodeURIComponent(trimmed) + "&from=en&to=zh-CHS",
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.translation) && json.translation[0]) {
          const trans = json.translation[0].trim();
          if (/[\u4e00-\u9fa5]/.test(trans)) {
            return trans;
          }
        }
      }
    } catch (e) {}

    // 通道 2: Google Translate GTX 接口
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json[0])) {
          const trans = json[0].map(s => s[0]).join("").trim();
          if (/[\u4e00-\u9fa5]/.test(trans)) {
            return trans;
          }
        }
      }
    } catch (e) {}

    // 通道 3: MyMemory 备用
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|zh-CN`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        const trans = json?.responseData?.translatedText;
        if (trans && /[\u4e00-\u9fa5]/.test(trans) && !trans.includes("MYMEMORY WARNING")) {
          return trans.trim();
        }
      }
    } catch (e) {}

    // 通道 4: 离线智能技术语义解析保底
    return this.fallbackSemanticChinese(trimmed);
  }

  fallbackSemanticChinese(text) {
    const lower = text.toLowerCase();
    const parts = [];

    if (lower.includes("copilot") || lower.includes("assistant") || lower.includes("agent")) {
      parts.push("AI 智能副驾协同助手");
    } else if (lower.includes("ai") || lower.includes("gpt") || lower.includes("llm") || lower.includes("model")) {
      parts.push("新一代人工智能工具");
    }

    if (lower.includes("gtm") || lower.includes("sales") || lower.includes("market") || lower.includes("founder")) {
      parts.push("面向创客与市场拓展 (GTM)");
    }
    if (lower.includes("talk") || lower.includes("voice") || lower.includes("audio") || lower.includes("speech") || lower.includes("live")) {
      parts.push("支持实时对话与语音转写分析");
    }
    if (lower.includes("data") || lower.includes("structured") || lower.includes("database")) {
      parts.push("实现高价值结构化数据沉淀");
    }
    if (lower.includes("mcp") || lower.includes("action") || lower.includes("automate") || lower.includes("workflow")) {
      parts.push("支持 MCP 协议与多项即时自动化任务联动");
    }
    if (lower.includes("developer") || lower.includes("code") || lower.includes("git") || lower.includes("terminal")) {
      parts.push("提升全流程编程开发效能");
    }
    if (lower.includes("design") || lower.includes("ui") || lower.includes("canvas") || lower.includes("visual")) {
      parts.push("现代化交互界面与设计创作");
    }

    if (parts.length > 0) {
      return parts.join("，") + "，帮助团队高效完成业务落地与创意研发。";
    }

    return "今日热门全网新发布工具，主打生产力加速与极客创意探索，值得深入体验。";
  }

  // 智能推断工具中文小标题/角色说明 (中英文双向推断)
  extractChineseTitle(name, desc) {
    const content = (name + " " + (desc || "")).toLowerCase();
    if (content.includes("gtm") || content.includes("marketing") || content.includes("sales") || content.includes("出海") || content.includes("增长")) return "AI 增长与出海副驾";
    if (content.includes("talk") || content.includes("voice") || content.includes("audio") || content.includes("对话") || content.includes("语音") || content.includes("谈话")) return "实时对话结构化引擎";
    if (content.includes("code") || content.includes("developer") || content.includes("ide") || content.includes("编程") || content.includes("代码")) return "新一代智能编程工具";
    if (content.includes("design") || content.includes("ui") || content.includes("figma") || content.includes("设计")) return "设计与交互原型利器";
    if (content.includes("music") || content.includes("sound") || content.includes("音乐") || content.includes("音频")) return "生成式音乐与音频创作";
    if (content.includes("workflow") || content.includes("automation") || content.includes("mcp") || content.includes("自动化")) return "自动化业务流系统";
    if (content.includes("search") || content.includes("deduplication") || content.includes("knowledge") || content.includes("消歧") || content.includes("去重")) return "语义去重与知识消歧";
    if (content.includes("note") || content.includes("wiki") || content.includes("doc") || content.includes("笔记") || content.includes("摘录")) return "智能知识库与笔记";
    if (content.includes("api") || content.includes("router") || content.includes("网关")) return "多模型统一接口网关";
    if (content.includes("album") || content.includes("photo") || content.includes("票册") || content.includes("相册")) return "数字生活纪念与记录";
    return "智能生产力工具";
  }

  // 智能推断工具亮点标签
  extractHighlights(title, desc) {
    const content = (title + " " + desc).toLowerCase();
    const tags = [];
    if (content.includes("ai") || content.includes("智能") || content.includes("llm") || content.includes("model")) tags.push("🤖 AI 赋能");
    if (content.includes("code") || content.includes("编程") || content.includes("dev") || content.includes("git")) tags.push("💻 开发者工具");
    if (content.includes("gtm") || content.includes("增长") || content.includes("出海") || content.includes("创客")) tags.push("🚀 商业出海");
    if (content.includes("voice") || content.includes("语音") || content.includes("对话") || content.includes("talk")) tags.push("🎙️ 语音对话");
    if (content.includes("mcp") || content.includes("协议") || content.includes("自动化")) tags.push("⚡ MCP 自动化");
    if (content.includes("开源") || content.includes("free") || content.includes("github")) tags.push("✨ 开源免费");
    if (content.includes("设计") || content.includes("design") || content.includes("ui")) tags.push("🎨 创意设计");
    if (!tags.length) tags.push("⚡ 效率提升", "🔥 今日热门");
    return tags.slice(0, 3);
  }

  // 综合动态多源轮转与包罗万象推荐引擎 (解决单源扎堆导致前排单一的问题，保证前排各领域百花齐放)
  interleaveAndDiversifyDaily(items, mode = "all") {
    if (!items || !items.length) return [];

    let targetItems = [...items];
    if (mode === "news") {
      targetItems = targetItems.filter(t => t.isNews || t.itemType === "news");
    } else if (mode === "tools") {
      targetItems = targetItems.filter(t => !t.isNews && t.itemType !== "news");
    }

    if (!targetItems.length) return [];

    // 1. 按渠道 / 来源将项目分组
    const sourceBuckets = new Map();
    targetItems.forEach(item => {
      const srcKey = item.sourceType || item.sourceId || (item.isNews ? "News" : "Tools");
      if (!sourceBuckets.has(srcKey)) {
        sourceBuckets.set(srcKey, []);
      }
      sourceBuckets.get(srcKey).push(item);
    });

    // 2. 对每个来源桶内部按推荐权重排序 (AI深度提炼优先、热度分数降序、新发布优先)
    sourceBuckets.forEach((list) => {
      list.sort((a, b) => {
        const aAi = a.aiGenerated ? 1 : 0;
        const bAi = b.aiGenerated ? 1 : 0;
        if (aAi !== bAi) return bAi - aAi;

        const aScore = typeof a.score === "number" ? a.score : 0;
        const bScore = typeof b.score === "number" ? b.score : 0;
        if (aScore !== bScore) return bScore - aScore;

        return 0;
      });
    });

    // 3. 多源穿插交织推荐算法 (Round-Robin Diversification)
    // 保证前排包罗万象：首轮将人文/全球/财经/自然/艺术等非科技领域与创新工具/科技动态交替编排，彻底打破科技单圈茧房
    const result = [];
    const bucketKeys = Array.from(sourceBuckets.keys());

    const preferredOrder = [
      "知乎日报",
      "FT中文网",
      "Product Hunt",
      "Aeon 人文",
      "BBC 中文",
      "GitHub",
      "自然科学",
      "AIHot",
      "艺术美学",
      "Solidot",
      "V2EX",
      "阮一峰周刊",
      "少数派",
      "Hacker News",
      "极客公园"
    ];

    bucketKeys.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      const rankA = idxA !== -1 ? idxA : 99;
      const rankB = idxB !== -1 ? idxB : 99;
      return rankA - rankB;
    });

    let hasRemaining = true;
    while (hasRemaining) {
      hasRemaining = false;
      for (const key of bucketKeys) {
        const bucket = sourceBuckets.get(key);
        if (bucket && bucket.length > 0) {
          hasRemaining = true;
          result.push(bucket.shift());
        }
      }
    }

    return result;
  }

  // 跨界非科技 RSS 内置源配置表 (统一参数化抓取，杜绝重复代码)
  getCrossDomainRssConfigs() {
    return [
      {
        id: "bbc_zh",
        url: "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml",
        sourceType: "BBC 中文",
        sourceName: "BBC 中文全球视野",
        badge: "全球视野",
        domainStyle: "world",
        score: 94,
        translate: false,
        maxItems: 4,
        reason: "跳出日常社交语境，直击世界各地的社会变迁、国际政经动态与跨文化深度观察。",
        highlights: ["🌍 全球视野", "📰 社会观察", "🌐 跨文化视角"]
      },
      {
        id: "ft_zh",
        url: "https://www.ftchinese.com/rss/feed",
        sourceType: "FT中文网",
        sourceName: "FT中文网财经商业",
        badge: "宏观财经",
        domainStyle: "finance",
        score: 95,
        translate: false,
        maxItems: 4,
        reason: "从宏观经济周期、全球金融格局与企业战略演进出发，理解社会运转背后的真实经济脉络。",
        highlights: ["📈 宏观财经", "💼 商业洞察", "💹 全球金融"]
      },
      {
        id: "aeon",
        url: "https://aeon.co/feed.rss",
        sourceType: "Aeon 人文",
        sourceName: "Aeon 人文思想",
        badge: "人文哲学",
        domainStyle: "humanities",
        score: 97,
        translate: true,
        maxItems: 4,
        reason: "世界顶尖思想杂志的长篇思辨：探讨哲学伦理、人类历史、心理学与存在的深层意义。",
        highlights: ["🏛️ 哲学思辨", "📜 历史人类学", "💭 思想长文"]
      },
      {
        id: "sciencedaily",
        url: "https://www.sciencedaily.com/rss/top/science.xml",
        sourceType: "自然科学",
        sourceName: "ScienceDaily 自然生命",
        badge: "生命宇宙",
        domainStyle: "science",
        score: 93,
        translate: true,
        maxItems: 4,
        reason: "关注生命演化、神经科学、地质生态与浩瀚宇宙的最新实证发现，重建对自然世界的敬畏。",
        highlights: ["🧬 生命科学", "🌌 宇宙探索", "🌿 生态发现"]
      },
      {
        id: "colossal",
        url: "https://www.thisiscolossal.com/feed/",
        sourceType: "艺术美学",
        sourceName: "Colossal 艺术美学",
        badge: "艺术设计",
        domainStyle: "art",
        score: 92,
        translate: true,
        maxItems: 4,
        reason: "游走于当代艺术、空间建筑、摄影美学与手工造物之间，滋养技术之外的审美直觉。",
        highlights: ["🎨 视觉艺术", "🏛️ 空间美学", "✨ 创意灵感"]
      }
    ];
  }

  // 执行全网多源的抓取与聚合 (跨界非科技真破茧资讯 + 前沿科技 + 创新极客工具)
  async syncDailyTools(force = true) {
    if (this.isSyncing) return this.dailyTools;
    this.isSyncing = true;

    try {
      if (!this.newsConfig) await this.loadNewsConfig();

      const tasks = [];

      // ================= 1A. 跨界破茧非科技资讯源 (人文/全球/财经/自然/艺术/百科) =================
      if (this.newsConfig.enabledSources.zhihudaily !== false) {
        tasks.push(this.fetchZhihuDaily());
      }
      for (const rssCfg of this.getCrossDomainRssConfigs()) {
        if (this.newsConfig.enabledSources[rssCfg.id] !== false) {
          tasks.push(this.fetchRssNewsSource(rssCfg));
        }
      }

      // ================= 1B. 前沿科技与深度思考资讯源 =================
      if (this.newsConfig.enabledSources.solidot !== false) {
        tasks.push(this.fetchSolidotNews());
      }
      if (this.newsConfig.enabledSources.ruanyifeng !== false) {
        tasks.push(this.fetchRuanyifengWeekly());
      }
      if (this.newsConfig.enabledSources.sspai !== false) {
        tasks.push(this.fetchSspaiNews());
      }
      if (this.newsConfig.enabledSources.geekpark !== false) {
        tasks.push(this.fetchGeekParkNews());
      }
      if (this.newsConfig.enabledSources.hackernews !== false) {
        tasks.push(this.fetchHackerNewsTop());
      }
      if (this.newsConfig.enabledSources.aihot !== false) {
        tasks.push(this.fetchAiHotDaily());
      }

      // 自定义用户 RSS / Atom 订阅源
      if (Array.isArray(this.newsConfig.customFeeds)) {
        for (const feed of this.newsConfig.customFeeds) {
          if (feed.enabled !== false && feed.url) {
            tasks.push(this.fetchCustomRssFeed(feed));
          }
        }
      }

      // ================= 2. 创新工具与极客开源产品源 =================
      tasks.push(
        this.fetchProductHuntDaily(),
        this.fetchGitHubTrendingTools(),
        this.fetchHackerNewsShowHN(),
        this.fetchV2exCreateDaily()
      );

      const settledResults = await Promise.allSettled(tasks);
      let aggregated = [];

      for (const res of settledResults) {
        if (res.status === "fulfilled" && Array.isArray(res.value) && res.value.length > 0) {
          aggregated.push(...res.value);
        }
      }

      if (aggregated.length > 0) {
        // 使用多源穿插打散算法重排，确保前排包罗万象
        this.dailyTools = this.interleaveAndDiversifyDaily(aggregated, "all");
        this.lastSyncTime = Date.now();
        this.cachedDate = this.getTodayDateString();

        // 若用户已开启 AI 大模型接口，自动让 AI 扫描提炼未生成概要的项目
        if (window.aiService && window.aiService.isEnabled()) {
          try {
            await window.aiService.batchScanDailyTools(this.dailyTools);
          } catch (aiErr) {
            console.warn("AI 自动扫描新发现异常:", aiErr);
          }
        }

        await this.saveToCache();
      }
    } catch (err) {
      console.warn("同步每日多源发现失败:", err);
    } finally {
      this.isSyncing = false;
    }

    return this.dailyTools;
  }

  // 通用跨界 RSS/Atom 资讯源抓取引擎 (统一处理中文/外文翻译与跨界领域元数据)
  async fetchRssNewsSource(cfg) {
    if (!cfg || !cfg.url) return [];
    try {
      const res = await fetch(cfg.url, {
        headers: { "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
        signal: AbortSignal.timeout(7000)
      });
      if (!res.ok) return [];
      const xmlText = await res.text();
      const isAtom = xmlText.includes("<feed") && !xmlText.includes("<rss");
      const rawItems = this.parseXmlFeed(xmlText, isAtom, cfg.maxItems || 4);
      if (!rawItems.length) return [];

      return await Promise.all(rawItems.map(async (it, idx) => {
        let title = (it.title || "").trim();
        let rawDesc = (it.desc || title).trim();
        if (rawDesc.length > 155) rawDesc = rawDesc.slice(0, 155) + "...";

        let descZh = rawDesc;
        if (cfg.translate) {
          const needTitleTrans = !/[\u4e00-\u9fa5]{2,}/.test(title);
          const needDescTrans = !/[\u4e00-\u9fa5]{3,}/.test(rawDesc);
          const [tTitle, tDesc] = await Promise.all([
            needTitleTrans ? this.translateToChinese(title) : Promise.resolve(title),
            needDescTrans ? this.translateToChinese(rawDesc) : Promise.resolve(rawDesc)
          ]);
          if (tTitle && /[\u4e00-\u9fa5]{2,}/.test(tTitle) && tTitle.length <= 70) {
            title = tTitle;
          }
          if (tDesc && /[\u4e00-\u9fa5]{2,}/.test(tDesc)) {
            descZh = tDesc;
          }
        }

        return {
          id: `${cfg.id}-${idx}-${Date.now()}`,
          name: title,
          title: title,
          titleZh: cfg.sourceName,
          desc: descZh,
          descZh: descZh,
          rawDesc: rawDesc,
          url: it.link,
          category: "daily",
          badge: cfg.badge,
          domainStyle: cfg.domainStyle || "humanities",
          sourceType: cfg.sourceType,
          sourceName: cfg.sourceName,
          sourceId: cfg.id,
          itemType: "news",
          isNews: true,
          score: cfg.score || 92,
          reason: cfg.reason,
          highlights: cfg.highlights || ["🌐 跨界破茧"],
          pubDate: this.formatNewsDate(it.date),
          isDaily: true
        };
      }));
    } catch (e) {
      console.warn(`跨界资讯源 [${cfg.sourceName}] 抓取异常:`, e);
      return [];
    }
  }

  // 数据源: 知乎日报精选 (历史掌故、社会心理、博物科普与日常奇思)
  async fetchZhihuDaily() {
    try {
      const res = await fetch("https://news-at.zhihu.com/api/4/news/latest", {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(5500)
      });
      if (!res.ok) return [];
      const json = await res.json();
      const stories = Array.isArray(json.stories) ? json.stories.slice(0, 4) : [];
      if (!stories.length) return [];

      return await Promise.all(stories.map(async (s) => {
        let excerpt = s.hint ? `${s.hint} · ${s.title}` : s.title;
        let authorHint = s.hint || "知乎日报编辑部";

        try {
          const detailRes = await fetch(`https://news-at.zhihu.com/api/4/news/${s.id}`, {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(2500)
          });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            if (detail && detail.body) {
              const cleanedBody = this.cleanRssHtml(
                detail.body
                  .replace(/<script[\s\S]*?<\/script>/gi, " ")
                  .replace(/<style[\s\S]*?<\/style>/gi, " ")
                  .replace(/<div class="meta">[\s\S]*?<\/div>/gi, " ")
                  .replace(/<h2 class="question-title">[\s\S]*?<\/h2>/gi, " ")
              );
              if (cleanedBody && cleanedBody.length > 16) {
                excerpt = cleanedBody.length > 140 ? cleanedBody.slice(0, 140) + "..." : cleanedBody;
              }
            }
          }
        } catch (err) {}

        return {
          id: `zhihu-${s.id}-${Date.now()}`,
          name: s.title,
          title: s.title,
          titleZh: "知乎日报精选",
          desc: excerpt,
          descZh: excerpt,
          rawDesc: excerpt,
          url: s.url || `https://daily.zhihu.com/story/${s.id}`,
          category: "daily",
          badge: "生活百科",
          domainStyle: "humanities",
          sourceType: "知乎日报",
          sourceName: authorHint,
          sourceId: "zhihudaily",
          itemType: "news",
          isNews: true,
          score: 94,
          reason: "从历史冷知识、心理学到博物科普，在工作之外保留对世界运作方式的好奇心。",
          highlights: ["📚 博物百科", "🧠 社会心理", "☕ 生活奇思"],
          pubDate: "今日精选",
          isDaily: true
        };
      }));
    } catch (e) {
      console.warn("知乎日报源抓取异常:", e);
      return [];
    }
  }

  // 数据源: Solidot 奇客 (开源软件、网络安全、前沿科学、天文宇宙与数字伦理)
  async fetchSolidotNews() {
    try {
      const res = await fetch("https://www.solidot.org/index.rss", {
        headers: { "Accept": "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return [];
      const xmlText = await res.text();
      const items = this.parseXmlFeed(xmlText, false, 6);
      return items.map((it, idx) => {
        const desc = it.desc || it.title;
        return {
          id: `solidot-${idx}-${Date.now()}`,
          name: it.title,
          title: it.title,
          titleZh: "Solidot 奇客",
          desc: desc,
          descZh: desc,
          rawDesc: desc,
          url: it.link,
          category: "daily",
          badge: "开源科学",
          sourceType: "Solidot",
          sourceName: "Solidot 奇客",
          sourceId: "solidot",
          itemType: "news",
          isNews: true,
          score: 93,
          reason: "奇客开源与科学视点：跨界报道自然科学、太空探索、开源体系与前沿网安，打破算法单一茧房。",
          highlights: ["🌐 科学探索", "⚡ 开源网安", "💡 独立思辨"],
          pubDate: this.formatNewsDate(it.date),
          isDaily: true
        };
      });
    } catch (e) {
      console.warn("Solidot 奇客源抓取异常:", e);
      return [];
    }
  }

  // 数据源: 阮一峰科技爱好者周刊 (科技随笔、长远思考、精选开源资源与奇趣站点)
  async fetchRuanyifengWeekly() {
    try {
      const res = await fetch("https://www.ruanyifeng.com/blog/atom.xml", {
        headers: { "Accept": "application/atom+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return [];
      const xmlText = await res.text();
      const items = this.parseXmlFeed(xmlText, true, 4);
      return items.map((it, idx) => {
        let desc = it.desc || it.title;
        if (desc.length > 150) desc = desc.slice(0, 150) + "...";
        return {
          id: `ruan-${idx}-${Date.now()}`,
          name: it.title,
          title: it.title,
          titleZh: "阮一峰周刊",
          desc: desc,
          descZh: desc,
          rawDesc: desc,
          url: it.link,
          category: "daily",
          badge: "科技周刊",
          sourceType: "阮一峰周刊",
          sourceName: "阮一峰科技爱好者周刊",
          sourceId: "ruanyifeng",
          itemType: "news",
          isNews: true,
          score: 96,
          reason: "记录每周值得分享的科技思考、开发者思想、未来科技随笔与奇趣开源站点，开拓长远视野。",
          highlights: ["📖 深度随笔", "🔭 科技思考", "✨ 视野开拓"],
          pubDate: this.formatNewsDate(it.date),
          isDaily: true
        };
      });
    } catch (e) {
      console.warn("阮一峰周刊源抓取异常:", e);
      return [];
    }
  }

  // 数据源: 少数派 sspai (数字生活、效能工作流、软硬件深度体验)
  async fetchSspaiNews() {
    try {
      const res = await fetch("https://sspai.com/feed", {
        headers: { "Accept": "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return [];
      const xmlText = await res.text();
      const items = this.parseXmlFeed(xmlText, false, 6);
      return items.map((it, idx) => {
        const desc = it.desc || it.title;
        return {
          id: `sspai-${idx}-${Date.now()}`,
          name: it.title,
          title: it.title,
          titleZh: "少数派 sspai",
          desc: desc,
          descZh: desc,
          rawDesc: desc,
          url: it.link,
          category: "daily",
          badge: "数字生活",
          sourceType: "少数派",
          sourceName: "少数派 sspai",
          sourceId: "sspai",
          itemType: "news",
          isNews: true,
          score: 89,
          reason: "高效工作流与高品质数字生活指南，探索优秀软硬件工具如何真正赋能日常生产力。",
          highlights: ["📱 数字生活", "⚡ 效能提升", "✨ 软硬件评测"],
          pubDate: this.formatNewsDate(it.date),
          isDaily: true
        };
      });
    } catch (e) {
      console.warn("少数派源抓取异常:", e);
      return [];
    }
  }

  // 数据源: 极客公园 GeekPark (前沿产业科技、硬核硬件与创新商业)
  async fetchGeekParkNews() {
    try {
      const res = await fetch("https://www.geekpark.net/rss", {
        headers: { "Accept": "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return [];
      const xmlText = await res.text();
      const items = this.parseXmlFeed(xmlText, false, 6);
      return items.map((it, idx) => {
        let desc = it.desc || it.title;
        if (desc.length > 150) desc = desc.slice(0, 150) + "...";
        return {
          id: `geekpark-${idx}-${Date.now()}`,
          name: it.title,
          title: it.title,
          titleZh: "极客公园 GeekPark",
          desc: desc,
          descZh: desc,
          rawDesc: desc,
          url: it.link,
          category: "daily",
          badge: "极客创新",
          sourceType: "极客公园",
          sourceName: "极客公园 GeekPark",
          sourceId: "geekpark",
          itemType: "news",
          isNews: true,
          score: 90,
          reason: "前沿产业科技与硬核商业创新观察，聚焦前沿探索与改变未来的新物种报道。",
          highlights: ["🚀 产业创新", "🤖 智能硬件", "💡 突破性商业"],
          pubDate: this.formatNewsDate(it.date),
          isDaily: true
        };
      });
    } catch (e) {
      console.warn("极客公园源抓取异常:", e);
      return [];
    }
  }

  // 数据源: Hacker News 精选 (硅谷极客工程文化、计算机科学与全球工程师热议)
  async fetchHackerNewsTop() {
    const feedUrl = "https://news.ycombinator.com/showrss";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6500) });
      if (!res.ok) return [];
      const json = await res.json();
      if (json.status !== "ok" || !Array.isArray(json.items)) return [];

      const rawItems = json.items.slice(0, 6);
      const results = [];
      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        let rawTitle = (item.title || "").trim();
        let cleanedDesc = this.cleanRssHtml(item.description || rawTitle);
        if (cleanedDesc.length > 140) cleanedDesc = cleanedDesc.slice(0, 140) + "...";

        const descZh = await this.translateToChinese(cleanedDesc);

        results.push({
          id: `hn-top-${item.guid || i}-${Date.now()}`,
          name: rawTitle,
          title: rawTitle,
          titleZh: "Hacker News 精选",
          desc: descZh || cleanedDesc,
          descZh: descZh || cleanedDesc,
          rawDesc: cleanedDesc,
          url: item.link,
          category: "daily",
          badge: "全球极客",
          sourceType: "Hacker News",
          sourceName: "Hacker News 精选",
          sourceId: "hackernews",
          itemType: "news",
          isNews: true,
          score: 94,
          reason: "硅谷极客工程文化、全球独立创造与前沿计算机科学深度探讨，洞察硅谷工程师脉搏。",
          highlights: ["💡 硅谷极客", "💻 工程文化", "🌍 全球热议"],
          pubDate: item.pubDate ? this.formatNewsDate(item.pubDate) : "今日热议",
          isDaily: true
        });
      }
      return results;
    } catch (e) {
      console.warn("Hacker News 精选源抓取异常:", e);
      return [];
    }
  }

  // 数据源: 用户自定义 RSS / Atom 订阅源 (支持任意订阅地址)
  async fetchCustomRssFeed(feed) {
    if (!feed || !feed.url) return [];
    try {
      const res = await fetch(feed.url, {
        headers: { "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
        signal: AbortSignal.timeout(7000)
      });
      if (!res.ok) return [];
      const xmlText = await res.text();
      const isAtom = xmlText.includes("<feed") || xmlText.includes("<entry");
      const items = this.parseXmlFeed(xmlText, isAtom, 5);

      const results = [];
      for (let idx = 0; idx < items.length; idx++) {
        const it = items[idx];
        let desc = it.desc || it.title;
        if (!/[\u4e00-\u9fa5]{3,}/.test(desc)) {
          const trans = await this.translateToChinese(desc);
          if (trans && /[\u4e00-\u9fa5]/.test(trans)) desc = trans;
        }
        results.push({
          id: `custom-${feed.id}-${idx}-${Date.now()}`,
          name: it.title,
          title: it.title,
          titleZh: feed.name,
          desc: desc,
          descZh: desc,
          rawDesc: it.desc,
          url: it.link,
          category: "daily",
          badge: "自定义订阅",
          sourceType: feed.name,
          sourceName: feed.name,
          sourceId: feed.id,
          itemType: "news",
          isNews: true,
          score: 86,
          reason: `用户专属 RSS 订阅《${feed.name}》，打破信息茧房与算法推荐束缚。`,
          highlights: ["📡 自定义源", "✨ 专属订阅", "💡 独立阅读"],
          pubDate: this.formatNewsDate(it.date),
          isDaily: true
        });
      }
      return results;
    } catch (e) {
      console.warn(`自定义源 [${feed.name}] 抓取异常:`, e);
      return [];
    }
  }

  // 数据源 0: AIHot (aihot.news) 每日精选前沿热点与产品
  async fetchAiHotDaily() {
    const apiUrl = "https://aihot.news/api/v1/items?mode=selected&window=24h&limit=20";
    try {
      const res = await fetch(apiUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(6500)
      });
      if (!res.ok) return [];

      const json = await res.json();
      if (!json || !Array.isArray(json.items) || json.items.length === 0) return [];

      const rawItems = json.items.slice(0, 8);
      const results = [];

      for (const it of rawItems) {
        const title = it.title ? it.title.trim() : "AI 前沿热点";
        const summary = it.summary ? it.summary.trim() : (it.originalTitle || title);
        const sourceName = it.source?.name || "AIHot 精选";
        const url = it.links?.original || it.links?.aihot || "https://aihot.news";

        let titleZh = sourceName;
        if (titleZh.includes("公众号：")) titleZh = titleZh.replace("公众号：", "").trim();
        if (titleZh.includes("X：")) titleZh = titleZh.replace("X：", "").trim();
        if (!titleZh) titleZh = it.category === "ai-products" ? "AI 新品速递" : "AI 前沿资讯";

        const tags = ["🔥 " + (titleZh.length > 8 ? titleZh.slice(0, 8) : titleZh)];
        if (it.score) tags.push(`⭐ 热度 ${it.score}`);
        tags.push(it.category === "ai-products" ? "🚀 AI新品" : "📰 行业大事件");

        results.push({
          id: `aihot-${it.id || Date.now()}`,
          name: title,
          title: title,
          titleZh: titleZh,
          desc: summary,
          descZh: summary,
          rawDesc: summary,
          url: url,
          category: "daily",
          sourceType: "AIHot",
          sourceName: sourceName,
          badge: it.category === "industry" ? "深度资讯" : (it.category === "ai-products" ? "AI新品资讯" : "前沿快报"),
          itemType: "news",
          isNews: true,
          score: it.score || 85,
          reason: it.reason || "",
          isDaily: true,
          highlights: tags.slice(0, 3),
          pubDate: it.publishedAt ? it.publishedAt.slice(0, 10) : "今日发布"
        });
      }

      return results;
    } catch (e) {
      console.warn("AIHot API 源异常:", e);
      return [];
    }
  }

  // 数据源 1: Product Hunt 每日新发布产品
  async fetchProductHuntDaily() {
    const feedUrl = "https://www.producthunt.com/feed";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    
    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6500) });
      if (!res.ok) return [];
      
      const json = await res.json();
      if (json.status !== "ok" || !Array.isArray(json.items)) return [];

      const rawItems = json.items.slice(0, 6);
      const results = [];

      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        let cleanedDesc = this.cleanRssHtml(item.description);
        if (cleanedDesc.length > 140) cleanedDesc = cleanedDesc.slice(0, 140) + "...";

        const descZh = await this.translateToChinese(cleanedDesc);
        const titleZh = this.extractChineseTitle(item.title, descZh);
        const highlights = this.extractHighlights(item.title, descZh);
        highlights.unshift("🚀 PH新品");

        results.push({
          id: `ph-${item.guid || i}-${Date.now()}`,
          name: item.title,
          titleZh: titleZh,
          desc: descZh,
          descZh: descZh,
          rawDesc: cleanedDesc,
          url: item.link,
          category: "daily",
          sourceType: "Product Hunt",
          badge: "PH 新品",
          isDaily: true,
          highlights: highlights.slice(0, 3),
          pubDate: item.pubDate ? item.pubDate.slice(0, 10) : "今日发布"
        });
      }

      return results;
    } catch (e) {
      console.warn("Product Hunt 源异常:", e);
      return [];
    }
  }

  // 数据源 2: GitHub 热榜开发者工具
  async fetchGitHubTrendingTools() {
    const apiUrl = "https://api.github.com/search/repositories?q=topic:developer-tools+pushed:>2024-01-01&sort=stars&order=desc&per_page=6";
    
    try {
      const res = await fetch(apiUrl, {
        headers: { "Accept": "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(6500)
      });
      if (!res.ok) return [];

      const json = await res.json();
      if (!Array.isArray(json.items)) return [];

      const repos = json.items.slice(0, 6);
      const results = [];

      for (const repo of repos) {
        let rawDesc = repo.description || "热门开源实用项目";
        const descZh = await this.translateToChinese(rawDesc);
        const starsCount = (repo.stargazers_count / 1000).toFixed(1);
        const highlights = ["⭐ " + starsCount + "k★", "💻 优质开源", "🛠️ 极客神器"];
        const titleZh = this.extractChineseTitle(repo.name, descZh);

        results.push({
          id: `gh-${repo.id}`,
          name: repo.name,
          titleZh: titleZh,
          desc: `${descZh} (${starsCount}k★)`,
          descZh: descZh,
          rawDesc: rawDesc,
          url: repo.html_url,
          category: "daily",
          sourceType: "GitHub",
          badge: "GitHub 热榜",
          isDaily: true,
          highlights: highlights,
          pubDate: "活跃更新"
        });
      }

      return results;
    } catch (e) {
      console.warn("GitHub API 源异常:", e);
      return [];
    }
  }

  // 数据源 3: Hacker News (Show HN - 全球极客独立作品与新奇工具)
  async fetchHackerNewsShowHN() {
    const feedUrl = "https://news.ycombinator.com/showrss";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6500) });
      if (!res.ok) return [];

      const json = await res.json();
      if (json.status !== "ok" || !Array.isArray(json.items)) return [];

      const rawItems = json.items.slice(0, 6);
      const results = [];

      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        const rawTitle = (item.title || "").replace(/^Show HN:\s*/i, "").trim();
        let name = rawTitle;
        let rawDesc = rawTitle;

        if (rawTitle.includes("–")) {
          const p = rawTitle.split("–");
          name = p[0].trim();
          rawDesc = p.slice(1).join("–").trim();
        } else if (rawTitle.includes(" - ")) {
          const p = rawTitle.split(" - ");
          name = p[0].trim();
          rawDesc = p.slice(1).join(" - ").trim();
        } else if (rawTitle.includes(":")) {
          const p = rawTitle.split(":");
          name = p[0].trim();
          rawDesc = p.slice(1).join(":").trim();
        } else if (rawTitle.includes(",")) {
          const p = rawTitle.split(",");
          name = p[0].trim();
          rawDesc = p.slice(1).join(",").trim();
        }

        const descZh = await this.translateToChinese(rawDesc);
        const titleZh = this.extractChineseTitle(name, descZh);
        const highlights = this.extractHighlights(name, descZh);
        highlights.unshift("💡 Show HN");

        results.push({
          id: `hn-${item.guid || i}-${Date.now()}`,
          name: name,
          titleZh: titleZh,
          desc: descZh || rawDesc,
          descZh: descZh || rawDesc,
          rawDesc: rawDesc,
          url: item.link,
          category: "daily",
          sourceType: "Hacker News",
          badge: "Show HN",
          isDaily: true,
          highlights: highlights.slice(0, 3),
          pubDate: item.pubDate ? item.pubDate.slice(0, 10) : "今日发布"
        });
      }

      return results;
    } catch (e) {
      console.warn("Hacker News Show HN 源异常:", e);
      return [];
    }
  }

  // 数据源 4: V2EX 创想工坊 (国内独立开发者首发与新奇产品)
  async fetchV2exCreateDaily() {
    const feedUrl = "https://www.v2ex.com/feed/create.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6500) });
      if (!res.ok) return [];

      const json = await res.json();
      if (json.status !== "ok" || !Array.isArray(json.items)) return [];

      const rawItems = json.items.slice(0, 6);
      const results = [];

      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        let name = item.title ? item.title.trim() : "独立作品";
        name = name.replace(/^\[[^\]]+\]\s*/g, "").trim();
        if (name.includes("：")) {
          const parts = name.split("：");
          name = parts[0].trim();
        } else if (name.includes("——")) {
          const parts = name.split("——");
          name = parts[0].trim();
        }

        let cleanedDesc = this.cleanRssHtml(item.description);
        if (cleanedDesc.length > 130) cleanedDesc = cleanedDesc.slice(0, 130) + "...";
        if (!cleanedDesc) cleanedDesc = item.title;

        const titleZh = this.extractChineseTitle(name, cleanedDesc);
        const highlights = this.extractHighlights(name, cleanedDesc);
        highlights.unshift("🇨🇳 独立创造");

        results.push({
          id: `v2-${item.guid || i}-${Date.now()}`,
          name: name,
          titleZh: titleZh,
          desc: cleanedDesc,
          descZh: cleanedDesc,
          rawDesc: cleanedDesc,
          url: item.link,
          category: "daily",
          sourceType: "V2EX",
          badge: "V2EX 创想",
          isDaily: true,
          highlights: highlights.slice(0, 3),
          pubDate: item.pubDate ? item.pubDate.slice(0, 10) : "今日分享"
        });
      }

      return results;
    } catch (e) {
      console.warn("V2EX 创想源异常:", e);
      return [];
    }
  }

  // ================= 奇趣探索更新源 (低频更新，缓存 3 天 / 72 小时) =================

  async syncFunExploreTools(force = false) {
    if (this.isFunSyncing) return this.funExploreTools;
    const threeDaysMs = 3 * 24 * 3600 * 1000;
    if (!force && this.funExploreTools.length > 0 && (Date.now() - this.funLastSync < threeDaysMs)) {
      return this.funExploreTools;
    }

    this.isFunSyncing = true;
    try {
      const results = [];

      // 1. 尝试抓取 GitHub 极客生成艺术与创意前端探索
      try {
        const res = await fetch("https://api.github.com/search/repositories?q=topic:generative-art+stars:>300&sort=updated&per_page=6", {
          headers: { "Accept": "application/vnd.github.v3+json" },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            for (const repo of data.items.slice(0, 4)) {
              const liveUrl = repo.homepage && repo.homepage.startsWith("http") ? repo.homepage : repo.html_url;
              const descZh = await this.translateToChinese(repo.description || "创意视觉艺术项目");
              results.push({
                id: `fun-gh-${repo.id}`,
                name: repo.name,
                titleZh: "生成艺术与视觉实验",
                desc: descZh,
                descZh: descZh,
                url: liveUrl,
                category: "fun",
                badge: "探索新奇",
                sourceType: "奇趣探索",
                highlights: ["🌈 创意编程", "🎨 视觉生成", "✨ 开源探索"],
                pubDate: "本周探索"
              });
            }
          }
        }
      } catch (e) {
        console.warn("奇趣探索 GitHub 源跳过:", e);
      }

      // 2. 轮替精选创意交互动态池 (12 款世界顶级脑洞互动网站)
      const dynamicFunPool = [
        {
          name: "Quick, Draw!",
          titleZh: "Google 神经网络画板",
          desc: "Google AI 猜画小游戏：在 20 秒内画出一幅简笔画，全球规模最大的神经网络会实时大声猜出你画的是什么。",
          url: "https://quickdraw.withgoogle.com",
          badge: "谷歌AI",
          highlights: ["🤖 神经涂鸦", "🎮 益智猜画", "✨ 顶尖创意"]
        },
        {
          name: "Weave Silk",
          titleZh: "流体对称生成艺术",
          desc: "极度解压的交互式生成艺术画板：手指或光标随意轻划，即刻在深邃的夜空中绽放出一朵璀璨对称的星云丝绸。",
          url: "http://weavesilk.com",
          badge: "视觉治愈",
          highlights: ["🌌 星云流体", "🎨 对称艺术", "💆 极致解压"]
        },
        {
          name: "Patatap",
          titleZh: "键盘全频音效打击乐",
          desc: "一个魔性好玩的视听打击乐工坊：键盘上的 26 个英文字母对应着不同的彩色空间几何动效和节奏鼓点音色。",
          url: "https://patatap.com",
          badge: "声光律动",
          highlights: ["🎹 键盘弹奏", "🔊 视听同步", "💥 灵感爆发"]
        },
        {
          name: "Earth 2050",
          titleZh: "2050 未来科技全景预测",
          desc: "卡巴斯基联合全球未来学家打造的 2050 年交互式地球预测展，全景 360 度探索未来城市、人工智能与人类生活。",
          url: "https://2050.earth",
          badge: "未来科幻",
          highlights: ["🚀 2050年", "🌍 3D全景", "🔮 科技预言"]
        },
        {
          name: "Drive & Listen",
          titleZh: "世界城市副驾兜风",
          desc: "坐在世界各地的副驾驶座上：伴随街道 4K 实时穿梭街景，同步收听当地本土广播电台与城市环境白噪音。",
          url: "https://driveandlisten.herokuapp.com",
          badge: "沉浸漫游",
          highlights: ["🚗 城市街景", "📻 本地电台", "🎧 氛围白噪"]
        },
        {
          name: "Blobmaker",
          titleZh: "液态流体 SVG 生成器",
          desc: "现代网页设计师与艺术家的灵感神器：一键随机生成有机、多变、极具设计感的液态流体几何 SVG 图形。",
          url: "https://www.blobmaker.app",
          badge: "设计神器",
          highlights: ["💧 有机流体", "🎨 矢量导出", "📐 现代设计"]
        },
        {
          name: "Chrome Music Lab",
          titleZh: "音波与物理实验工坊",
          desc: "直观探索音乐物理本质的趣味游乐园：通过谐波、声谱图、节拍器等趣味交互，轻松理解音乐与声音的奇妙秘密。",
          url: "https://musiclab.chromeexperiments.com",
          badge: "音乐启蒙",
          highlights: ["🎼 声学物理", "🌈 趣味可视化", "🧪 动手实验"]
        },
        {
          name: "Stellarium Web",
          titleZh: "浏览器 3D 实时星空仪",
          desc: "将真实的浩瀚宇宙装进浏览器：实时演算你头顶此刻的真实星空、八大行星轨迹、人造卫星与璀璨银河深空天体。",
          url: "https://stellarium-web.org",
          badge: "浩瀚星空",
          highlights: ["🔭 实时星空", "🌌 3D银河", "✨ 天文观测"]
        }
      ];

      // 随机选取 4-5 款不重复的创意互动网站混入
      const shuffled = dynamicFunPool.sort(() => 0.5 - Math.random()).slice(0, 5);
      shuffled.forEach((item, idx) => {
        results.push({
          id: `fun-pool-${idx}-${Date.now()}`,
          name: item.name,
          titleZh: item.titleZh,
          desc: item.desc,
          descZh: item.desc,
          url: item.url,
          category: "fun",
          badge: item.badge || "奇趣探索",
          sourceType: "奇趣探索",
          highlights: item.highlights,
          pubDate: "周期探索"
        });
      });

      if (results.length > 0) {
        this.funExploreTools = results;
        this.funLastSync = Date.now();
        await this.saveFunCache();
      }
    } catch (err) {
      console.warn("奇趣探索更新源执行异常:", err);
    } finally {
      this.isFunSyncing = false;
    }

    return this.funExploreTools;
  }

  // 获取奇趣探索分类下的全部工具 (融合精选常备 + 动态探索新奇)
  getFunTools() {
    const list = typeof CURATED_TOOLS !== "undefined" ? CURATED_TOOLS : (window.CURATED_TOOLS || []);
    const staticFun = list.filter(t => t.category === "fun");
    return [...this.funExploreTools, ...staticFun];
  }

  // 获取奇趣探索上次更新的时间距离描述
  getFunLastSyncText() {
    if (!this.funLastSync) return "刚刚更新";
    const diffHours = Math.floor((Date.now() - this.funLastSync) / (3600 * 1000));
    if (diffHours < 1) return "刚刚更新";
    if (diffHours < 24) return `${diffHours} 小时前更新`;
    const days = Math.floor(diffHours / 24);
    return `${days} 天前更新`;
  }

  // 按来源网站筛选获取每日工具
  getToolsBySource(source = "all") {
    if (!source || source === "all") {
      return this.dailyTools;
    }
    return this.dailyTools.filter(t => t.sourceType === source || t.sourceId === source);
  }

  // 按模式 (all / news / tools) 与具体来源筛选获取动态列表
  getToolsByModeAndSource(mode = "all", source = "all") {
    let list = this.dailyTools || [];
    if (mode === "news") {
      list = list.filter(t => t.isNews || t.itemType === "news");
    } else if (mode === "tools") {
      list = list.filter(t => !t.isNews && t.itemType !== "news");
    }

    if (source && source !== "all") {
      list = list.filter(t => t.sourceType === source || t.sourceId === source);
    }
    return list;
  }

  // 兜底高品质全网发现 (跨界人文/全球/财经/自然/艺术 + 科技 + 极客开源工具)
  getFallbackDailyTools() {
    const list = [
      {
        id: "daily-zhihu-ancient-night",
        name: "古代没有电灯，晚上过了8点，古人都怎么打发时间？",
        title: "古代没有电灯，晚上过了8点，古人都怎么打发时间？",
        titleZh: "知乎日报精选",
        desc: "在油灯昂贵、宵禁森严的古代，夜生活并非一片空白。从唐宋夜市灯火、文人雅集煮茶赋诗，到普通人家的纺纱夜话与早睡习俗，夜间生活折射出不同阶层的社会结构与作息变迁。",
        descZh: "在油灯昂贵、宵禁森严的古代，夜生活并非一片空白。从唐宋夜市灯火、文人雅集煮茶赋诗，到普通人家的纺纱夜话与早睡习俗，夜间生活折射出不同阶层的社会结构与作息变迁。",
        rawDesc: "古代没有电灯，晚上过了8点，古人都怎么打发时间？",
        url: "https://daily.zhihu.com/story/9793933",
        category: "daily",
        badge: "生活百科",
        domainStyle: "humanities",
        sourceType: "知乎日报",
        sourceName: "历史人文观察 · 3 分钟阅读",
        sourceId: "zhihudaily",
        itemType: "news",
        isNews: true,
        score: 94,
        reason: "历史掌故与生活史视角：跳出当下工作语境，回看人类千百年来如何感知时间与安顿夜晚。",
        highlights: ["📚 历史人文", "🧠 社会史", "☕ 生活奇思"],
        pubDate: "今日精选",
        isDaily: true
      },
      {
        id: "daily-ft-macro",
        name: "全球供应链重塑下的利率周期与新兴市场货币韧性观察",
        title: "全球供应链重塑下的利率周期与新兴市场货币韧性观察",
        titleZh: "FT中文网财经商业",
        desc: "当高利率环境延续与制造业区域化加速并行，全球资本流动正呈现出与过去二十年截然不同的新规律。解析央行政策空间、能源转型投资与消费结构分化带来的长期宏观信号。",
        descZh: "当高利率环境延续与制造业区域化加速并行，全球资本流动正呈现出与过去二十年截然不同的新规律。解析央行政策空间、能源转型投资与消费结构分化带来的长期宏观信号。",
        rawDesc: "FT中文网宏观经济与商业深度分析。",
        url: "https://www.ftchinese.com/",
        category: "daily",
        badge: "宏观财经",
        domainStyle: "finance",
        sourceType: "FT中文网",
        sourceName: "FT中文网财经商业",
        sourceId: "ft_zh",
        itemType: "news",
        isNews: true,
        score: 95,
        reason: "宏观财经脉络：理解利率、汇率与实体产业背后的底层经济学逻辑，跳出技术单一叙事。",
        highlights: ["📈 宏观财经", "💼 全球商业", "💹 经济周期"],
        pubDate: "今日评论",
        isDaily: true
      },
      {
        id: "daily-aeon-philosophy",
        name: "注意力碎片化时代，为什么人类依然需要「缓慢的共情」",
        title: "注意力碎片化时代，为什么人类依然需要「缓慢的共情」",
        titleZh: "Aeon 人文思想",
        desc: "在即时反馈主导一切的时代，哲学家与心理学家重新审视「深度倾听」与「延迟判断」的价值。理解他人不仅是一种情绪反应，更是需要时间、历史语境与想象力共同浇灌的伦理实践。",
        descZh: "在即时反馈主导一切的时代，哲学家与心理学家重新审视「深度倾听」与「延迟判断」的价值。理解他人不仅是一种情绪反应，更是需要时间、历史语境与想象力共同浇灌的伦理实践。",
        rawDesc: "Aeon essay exploring empathy, philosophy, and human connection.",
        url: "https://aeon.co/",
        category: "daily",
        badge: "人文哲学",
        domainStyle: "humanities",
        sourceType: "Aeon 人文",
        sourceName: "Aeon 人文思想",
        sourceId: "aeon",
        itemType: "news",
        isNews: true,
        score: 97,
        reason: "顶尖人文思想长文：从哲学、心理学与社会学维度，重新思考现代人的情感与精神栖居。",
        highlights: ["🏛️ 哲学思辨", "📜 人文长文", "💭 深度共情"],
        pubDate: "精选长篇",
        isDaily: true
      },
      {
        id: "daily-bbc-world",
        name: "地中海沿岸城市如何改造百年老城区以应对极端高温挑战",
        title: "地中海沿岸城市如何改造百年老城区以应对极端高温挑战",
        titleZh: "BBC 中文全球视野",
        desc: "从雅典的古代引水渠复兴到巴塞罗那的街区遮阴绿廊，欧洲多座历史古城正将传统建筑智慧与社区公共空间结合，为全球城市气候适应提供低能耗、有温度的市政样本。",
        descZh: "从雅典的古代引水渠复兴到巴塞罗那的街区遮阴绿廊，欧洲多座历史古城正将传统建筑智慧与社区公共空间结合，为全球城市气候适应提供低能耗、有温度的市政样本。",
        rawDesc: "BBC 中文全球城市与社会文化特写报道。",
        url: "https://www.bbc.com/zhongwen/simp",
        category: "daily",
        badge: "全球视野",
        domainStyle: "world",
        sourceType: "BBC 中文",
        sourceName: "BBC 中文全球视野",
        sourceId: "bbc_zh",
        itemType: "news",
        isNews: true,
        score: 94,
        reason: "跨文化全球特写：看见不同地域民众的真实生活处境与公共治理实践。",
        highlights: ["🌍 全球视野", "🏙️ 城市社会", "🌐 跨文化观察"],
        pubDate: "今日特写",
        isDaily: true
      },
      {
        id: "daily-science-forest",
        name: "地下菌根网络：森林如何通过真菌实现跨越数代树木的资源互助",
        title: "地下菌根网络：森林如何通过真菌实现跨越数代树木的资源互助",
        titleZh: "ScienceDaily 自然生命",
        desc: "生态学最新长期追踪研究表明，古老母树通过地下共生菌根网络向处于荫蔽下的幼苗输送碳元素与化学预警信号，揭示了自然生态系统远超竞争法则的协同共生智慧。",
        descZh: "生态学最新长期追踪研究表明，古老母树通过地下共生菌根网络向处于荫蔽下的幼苗输送碳元素与化学预警信号，揭示了自然生态系统远超竞争法则的协同共生智慧。",
        rawDesc: "ScienceDaily ecology and life science research highlights.",
        url: "https://www.sciencedaily.com/",
        category: "daily",
        badge: "生命宇宙",
        domainStyle: "science",
        sourceType: "自然科学",
        sourceName: "ScienceDaily 自然生命",
        sourceId: "sciencedaily",
        itemType: "news",
        isNews: true,
        score: 93,
        reason: "自然科学与生态探索：走进微观生命与宏大生态系统的奇妙规律，感受自然的精妙秩序。",
        highlights: ["🧬 生命科学", "🌿 森林生态", "🔬 自然探索"],
        pubDate: "科学速递",
        isDaily: true
      },
      {
        id: "daily-colossal-art",
        name: "光影雕塑与城市记忆：当百年历史街区遇上当代空间装置艺术",
        title: "光影雕塑与城市记忆：当百年历史街区遇上当代空间装置艺术",
        titleZh: "Colossal 艺术美学",
        desc: "艺术家团队以半透明再生玻璃与自然日光为媒介，在历史砖石建筑群间搭建会随季节与太阳高度变幻色彩的户外空间装置，让城市日常通勤成为一场流动的美学漫步。",
        descZh: "艺术家团队以半透明再生玻璃与自然日光为媒介，在历史砖石建筑群间搭建会随季节与太阳高度变幻色彩的户外空间装置，让城市日常通勤成为一场流动的美学漫步。",
        rawDesc: "Colossal contemporary visual art and architectural installation.",
        url: "https://www.thisiscolossal.com/",
        category: "daily",
        badge: "艺术设计",
        domainStyle: "art",
        sourceType: "艺术美学",
        sourceName: "Colossal 艺术美学",
        sourceId: "colossal",
        itemType: "news",
        isNews: true,
        score: 92,
        reason: "当代视觉艺术与空间设计灵感：在理性日常之外，唤醒对色彩、材质与公共美学的敏锐感知。",
        highlights: ["🎨 视觉艺术", "🏛️ 建筑空间", "✨ 审美直觉"],
        pubDate: "美学精选",
        isDaily: true
      },
      {
        id: "daily-solidot-cities",
        name: "世界大城市都在沉降：卫星雷达对全球微小位移的遥感测量",
        title: "世界大城市都在沉降：卫星雷达对全球微小位移的遥感测量",
        titleZh: "Solidot 奇客",
        desc: "最新发表于《Nature Cities》期刊的论文，利用高精度卫星雷达对地面微小位移进行遥感测量，分析了全世界人口超过百万的 465 座城市。受地下水开采与城市重量影响，全球主要大城市均存在不同程度地面沉降，带来跨世纪的城市韧性思考。",
        descZh: "最新发表于《Nature Cities》期刊的论文，利用高精度卫星雷达对地面微小位移进行遥感测量，分析了全世界人口超过百万的 465 座城市。受地下水开采与城市重量影响，全球主要大城市均存在不同程度地面沉降，带来跨世纪的城市韧性思考。",
        rawDesc: "北大等科研团队在 Nature Cities 发表论文，遥感分析全世界大城市沉降现象。",
        url: "https://www.solidot.org/story?sid=85840",
        category: "daily",
        badge: "开源科学",
        sourceType: "Solidot",
        sourceName: "Solidot 奇客",
        sourceId: "solidot",
        itemType: "news",
        isNews: true,
        score: 93,
        reason: "奇客科学视点：打破技术茧房，从空间雷达与地质尺度重新审视人类现代大都市的可持续发展与自然物理边界。",
        highlights: ["🌐 科学探索", "🔭 地球科学", "💡 破茧视野"],
        pubDate: "今日更新",
        isDaily: true
      },
      {
        id: "daily-ruan-418",
        name: "科技爱好者周刊（第 418 期）：如果科技停止在21世纪初",
        title: "科技爱好者周刊（第 418 期）：如果科技停止在21世纪初",
        titleZh: "阮一峰周刊",
        desc: "阮一峰科技随笔：假设科技就停留在 2000 年代初，人类是否会更有专注力与幸福感？本期精选探讨技术演进的哲学边界、值得关注的开源独立项目与全球奇趣站点，给信息过载的当下带来宁静思辨。",
        descZh: "阮一峰科技随笔：假设科技就停留在 2000 年代初，人类是否会更有专注力与幸福感？本期精选探讨技术演进的哲学边界、值得关注的开源独立项目与全球奇趣站点，给信息过载的当下带来宁静思辨。",
        rawDesc: "科技爱好者周刊（第 418 期）：如果科技停止在21世纪初，技术随笔与开源精选。",
        url: "http://www.ruanyifeng.com/blog/2026/11/weekly-issue-418.html",
        category: "daily",
        badge: "科技周刊",
        sourceType: "阮一峰周刊",
        sourceName: "阮一峰科技爱好者周刊",
        sourceId: "ruanyifeng",
        itemType: "news",
        isNews: true,
        score: 96,
        reason: "深度科技人文随笔：跳出当下信息投喂，以宏观视角审视技术与人类生活节奏的平衡，启发长远思考。",
        highlights: ["📖 深度随笔", "🔭 科技思考", "✨ 视野开拓"],
        pubDate: "本周精选",
        isDaily: true
      },
      {
        id: "daily-sspai-apps",
        name: "派评 | 近期值得关注的软硬件与新形态工作流",
        title: "派评 | 近期值得关注的软硬件与新形态工作流",
        titleZh: "少数派 sspai",
        desc: "少数派编辑部深度体验评测：聚焦近期多款打破常规的跨平台数字工具、轻量化笔记工作流与桌面硬件外设，探讨如何利用现代工具链打造专属无干扰生产力空间。",
        descZh: "少数派编辑部深度体验评测：聚焦近期多款打破常规的跨平台数字工具、轻量化笔记工作流与桌面硬件外设，探讨如何利用现代工具链打造专属无干扰生产力空间。",
        rawDesc: "少数派派评：近期值得关注的 App 与效率硬件实测。",
        url: "https://sspai.com/post/118833",
        category: "daily",
        badge: "数字生活",
        sourceType: "少数派",
        sourceName: "少数派 sspai",
        sourceId: "sspai",
        itemType: "news",
        isNews: true,
        score: 89,
        reason: "高效工作流指南：从工具使用技巧到高品质生活美学，让科技真正服务于生活日常。",
        highlights: ["📱 数字生活", "⚡ 效能提升", "🛠️ 优质工具"],
        pubDate: "今日推荐",
        isDaily: true
      },
      {
        id: "daily-geekpark-berry",
        name: "一颗植物工厂草莓，离你的果盘还有多远？前沿农业科技实测",
        title: "一颗植物工厂草莓，离你的果盘还有多远？前沿农业科技实测",
        titleZh: "极客公园 GeekPark",
        desc: "极客公园实地探访现代植物工厂：在 50 平米的无菌垂直农场中，草莓植株码到头顶，全光谱 LED 与营养液智能调配，无农药无虫害，探索农业工业化与自动化栽培的未来商业可能。",
        descZh: "极客公园实地探访现代植物工厂：在 50 平米的无菌垂直农场中，草莓植株码到头顶，全光谱 LED 与营养液智能调配，无农药无虫害，探索农业工业化与自动化栽培的未来商业可能。",
        rawDesc: "极客公园现场报道：多多农研植物工厂草莓与农业科技突破。",
        url: "http://www.geekpark.net/news/373715",
        category: "daily",
        badge: "极客创新",
        sourceType: "极客公园",
        sourceName: "极客公园 GeekPark",
        sourceId: "geekpark",
        itemType: "news",
        isNews: true,
        score: 91,
        reason: "硬核产业科技：跨出纯软件视角，关注生物科技、垂直农场与硬件自动化对传统基础行业的深刻重塑。",
        highlights: ["🚀 产业科技", "🌱 农业硬件", "💡 创新商业"],
        pubDate: "今日快讯",
        isDaily: true
      },
      {
        id: "daily-aihot-tokens",
        name: "数字生命卡兹克上线免费 Token 福利聚合网站 Token羊毛",
        title: "数字生命卡兹克上线免费 Token 福利聚合网站 Token羊毛",
        titleZh: "公众号：数字生命卡兹克",
        desc: "把各厂商公开的免费大模型额度、签到积分、限时免费活动汇总到一页，页面显示今日可领金额并按日、周、月分组，还设计了随领取次数升级亮度的卡片收集玩法。",
        descZh: "把各厂商公开的免费大模型额度、签到积分、限时免费活动汇总到一页，页面显示今日可领金额并按日、周、月分组，还设计了随领取次数升级亮度的卡片收集玩法。",
        rawDesc: "数字生命卡兹克上线免费 Token 羊毛福利聚合网站",
        url: "https://aihot.news/free-tokens",
        category: "daily",
        badge: "AI新品资讯",
        sourceType: "AIHot",
        sourceName: "公众号：数字生命卡兹克",
        sourceId: "aihot",
        itemType: "news",
        isNews: true,
        score: 65,
        reason: "作者自建聚合页免费开放，并把筛选、核实、巡查整套 Agent 流程公开，读者可了解信息聚合类工具的实现思路。",
        highlights: ["🔥 Token羊毛", "⭐ 热度 65", "🚀 AI新品"],
        pubDate: "今日",
        isDaily: true
      },
      {
        id: "daily-aihot-nvidia",
        name: "NVIDIA 董事会就 CEO 遭外国情报行动瞄准一事启动独立调查",
        title: "NVIDIA 董事会就 CEO 遭外国情报行动瞄准一事启动独立调查",
        titleZh: "X：Rohan Paul",
        desc: "NVIDIA 董事会发布声明启动独立调查，调查由独立董事委员会在外部独立律师协助下监督，董事会表示对黄仁勋及其领导团队充满信心，供应链与产品保持稳健推进。",
        descZh: "NVIDIA 董事会发布声明启动独立调查，调查由独立董事委员会在外部独立律师协助下监督，董事会表示对黄仁勋及其领导团队充满信心，供应链与产品保持稳健推进。",
        rawDesc: "NVIDIA officially released a statement from its board of directors.",
        url: "https://aihot.news",
        category: "daily",
        badge: "深度资讯",
        sourceType: "AIHot",
        sourceName: "X：Rohan Paul",
        sourceId: "aihot",
        itemType: "news",
        isNews: true,
        score: 84,
        reason: "作者转述 NVIDIA 董事会官方声明全文，读者可以直接核对董事会调查的安排口径和官方表态。",
        highlights: ["🔥 芯片产业", "⭐ 热度 84", "📰 行业大事件"],
        pubDate: "今日",
        isDaily: true
      },
      {
        id: "daily-axl",
        name: "AXL",
        titleZh: "AI 创客 GTM 智能副驾",
        desc: "面向 AI 时代创客与创业团队的 GTM 智能副驾，支持通过 MCP 协议联动执行 1200+ 项市场调研与客户拓展自动化任务。",
        descZh: "面向 AI 时代创客与创业团队的 GTM 智能副驾，支持通过 MCP 协议联动执行 1200+ 项市场调研与客户拓展自动化任务。",
        rawDesc: "GTM copilot for AI product founders: 1,200+ actions via MCP",
        url: "https://www.producthunt.com/products/axl-2",
        category: "daily",
        badge: "PH 新品",
        sourceType: "Product Hunt",
        highlights: ["🤖 AI 智能副驾", "🚀 商业出海", "⚡ MCP 自动化"],
        pubDate: "今日精选",
        isDaily: true
      },
      {
        id: "daily-sage2",
        name: "Sage2 by Levanto Labs",
        titleZh: "实时对话结构化解析引擎",
        desc: "将现场面对面交流与实时语音快速转化为高价值结构化数据，并联动任务系统自动触发即时行动方案。",
        descZh: "将现场面对面交流与实时语音快速转化为高价值结构化数据，并联动任务系统自动触发即时行动方案。",
        rawDesc: "Turn live talk into structured data and instant actions",
        url: "https://www.producthunt.com/products/sagecraft",
        category: "daily",
        badge: "PH 新品",
        sourceType: "Product Hunt",
        highlights: ["🎙️ 实时语音分析", "📊 结构化数据", "⚡ 即时任务联动"],
        pubDate: "今日精选",
        isDaily: true
      },
      {
        id: "daily-cursor",
        name: "Cursor",
        titleZh: "AI 代码编辑器",
        desc: "专为 AI 时代设计的全新智能代码编辑器，深度融合大型语言模型，大幅提高全流程编程与重构效率。",
        descZh: "专为 AI 时代设计的全新智能代码编辑器，深度融合大型语言模型，大幅提高全流程编程与重构效率。",
        rawDesc: "An AI-powered code editor built on VS Code fork.",
        url: "https://www.cursor.com",
        category: "daily",
        badge: "GitHub 热榜",
        sourceType: "GitHub",
        highlights: ["🤖 AI 辅助编程", "💻 VS Code 兼容", "⚡ 极速生成"],
        pubDate: "常驻热榜",
        isDaily: true
      },
      {
        id: "daily-01router",
        name: "01Router",
        titleZh: "多模型统一接口网关",
        desc: "一个 API 统一接入视频、图片、音频和聊天多种大模型，支持按预算和质量自由路由分发，极大降低多模型集成维护成本。",
        descZh: "一个 API 统一接入视频、图片、音频和聊天多种大模型，支持按预算和质量自由路由分发，极大降低多模型集成维护成本。",
        rawDesc: "Unified API gateway for vision, audio, text LLMs.",
        url: "https://www.v2ex.com/t/1255408",
        category: "daily",
        badge: "V2EX 创想",
        sourceType: "V2EX",
        highlights: ["🇨🇳 独立创造", "⚡ 统一路由", "🛠️ 极客首选"],
        pubDate: "今日创想",
        isDaily: true
      },
      {
        id: "daily-slopcalculator",
        name: "Slop Calculator",
        titleZh: "AI 垃圾内容评估器",
        desc: "硅谷极客打造的趣味检测工具：快速诊断并评估某个 AI 产品是真正解决痛点还是粗制滥造的噱头代工品。",
        descZh: "硅谷极客打造的趣味检测工具：快速诊断并评估某个 AI 产品是真正解决痛点还是粗制滥造的噱头代工品。",
        rawDesc: "Is your product AI slop? Funny detector for AI startups.",
        url: "https://slopcalculator.com",
        category: "daily",
        badge: "Show HN",
        sourceType: "Hacker News",
        highlights: ["💡 Show HN", "🔍 趣味检测", "🚀 创客视角"],
        pubDate: "今日热议",
        isDaily: true
      },
      {
        id: "daily-passory",
        name: "票册 Passory",
        titleZh: "纸质票据数字相册",
        desc: "将飞行登机牌、高铁车票、电影票和门票快速归档收纳成一本精美的时间线数字相册，记录每段旅行的美好回忆。",
        descZh: "将飞行登机牌、高铁车票、电影票和门票快速归档收纳成一本精美的时间线数字相册，记录每段旅行的美好回忆。",
        rawDesc: "Turn paper boarding passes and tickets into memory albums.",
        url: "https://www.v2ex.com/t/1255402",
        category: "daily",
        badge: "V2EX 创想",
        sourceType: "V2EX",
        highlights: ["🇨🇳 独立创造", "✈️ 旅行回忆", "🍎 极简体验"],
        pubDate: "今日创想",
        isDaily: true
      }
    ];
    return this.interleaveAndDiversifyDaily(list, "all");
  }

  // 兜底奇趣探索动态工具
  getFallbackFunTools() {
    return [
      {
        id: "fun-weavesilk",
        name: "Weave Silk",
        titleZh: "流体对称生成艺术",
        desc: "极度解压的交互式生成艺术画板：光标随意轻划，即刻在深邃夜空中绽放出璀璨对称的星云丝绸。",
        url: "http://weavesilk.com",
        category: "fun",
        badge: "视觉治愈",
        sourceType: "奇趣探索",
        highlights: ["🌌 星云流体", "🎨 对称艺术", "💆 极致解压"],
        pubDate: "探索精选"
      },
      {
        id: "fun-quickdraw",
        name: "Quick, Draw!",
        titleZh: "Google 神经网络猜画",
        desc: "在 20 秒内画出一幅简笔画，全球规模最大的涂鸦神经网络会实时大声猜出你画的是什么。",
        url: "https://quickdraw.withgoogle.com",
        category: "fun",
        badge: "谷歌AI",
        sourceType: "奇趣探索",
        highlights: ["🤖 神经涂鸦", "🎮 益智猜画", "✨ 顶尖创意"],
        pubDate: "探索精选"
      },
      {
        id: "fun-patatap",
        name: "Patatap",
        titleZh: "键盘全频音效打击乐",
        desc: "键盘上的 26 个英文字母对应着不同的彩色空间几何动效和节奏打击乐音色，随心弹奏视听交响乐。",
        url: "https://patatap.com",
        category: "fun",
        badge: "声光律动",
        sourceType: "奇趣探索",
        highlights: ["🎹 键盘弹奏", "🔊 视听同步", "💥 灵感爆发"],
        pubDate: "探索精选"
      },
      {
        id: "fun-earth2050",
        name: "Earth 2050",
        titleZh: "2050 未来科技全景预测",
        desc: "卡巴斯基联合全球未来学家打造的 2050 年交互式地球预测展，全景 360 度探索未来科技生活。",
        url: "https://2050.earth",
        category: "fun",
        badge: "未来科幻",
        sourceType: "奇趣探索",
        highlights: ["🚀 2050年", "🌍 3D全景", "🔮 科技预言"],
        pubDate: "探索精选"
      }
    ];
  }

  getAllTools() {
    return CURATED_TOOLS;
  }
}

// 导出全局单例与内置资讯源定义
window.BUILTIN_NEWS_SOURCES = BUILTIN_NEWS_SOURCES;
window.dailyToolsSyncEngine = new DailyToolsSyncEngine();
