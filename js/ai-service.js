/**
 * Liquid Tab - AI 大模型接口服务引擎
 * 支持 OpenAI、DeepSeek、阿里通义千问、月之暗面 Kimi、硅基流动、Ollama 等任意兼容规范
 * 负责自动批量扫描每日新发现产品并生成专业、地道、深度的中文定位与功能应用场景概要
 */

const AI_PRESETS = {
  deepseek: {
    name: "DeepSeek (深度求索 - 强烈推荐，极高性价比)",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    docUrl: "https://platform.deepseek.com"
  },
  oneapi: {
    name: "🌐 聚合平台 (OneAPI / NewAPI / 聚合中转站)",
    baseUrl: "https://your-api-gateway.com/v1",
    model: "deepseek-ai/DeepSeek-V3",
    docUrl: "",
    isAggregator: true
  },
  openrouter: {
    name: "OpenRouter (全球模型聚合市场)",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "deepseek/deepseek-chat",
    docUrl: "https://openrouter.ai",
    isAggregator: true
  },
  siliconflow: {
    name: "硅基流动 (SiliconFlow - 极速开源聚合平台)",
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V3",
    docUrl: "https://cloud.siliconflow.cn",
    isAggregator: true
  },
  qwen: {
    name: "阿里通义千问 (DashScope)",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
    docUrl: "https://dashscope.console.aliyun.com"
  },
  moonshot: {
    name: "月之暗面 Kimi (Moonshot AI)",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
    docUrl: "https://platform.moonshot.cn"
  },
  openai: {
    name: "OpenAI (ChatGPT 官方)",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    docUrl: "https://platform.openai.com"
  },
  ollama: {
    name: "Ollama (本地私有部署，免联网免密钥)",
    baseUrl: "http://localhost:11434/v1",
    model: "qwen2.5:7b",
    docUrl: "https://ollama.com"
  },
  custom: {
    name: "自定义兼容 API (支持第三方中转与私有模型)",
    baseUrl: "",
    model: "",
    docUrl: ""
  }
};

class AiModelService {
  constructor() {
    this.storageKey = "liquid_ai_config_v1";
    this.config = {
      enabled: false,
      provider: "deepseek",
      baseUrl: "https://api.deepseek.com/v1",
      apiKey: "",
      model: "deepseek-chat"
    };
    this.isScanning = false;
  }

  async init() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(this.storageKey);
        if (data && data[this.storageKey]) {
          this.config = { ...this.config, ...data[this.storageKey] };
        }
      } else {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.config = { ...this.config, ...JSON.parse(saved) };
        }
      }
    } catch (e) {
      console.warn("读取 AI 配置异常:", e);
    }
    return this.config;
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

  // 核心方法：使用配置的大模型对单个工具进行深度扫描与中文提炼
  async generateToolSummary(tool) {
    if (!this.isEnabled()) {
      throw new Error("未启用或未配置 AI 模型 API");
    }

    const endpoint = this.normalizeEndpoint(this.config.baseUrl, "/chat/completions");

    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://liquid-tab.internal",
      "X-Title": "Liquid Tab"
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey.trim()}`;
    }

    const systemPrompt = `你是一位顶尖的科技产品分析专家与资深中文科技科技专栏主编。
请根据用户提供的科技新工具信息（英文名称、原始介绍及官网链接），为中国用户生成专业、地道、极具吸引力的中文产品解析。

请严格输出合法的 JSON 格式，绝不要添加任何额外的代码块标记、思考过程或多余文字，结构如下：
{
  "titleZh": "中文定位副标题（6~10字以内，如：AI 创客增长副驾、实时对话转结构化引擎）",
  "summary": "2~3句精炼地道的中文功能与核心应用场景详解（说明解决什么痛点、核心功能亮点、适合什么用户群体，文笔通畅自然）",
  "highlights": ["3个核心亮点短标签数组，包含对应Emoji，如：🤖 AI 智能副驾, 🚀 商业出海, ⚡ MCP 自动化"]
}`;

    const userPrompt = `产品名称: ${tool.name}\n原始简介: ${tool.rawDesc || tool.desc}\n官网链接: ${tool.url}`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: this.config.model || "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.5,
          max_tokens: 500
        }),
        signal: ctrl.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        let errBody = "";
        try { errBody = await res.text(); } catch (e) {}
        throw new Error(`API 错误 (HTTP ${res.status}): ${errBody.slice(0, 150)}`);
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("大模型未返回有效内容");
      }

      const parsed = this.parseAiJson(content);
      if (parsed && parsed.summary) {
        return {
          titleZh: parsed.titleZh || "",
          summary: parsed.summary,
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 3) : []
        };
      }

      // 如果未能直接解析为 JSON，做语义后处理兜底
      return {
        titleZh: "",
        summary: content.replace(/```[a-z]*\s*/gi, "").replace(/```/g, "").slice(0, 220).trim(),
        highlights: ["✨ AI 智能解析", "🚀 今日发现", "💻 实用工具"]
      };
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[AI Service] 提炼「${tool.name}」失败:`, err);
      throw err;
    }
  }

  // 批量并发扫描工具列表
  async batchScanDailyTools(tools, onProgress = null) {
    if (!this.isEnabled() || !tools || !tools.length) return tools;
    if (this.isScanning) return tools;
    this.isScanning = true;

    try {
      const targetTools = tools.filter(t => t.category === "daily" || t.isDaily);
      const total = targetTools.length;
      let completed = 0;

      // 每次并发 2 个，兼顾速度与 API 频率限制
      const concurrency = 2;
      for (let i = 0; i < targetTools.length; i += concurrency) {
        const batch = targetTools.slice(i, i + concurrency);
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
                tool.aiModel = this.config.model || "AI";
              }
            } catch (e) {
              console.warn(`[AI Service] 单条「${tool.name}」扫描跳过:`, e.message);
            } finally {
              completed++;
              if (onProgress) onProgress(completed, total, tool);
            }
          })
        );
      }
    } finally {
      this.isScanning = false;
    }

    return tools;
  }
}

// 导出全局单例与预设常量
window.AI_PRESETS = AI_PRESETS;
window.aiService = new AiModelService();
