/**
 * Liquid Tab - AI 大模型接口服务引擎
 * 支持 OpenAI、DeepSeek、阿里通义千问、月之暗面 Kimi、硅基流动、Ollama 等任意兼容规范
 * 负责自动批量扫描每日新发现产品并生成专业、地道、深度的中文定位与功能应用场景概要
 */

const AI_PRESETS = {
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    docUrl: "https://platform.deepseek.com"
  },
  oneapi: {
    name: "OneAPI / NewAPI 聚合平台",
    baseUrl: "https://your-api-gateway.com/v1",
    model: "deepseek-ai/DeepSeek-V3",
    docUrl: "",
    isAggregator: true
  },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "deepseek/deepseek-chat",
    docUrl: "https://openrouter.ai",
    isAggregator: true
  },
  siliconflow: {
    name: "硅基流动 SiliconFlow",
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V3",
    docUrl: "https://cloud.siliconflow.cn",
    isAggregator: true
  },
  qwen: {
    name: "通义千问 DashScope",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
    docUrl: "https://dashscope.console.aliyun.com"
  },
  moonshot: {
    name: "Kimi (Moonshot)",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
    docUrl: "https://platform.moonshot.cn"
  },
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    docUrl: "https://platform.openai.com"
  },
  ollama: {
    name: "Ollama (本地部署)",
    baseUrl: "http://localhost:11434/v1",
    model: "qwen2.5:7b",
    docUrl: "https://ollama.com"
  },
  custom: {
    name: "自定义 OpenAI 兼容接口",
    baseUrl: "",
    model: "",
    docUrl: ""
  }
};

class AiModelService {
  constructor() {
    this.storageKey = "liquid_ai_config_v1";
    this.overviewStorageKey = "liquid_ai_daily_overview_v1";
    this.config = {
      enabled: false,
      provider: "deepseek",
      baseUrl: "https://api.deepseek.com/v1",
      apiKey: "",
      model: "deepseek-chat"
    };
    this.overviews = {}; // 按 `${date}_${mode}` 存储每日 AI 总览缓存
    this.isScanning = false;
    this.activeScanPromise = null;
    this.scanListeners = new Set();
    this.scanProgress = { completed: 0, total: 0, succeeded: 0, failed: 0, lastError: "" };
    this.isGeneratingOverview = false;
  }

  subscribeScanProgress(listener) {
    if (typeof listener !== "function") return () => {};
    this.scanListeners.add(listener);
    return () => this.scanListeners.delete(listener);
  }

  getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  async init() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get([this.storageKey, this.overviewStorageKey]);
        if (data && data[this.storageKey]) {
          this.config = { ...this.config, ...data[this.storageKey] };
        }
        if (data && data[this.overviewStorageKey]) {
          this.overviews = data[this.overviewStorageKey] || {};
        }
      } else {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.config = { ...this.config, ...JSON.parse(saved) };
        }
        const savedOv = localStorage.getItem(this.overviewStorageKey);
        if (savedOv) {
          this.overviews = JSON.parse(savedOv) || {};
        }
      }
    } catch (e) {
      console.warn("读取 AI 配置异常:", e);
    }
    return this.config;
  }

  getCachedOverview(mode = "all") {
    const key = `${this.getTodayString()}_${mode}`;
    return this.overviews[key] || null;
  }

  async saveOverview(mode = "all", overviewData) {
    const today = this.getTodayString();
    const key = `${today}_${mode}`;
    // 仅保留当天的缓存，避免无限膨胀
    const nextMap = {};
    Object.keys(this.overviews || {}).forEach(k => {
      if (k.startsWith(today + "_")) {
        nextMap[k] = this.overviews[k];
      }
    });
    nextMap[key] = overviewData;
    this.overviews = nextMap;

    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.overviewStorageKey]: this.overviews });
      } else {
        localStorage.setItem(this.overviewStorageKey, JSON.stringify(this.overviews));
      }
    } catch (e) {
      console.warn("保存 AI 今日总览缓存失败:", e);
    }
    return overviewData;
  }

  async saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.storageKey]: this.config });
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      }
    } catch (e) {
      console.error("保存 AI 配置失败:", e);
    }
    return this.config;
  }

  isEnabled() {
    return !!(this.config.enabled && (this.config.apiKey || this.config.provider === "ollama"));
  }

  getModelName() {
    return this.config.model || "AI 深度解析";
  }

  // 智能规范化 API 端点（彻底解决聚合平台复制完整端点、缺少/v1、结尾多斜杠等各种兼容性问题）
  normalizeEndpoint(rawUrl, path = "/chat/completions") {
    let url = (rawUrl || "https://api.deepseek.com/v1").trim().replace(/\/+$/, "");

    // 如果用户直接粘贴了完整端点 /chat/completions
    if (url.endsWith("/chat/completions")) {
      if (path === "/models") {
        return url.replace(/\/chat\/completions$/, "/models");
      }
      return url;
    }

    // 如果用户粘贴了 /models
    if (url.endsWith("/models")) {
      if (path === "/chat/completions") {
        return url.replace(/\/models$/, "/chat/completions");
      }
      return url;
    }

    // 针对聚合平台：如果用户只输入了域名或根路径，而常见 OpenAI 兼容规范都在 /v1 下
    // 若 URL 末尾既不是 /v1 且没有版本号路径，自动智能补充 /v1
    if (!/\/v\d+(\/|$)/i.test(url)) {
      url = `${url}/v1`;
    }

    return `${url}${path}`;
  }

  // 从聚合平台或标准 OpenAI 接口拉取可用模型列表 (GET /models)
  async fetchModelList(testCfg = null) {
    const cfg = testCfg || this.config;
    if (!cfg.apiKey && cfg.provider !== "ollama") {
      throw new Error("请先填写有效的 API Key 密钥");
    }

    const endpoint = this.normalizeEndpoint(cfg.baseUrl, "/models");
    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://liquid-tab.internal",
      "X-Title": "Liquid Tab"
    };
    if (cfg.apiKey) {
      headers["Authorization"] = `Bearer ${cfg.apiKey.trim()}`;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);

    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers,
        signal: ctrl.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        let errBody = "";
        try { errBody = await res.text(); } catch (e) {}
        throw new Error(`获取模型列表失败 (HTTP ${res.status}): ${errBody.slice(0, 120) || "网关未响应"}`);
      }

      const json = await res.json();
      const rawList = Array.isArray(json?.data) ? json.data : (Array.isArray(json?.models) ? json.models : []);
      
      const modelIds = rawList
        .map(m => typeof m === "string" ? m : m?.id)
        .filter(id => !!id && typeof id === "string")
        .sort((a, b) => a.localeCompare(b));

      return modelIds;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error("拉取模型列表超时，聚合平台可能未开启 /models 开放接口");
      }
      throw err;
    }
  }

  // 测试 API 联通性并测算响应延迟
  async testConnection(testCfg = null) {
    const cfg = testCfg || this.config;
    if (!cfg.apiKey && cfg.provider !== "ollama") {
      throw new Error("请先填写有效的 API Key");
    }

    const endpoint = this.normalizeEndpoint(cfg.baseUrl, "/chat/completions");

    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://liquid-tab.internal",
      "X-Title": "Liquid Tab"
    };
    if (cfg.apiKey) {
      headers["Authorization"] = `Bearer ${cfg.apiKey.trim()}`;
    }

    const startTime = performance.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: cfg.model || "deepseek-chat",
          messages: [
            { role: "system", content: "You are an assistant. Reply concisely." },
            { role: "user", content: "请回复四个字：连接成功" }
          ],
          temperature: 0.1,
          max_tokens: 30
        }),
        signal: ctrl.signal
      });
      clearTimeout(timer);

      const latency = Math.round(performance.now() - startTime);

      if (!res.ok) {
        let errBody = "";
        try { errBody = await res.text(); } catch (e) {}
        throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 160) || "服务响应异常"}`);
      }

      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content?.trim() || "";

      return {
        success: true,
        latency,
        reply: reply || "连接成功"
      };
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error("请求超时（超过 12 秒），请检查网络或 Base URL 是否可访问");
      }
      throw err;
    }
  }

  // 解析模型返回的 JSON，自动修复可能存在的包裹符号或换行符
  parseAiJson(text) {
    if (!text) return null;
    let cleaned = text.trim();
    // 剔除可能的 markdown 代码块标记
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        try {
          const repaired = match[0].replace(/[\r\n]+/g, " ");
          return JSON.parse(repaired);
        } catch (e2) {}
      }
    }
    return null;
  }

  // 统一构建 Chat Completions 请求头
  buildChatHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://liquid-tab.internal",
      "X-Title": "Liquid Tab"
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey.trim()}`;
    }
    return headers;
  }

  // 识别各模型服务商的内容合规风控拦截（例如 DeepSeek 的 HTTP 400 "Content Exists Risk"）
  isContentRiskError(status, errBody = "") {
    if (status !== 400 && status !== 422 && status !== 451) return false;
    return /content exists risk|content_filter|data_inspection_failed|inappropriate content|safety|moderation|sensitive/i.test(errBody);
  }

  // 统一 Chat Completions 调用封装，标准化超时与内容风控识别
  async callChatCompletion(messages, { temperature = 0.5, maxTokens = 500, timeoutMs = 20000 } = {}) {
    const endpoint = this.normalizeEndpoint(this.config.baseUrl, "/chat/completions");
    const headers = this.buildChatHeaders();

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: this.config.model || "deepseek-chat",
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: ctrl.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        let errBody = "";
        try { errBody = await res.text(); } catch (e) {}
        const isRisk = this.isContentRiskError(res.status, errBody);
        const err = new Error(
          isRisk
            ? "内容触发大模型合规审核 (Content Exists Risk)"
            : `API 错误 (HTTP ${res.status}): ${errBody.slice(0, 140)}`
        );
        err.status = res.status;
        err.isContentRisk = isRisk;
        throw err;
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("大模型未返回有效内容");
      }
      return content;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // 核心方法：使用配置的大模型对单个工具或资讯进行深度扫描与中文提炼（遇风控自动降级重试）
  async generateToolSummary(tool) {
    if (!this.isEnabled()) {
      throw new Error("未启用或未配置 AI 模型 API");
    }

    const isArticle = !!(tool.isNews || tool.itemType === "news");
    const systemPrompt = isArticle
      ? `你是中文资讯编辑。请根据提供的文章信息输出简洁、客观的中文导读。
请严格输出合法 JSON（不要包含代码块或额外文字）：
{
  "titleZh": "4~9字中文核心议题标签",
  "summary": "2~3句精炼客观的中文提要，概括核心观点与信息价值",
  "highlights": ["最多3个简短中文关键词，不含Emoji"]
}`
      : `你是软件与开源产品分析编辑。请根据提供的项目信息生成简洁、准确的中文解析。
请严格输出合法 JSON（不要包含代码块或额外文字）：
{
  "titleZh": "4~9字中文定位副标题",
  "summary": "2~3句精炼的中文功能与场景说明，点明解决的痛点与适用人群",
  "highlights": ["最多3个简短中文特性标签，不含Emoji"]
}`;

    const rawDescTrimmed = (tool.rawDesc || tool.desc || "").slice(0, 320);
    const readmeTrimmed = (tool.readmeSnippet || "").slice(0, 320);
    const extraContext = [
      tool.sourceName || tool.sourceType ? `来源: ${tool.sourceName || tool.sourceType}` : "",
      tool.latestRelease ? `版本: ${tool.latestRelease}` : "",
      readmeTrimmed ? `README 摘录: ${readmeTrimmed}` : ""
    ].filter(Boolean).join("\n");

    const fullUserPrompt = `名称: ${tool.name}\n简介: ${rawDescTrimmed}${extraContext ? "\n" + extraContext : ""}`;

    let content = "";
    try {
      content = await this.callChatCompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullUserPrompt }
        ],
        { temperature: 0.45, maxTokens: 450, timeoutMs: 20000 }
      );
    } catch (err) {
      // 若完整正文/README 触发服务商内容审核（例如安全工具红队术语或外媒敏感词），降级为仅标题+来源重试一次
      if (err.isContentRisk) {
        const safeTitle = (tool.name || "").replace(/\b(red-?team|attack|exploit|weapon|hack|intelligence|spy)\b/gi, "security").slice(0, 100);
        const minimalPrompt = `请仅根据以下客观标题与分类生成中立的中文简介。\n标题: ${safeTitle}\n分类: ${tool.badge || tool.sourceType || "综合"}`;
        content = await this.callChatCompletion(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: minimalPrompt }
          ],
          { temperature: 0.35, maxTokens: 320, timeoutMs: 18000 }
        );
      } else {
        console.warn(`[AI Service] 提炼「${tool.name}」失败:`, err);
        throw err;
      }
    }

    const parsed = this.parseAiJson(content);
    if (parsed && parsed.summary) {
      return {
        titleZh: parsed.titleZh || "",
        summary: parsed.summary,
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 3) : []
      };
    }

    return {
      titleZh: "",
      summary: content.replace(/```[a-z]*\s*/gi, "").replace(/```/g, "").slice(0, 220).trim(),
      highlights: []
    };
  }

  // 批量并发扫描工具与资讯列表（支持进度回调、增量落盘、复用进行中任务及区分风控拦截与接口报错）
  async batchScanDailyTools(tools, optionsOrCallback = null) {
    if (!this.isEnabled()) {
      return { total: 0, completed: 0, succeeded: 0, failed: 0, riskSkipped: 0, lastError: "未启用 AI 模型 API", skipped: true };
    }
    if (!tools || !tools.length) {
      return { total: 0, completed: 0, succeeded: 0, failed: 0, riskSkipped: 0, lastError: "", empty: true };
    }

    const opts = typeof optionsOrCallback === "function"
      ? { onProgress: optionsOrCallback }
      : (optionsOrCallback || {});
    const onProgress = typeof opts.onProgress === "function" ? opts.onProgress : null;
    const onBatchComplete = typeof opts.onBatchComplete === "function" ? opts.onBatchComplete : null;
    const forceRescan = !!opts.forceRescan;

    // 若后台自动提炼已在运行中，挂载进度监听并等待其完成
    if (this.isScanning && this.activeScanPromise) {
      const unsub = onProgress ? this.subscribeScanProgress((p) => onProgress(p.completed, p.total, p)) : () => {};
      try {
        if (onProgress && this.scanProgress.total > 0) {
          onProgress(this.scanProgress.completed, this.scanProgress.total, this.scanProgress);
        }
        const runningRes = await this.activeScanPromise;
        return { ...runningRes, attachedToRunning: true };
      } finally {
        unsub();
      }
    }

    const dailyCandidates = tools.filter(t => t.category === "daily" || t.isDaily);
    const targetTools = forceRescan
      ? dailyCandidates
      : dailyCandidates.filter(t => !t.aiGenerated && !t.aiRiskSkipped);

    if (!targetTools.length) {
      return { total: 0, completed: 0, succeeded: 0, failed: 0, riskSkipped: 0, lastError: "", allAlreadyScanned: true };
    }

    this.isScanning = true;
    const stats = {
      total: targetTools.length,
      completed: 0,
      succeeded: 0,
      failed: 0,
      riskSkipped: 0,
      lastError: ""
    };
    this.scanProgress = { ...stats };

    const notifyProgress = (tool) => {
      this.scanProgress = { ...stats };
      if (onProgress) {
        try { onProgress(stats.completed, stats.total, tool, stats); } catch (e) {}
      }
      this.scanListeners.forEach(fn => {
        try { fn(this.scanProgress, tool); } catch (e) {}
      });
    };

    const runScan = async () => {
      try {
        const concurrency = 4;
        for (let i = 0; i < targetTools.length; i += concurrency) {
          const batch = targetTools.slice(i, i + concurrency);
          let batchSucceeded = 0;
          await Promise.allSettled(
            batch.map(async (tool) => {
              try {
                const aiResult = await this.generateToolSummary(tool);
                if (aiResult && aiResult.summary) {
                  tool.descZh = aiResult.summary;
                  tool.desc = aiResult.summary;
                  if (aiResult.titleZh) tool.titleZh = aiResult.titleZh;
                  if (aiResult.highlights && aiResult.highlights.length) tool.highlights = aiResult.highlights;
                  tool.aiGenerated = true;
                  tool.aiRiskSkipped = false;
                  tool.aiModel = this.config.model || "AI";
                  stats.succeeded++;
                  batchSucceeded++;
                } else {
                  stats.failed++;
                  stats.lastError = "模型返回空摘要";
                }
              } catch (e) {
                if (e && e.isContentRisk) {
                  // 内容审核拦截不计作接口故障，标记跳过并保留原文
                  tool.aiRiskSkipped = true;
                  stats.riskSkipped++;
                  console.info(`[AI Service] 单条「${tool.name}」触发内容风控，保留原文`);
                } else {
                  stats.failed++;
                  stats.lastError = e.message || "请求失败";
                  console.warn(`[AI Service] 单条「${tool.name}」扫描跳过:`, e.message);
                }
              } finally {
                stats.completed++;
                notifyProgress(tool);
              }
            })
          );

          if (batchSucceeded > 0 && onBatchComplete) {
            try { await onBatchComplete({ ...stats }); } catch (e) {}
          }
        }
      } finally {
        this.isScanning = false;
        this.activeScanPromise = null;
      }
      return { ...stats };
    };

    this.activeScanPromise = runScan();
    return await this.activeScanPromise;
  }

  // 按来源轮转采样多源内容，确保总览提示词覆盖全部订阅领域
  sampleBalancedItemsForOverview(items, maxTotal = 24) {
    if (!Array.isArray(items) || !items.length) return [];
    const buckets = new Map();
    items.forEach(it => {
      if (it && it.aiRiskSkipped) return;
      const key = it.sourceType || it.sourceName || "其他";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(it);
    });

    const sampled = [];
    let added = true;
    while (added && sampled.length < maxTotal) {
      added = false;
      for (const [, list] of buckets) {
        if (list.length > 0 && sampled.length < maxTotal) {
          sampled.push(list.shift());
          added = true;
        }
      }
    }
    return sampled;
  }

  // 过滤易触发国内大模型合规审核的高风险新闻/攻防词条（仅在总览遇到 Content Exists Risk 时启用）
  filterModerationSafeItems(items) {
    const riskySources = new Set(["BBC 中文", "FT中文网"]);
    const riskyKeywords = /(情报|间谍|政变|选举|抗议|制裁|军事|战争|冲突|袭|暴乱|红队|漏洞利用|attack|exploit|red-?team|weapon|spy|sanction|protest)/i;
    return items.filter(it => {
      if (!it || it.aiRiskSkipped) return false;
      if (riskySources.has(it.sourceType)) return false;
      const text = `${it.name || ""} ${it.descZh || it.desc || ""}`;
      return !riskyKeywords.test(text);
    });
  }

  // 核心方法：对当前多源聚合内容生成「AI 跨界今日总览」（内置 Content Exists Risk 自动隔离降级重试）
  async generateDailyOverview(items, mode = "all") {
    if (!this.isEnabled()) {
      throw new Error("未启用或未配置 AI 模型 API");
    }
    if (!items || !items.length) {
      throw new Error("当前列表暂无可供概括的内容");
    }
    if (this.isGeneratingOverview) {
      return this.getCachedOverview(mode);
    }

    this.isGeneratingOverview = true;
    const modeLabel = mode === "news" ? "跨界资讯" : (mode === "tools" ? "创新工具" : "综合动态");

    const systemPrompt = `你是资深中文跨学科主编，擅长将多源订阅浓缩为客观、克制的今日简报。
请对提供的今日「${modeLabel}」条目进行全局提炼，严格输出合法 JSON（不要包含代码块或多余文字）：
{
  "headline": "今日风向一句总括（16~26字）",
  "overview": "2~3句全局综合导读，点明今日多领域交汇的核心趋势或看点",
  "sectors": [
    { "domain": "领域归类（如 人文与社会 / 全球与财经 / 自然与美学 / 科技与工具）", "digest": "20~38字概括该维度今日动态", "items": [1, 3] }
  ],
  "topPick": "今日值得精读的 1 篇推荐与理由（30~55字）",
  "topPickItem": 1
}
要求：sectors 输出 3~4 个板块，每个板块的 items 为对应条目的 1-based 编号数组（2~4个），topPickItem 为精读推荐对应的编号；禁止使用 Emoji，禁止虚构未提供的内容。`;

    const runOverviewBatch = async (subset, titlesOnly = false) => {
      const sourceNames = Array.from(new Set(subset.map(it => it.sourceType || it.sourceName).filter(Boolean)));
      const digestInput = subset.map((it, i) => {
        const src = it.sourceType || it.sourceName || "综合";
        if (titlesOnly) {
          return `${i + 1}. (${src}) ${(it.name || "").slice(0, 60)}`;
        }
        const summary = (it.descZh || it.desc || "").slice(0, 70);
        return `${i + 1}. (${src}) ${it.name} — ${summary}`;
      }).join("\n");

      const userPrompt = `覆盖来源 (${sourceNames.length} 个): ${sourceNames.join("、")}\n\n条目清单:\n${digestInput}`;
      const content = await this.callChatCompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        { temperature: 0.4, maxTokens: 900, timeoutMs: 30000 }
      );
      return { content, sourceNames, subset };
    };

    try {
      const sampled = this.sampleBalancedItemsForOverview(items, 24);
      let result = null;
      let riskFiltered = false;

      try {
        result = await runOverviewBatch(sampled, false);
      } catch (err) {
        if (!err.isContentRisk) throw err;
        // 策略 1：剔除易触发审核的外媒政经/安全攻防条目并以标题摘要重试
        riskFiltered = true;
        const safeItems = this.filterModerationSafeItems(sampled);
        const retryList = safeItems.length >= 4 ? safeItems : sampled.slice(0, 12);
        try {
          result = await runOverviewBatch(retryList, true);
        } catch (err2) {
          if (!err2.isContentRisk) throw err2;
          // 策略 2：二分安全池，确保单条敏感词不会导致整份总览失败
          const mid = Math.max(1, Math.floor(retryList.length / 2));
          try {
            result = await runOverviewBatch(retryList.slice(0, mid), true);
          } catch (err3) {
            if (!err3.isContentRisk) throw err3;
            result = await runOverviewBatch(retryList.slice(mid), true);
          }
        }
      }

      const parsed = this.parseAiJson(result.content);
      const usedSubset = result.subset || sampled;
      const mapIndicesToUrls = (indices) => {
        if (!Array.isArray(indices)) return [];
        return indices
          .map(n => usedSubset[Number(n) - 1])
          .filter(it => it && it.url)
          .map(it => it.url);
      };
      const normalizedSectors = (parsed && Array.isArray(parsed.sectors))
        ? parsed.sectors.slice(0, 4).map(sec => ({
            domain: sec.domain || "领域动态",
            digest: sec.digest || "",
            urls: mapIndicesToUrls(sec.items)
          }))
        : [];
      const topPickTarget = parsed && Number.isInteger(Number(parsed.topPickItem))
        ? usedSubset[Number(parsed.topPickItem) - 1]
        : null;

      const overviewObj = {
        date: this.getTodayString(),
        mode,
        model: this.config.model || "AI",
        generatedAt: Date.now(),
        sourceCount: result.sourceNames.length,
        itemCount: items.length,
        riskFiltered,
        headline: (parsed && parsed.headline) ? parsed.headline : `今日${modeLabel}总览`,
        overview: (parsed && parsed.overview) ? parsed.overview : result.content.replace(/```[a-z]*\s*/gi, "").replace(/```/g, "").slice(0, 260).trim(),
        sectors: normalizedSectors,
        topPick: (parsed && parsed.topPick) ? parsed.topPick : "",
        topPickUrl: topPickTarget && topPickTarget.url ? topPickTarget.url : ""
      };

      await this.saveOverview(mode, overviewObj);
      return overviewObj;
    } catch (err) {
      console.warn("[AI Service] 生成今日总览失败:", err);
      throw err;
    } finally {
      this.isGeneratingOverview = false;
    }
  }
}

// 导出全局单例与预设常量
window.AI_PRESETS = AI_PRESETS;
window.aiService = new AiModelService();
