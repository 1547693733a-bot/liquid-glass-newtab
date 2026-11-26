/**
 * Liquid Tab - 主应用控制中心
 * 负责搜索引擎切换、视图调度、精选工具库交互、书签栏集成、模态窗控制与全局快捷键
 */

// 主流搜索引擎配置表
const SEARCH_ENGINES = [
  {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search?q=",
    icon: "https://www.google.com/favicon.ico",
    placeholder: "Google 搜索，探索世界...",
    hotkey: "1"
  },
  {
    id: "baidu",
    name: "百度",
    url: "https://www.baidu.com/s?wd=",
    icon: "https://www.baidu.com/favicon.ico",
    placeholder: "百度一下，你就知道...",
    hotkey: "2"
  },
  {
    id: "bing",
    name: "Bing 必应",
    url: "https://www.bing.com/search?q=",
    icon: "https://www.bing.com/favicon.ico",
    placeholder: "微软必应，发现精彩...",
    hotkey: "3"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://chat.deepseek.com/?q=",
    icon: "https://chat.deepseek.com/favicon.ico",
    placeholder: "用 DeepSeek 探索推理与解答...",
    hotkey: "4"
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/search?q=",
    icon: "https://github.githubassets.com/favicons/favicon.png",
    placeholder: "搜索开源项目、代码仓库与开发者...",
    hotkey: "5"
  },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    url: "https://search.bilibili.com/all?keyword=",
    icon: "https://www.bilibili.com/favicon.ico",
    placeholder: "搜索 B 站海量视频、知识与 UP 主...",
    hotkey: "6"
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    icon: "https://duckduckgo.com/favicon.ico",
    placeholder: "隐私优先搜索...",
    hotkey: "7"
  }
];

class AppController {
  constructor() {
    this.currentEngineId = "google";
    this.currentView = "home"; // 'home' | 'tools'
    this.selectedToolCategory = "all";
    this.homeSelectedSource = "all"; // 首页今日新发现选中的来源网站
    this.editingShortcutId = null;
    this.modalActiveTab = "manual"; // 'manual' | 'bookmarks'
  }

  async init() {
    if (window.archiveManager) {
      await window.archiveManager.init();
    }
    await this.loadEnginePref();
    this.initSearch();
    this.initViewTabs();
    this.initHomeWideSection();
    this.initToolsLibrary();
    this.initArchiveVault();
    this.initModals();
    this.initBookmarksIntegration();
    this.initHomeActions();
    this.initSettings();
    this.initGlobalKeys();

    // 监听每日工具更新事件，实时无感刷新主页宽卡片与精选工具列表
    window.addEventListener("dailyToolsUpdated", () => {
      this.renderTools();
      this.renderHomeWideCards();
      this.renderAiDailyOverview(true);
    });

    // 监听奇趣探索更新事件
    window.addEventListener("funToolsUpdated", () => {
      this.renderTools();
    });

    // 渲染首页今日更新宽卡片与 AI 今日总览
    this.renderHomeWideCards();
    this.renderAiDailyOverview(true);

    // 默认聚焦搜索框
    setTimeout(() => {
      const input = document.getElementById("searchInput");
      if (input) input.focus();
    }, 200);
  }

  // 初始化首页今日新发现宽卡片、多维破茧模式切换与主题筛选器
  initHomeWideSection() {
    this.homeDailyMode = "all"; // "all" | "news" | "tools"
    this.homeSelectedSource = "all";
    this.autoOverviewTriggered = new Set();

    // 绑定顶部模式切换分段按钮 (🌟 综合动态 / 📰 破茧资讯 / 🛠️ 创新工具)
    const mainTabsContainer = document.getElementById("homeDailyMainTabs");
    if (mainTabsContainer) {
      mainTabsContainer.querySelectorAll(".main-tab-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          mainTabsContainer.querySelectorAll(".main-tab-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          this.homeDailyMode = pill.dataset.mode || "all";
          this.homeSelectedSource = "all";
          this.renderHomeSubchannelPills();
          this.renderHomeWideCards();
          this.renderAiDailyOverview(false);
        });
      });
    }

    // 初始化渲染子来源 Pills
    this.renderHomeSubchannelPills();

    // 绑定「订阅源管理」按钮，直达设置页破茧订阅专区
    const manageNewsBtn = document.getElementById("homeManageNewsBtn");
    if (manageNewsBtn) {
      manageNewsBtn.addEventListener("click", () => {
        const settingsBtn = document.getElementById("settingsBtn");
        if (settingsBtn) settingsBtn.click();
        setTimeout(() => {
          const newsSec = document.getElementById("settingSectionNews");
          if (newsSec) newsSec.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      });
    }

    // 绑定首页同步抓取按钮
    const homeSyncBtn = document.getElementById("homeSyncDailyBtn");
    const homeSyncText = document.getElementById("homeSyncDailyText");
    if (homeSyncBtn) {
      homeSyncBtn.addEventListener("click", async () => {
        homeSyncBtn.classList.add("syncing");
        if (homeSyncText) homeSyncText.textContent = "抓取中...";
        try {
          const fresh = await window.dailyToolsSyncEngine.syncDailyTools(true);
          this.renderHomeSubchannelPills();
          this.renderHomeWideCards();
          this.renderTools();
          this.showToast(`已从全网各源抓取更新完成！今日聚合共 ${fresh.length} 条新动态`);
          if (homeSyncText) homeSyncText.textContent = `已更新(${fresh.length})`;
        } catch (e) {
          this.showToast("抓取更新失败，使用本地最新缓存");
        } finally {
          homeSyncBtn.classList.remove("syncing");
        }
      });
    }

    // 绑定首页 AI 深度提炼按钮
    const homeAiBtn = document.getElementById("homeAiScanBtn");
    if (homeAiBtn) {
      homeAiBtn.addEventListener("click", () => {
        this.triggerAiBatchScan();
      });
    }

    // 绑定首页「AI 今日总览」与收起/展开控件
    const ovNavBtn = document.getElementById("homeAiOverviewBtn");
    if (ovNavBtn) {
      ovNavBtn.addEventListener("click", () => {
        const card = document.getElementById("aiDailyOverviewCard");
        if (card && card.classList.contains("collapsed")) {
          card.classList.remove("collapsed");
          localStorage.setItem("liquid_ai_overview_collapsed", "0");
          const tBtn = document.getElementById("toggleAiOverviewBtn");
          if (tBtn) tBtn.textContent = "收起";
        }
        this.triggerAiDailyOverview(true);
      });
    }

    const refreshOvBtn = document.getElementById("refreshAiOverviewBtn");
    if (refreshOvBtn) {
      refreshOvBtn.addEventListener("click", () => {
        this.triggerAiDailyOverview(true);
      });
    }

    const toggleOvBtn = document.getElementById("toggleAiOverviewBtn");
    const ovCard = document.getElementById("aiDailyOverviewCard");
    if (ovCard && localStorage.getItem("liquid_ai_overview_collapsed") === "1") {
      ovCard.classList.add("collapsed");
      if (toggleOvBtn) toggleOvBtn.textContent = "展开";
    }
    if (toggleOvBtn && ovCard) {
      toggleOvBtn.addEventListener("click", () => {
        const isCollapsed = ovCard.classList.toggle("collapsed");
        localStorage.setItem("liquid_ai_overview_collapsed", isCollapsed ? "1" : "0");
        toggleOvBtn.textContent = isCollapsed ? "展开" : "收起";
      });
    }
  }

  // 动态渲染首页子来源 Pills (极简光学液态玻璃 + 柔和色点)
  renderHomeSubchannelPills() {
    const pillsContainer = document.getElementById("homeSourcePills");
    if (!pillsContainer) return;

    pillsContainer.innerHTML = "";
    const mode = this.homeDailyMode || "all";

    let pillsData = [];

    if (mode === "all") {
      pillsData = [
        { source: "all", label: "全部", active: this.homeSelectedSource === "all" },
        { source: "news_all", label: "跨界资讯", active: this.homeSelectedSource === "news_all", isNews: true, domainStyle: "tech" },
        { source: "知乎日报", label: "知乎日报", active: this.homeSelectedSource === "知乎日报", isNews: true, domainStyle: "humanities" },
        { source: "Aeon 人文", label: "Aeon 人文", active: this.homeSelectedSource === "Aeon 人文", isNews: true, domainStyle: "humanities" },
        { source: "FT中文网", label: "FT中文网", active: this.homeSelectedSource === "FT中文网", isNews: true, domainStyle: "finance" },
        { source: "BBC 中文", label: "BBC 中文", active: this.homeSelectedSource === "BBC 中文", isNews: true, domainStyle: "world" },
        { source: "自然科学", label: "自然科学", active: this.homeSelectedSource === "自然科学", isNews: true, domainStyle: "science" },
        { source: "艺术美学", label: "艺术美学", active: this.homeSelectedSource === "艺术美学", isNews: true, domainStyle: "art" },
        { source: "Product Hunt", label: "Product Hunt", active: this.homeSelectedSource === "Product Hunt", domainStyle: "tools" },
        { source: "GitHub", label: "GitHub", active: this.homeSelectedSource === "GitHub", domainStyle: "tools" },
        { source: "Solidot", label: "Solidot", active: this.homeSelectedSource === "Solidot", isNews: true, domainStyle: "tech" },
        { source: "少数派", label: "少数派", active: this.homeSelectedSource === "少数派", isNews: true, domainStyle: "tech" }
      ];
    } else if (mode === "news") {
      pillsData = [
        { source: "all", label: "全部资讯", active: this.homeSelectedSource === "all" },
        { source: "知乎日报", label: "知乎日报", active: this.homeSelectedSource === "知乎日报", isNews: true, domainStyle: "humanities" },
        { source: "Aeon 人文", label: "Aeon 人文", active: this.homeSelectedSource === "Aeon 人文", isNews: true, domainStyle: "humanities" },
        { source: "BBC 中文", label: "BBC 中文", active: this.homeSelectedSource === "BBC 中文", isNews: true, domainStyle: "world" },
        { source: "FT中文网", label: "FT中文网", active: this.homeSelectedSource === "FT中文网", isNews: true, domainStyle: "finance" },
        { source: "自然科学", label: "自然科学", active: this.homeSelectedSource === "自然科学", isNews: true, domainStyle: "science" },
        { source: "艺术美学", label: "艺术美学", active: this.homeSelectedSource === "艺术美学", isNews: true, domainStyle: "art" },
        { source: "Solidot", label: "Solidot", active: this.homeSelectedSource === "Solidot", isNews: true, domainStyle: "tech" },
        { source: "阮一峰周刊", label: "阮一峰周刊", active: this.homeSelectedSource === "阮一峰周刊", isNews: true, domainStyle: "tech" },
        { source: "少数派", label: "少数派", active: this.homeSelectedSource === "少数派", isNews: true, domainStyle: "tech" },
        { source: "极客公园", label: "极客公园", active: this.homeSelectedSource === "极客公园", isNews: true, domainStyle: "tech" },
        { source: "Hacker News", label: "Hacker News", active: this.homeSelectedSource === "Hacker News", isNews: true, domainStyle: "tech" },
        { source: "AIHot", label: "AIHot", active: this.homeSelectedSource === "AIHot", isNews: true, domainStyle: "tech" }
      ];

      // 添加已启用的自定义 RSS 订阅源 Pills
      if (window.dailyToolsSyncEngine && window.dailyToolsSyncEngine.newsConfig && Array.isArray(window.dailyToolsSyncEngine.newsConfig.customFeeds)) {
        window.dailyToolsSyncEngine.newsConfig.customFeeds.forEach(feed => {
          if (feed.enabled !== false) {
            pillsData.push({
              source: feed.name,
              label: feed.name,
              active: this.homeSelectedSource === feed.name,
              isNews: true,
              domainStyle: "tech"
            });
          }
        });
      }
    } else if (mode === "tools") {
      pillsData = [
        { source: "all", label: "全部工具", active: this.homeSelectedSource === "all" },
        { source: "Product Hunt", label: "Product Hunt", active: this.homeSelectedSource === "Product Hunt", domainStyle: "tools" },
        { source: "GitHub", label: "GitHub Trending", active: this.homeSelectedSource === "GitHub", domainStyle: "tools" },
        { source: "Hacker News", label: "Show HN", active: this.homeSelectedSource === "Hacker News", domainStyle: "tools" },
        { source: "V2EX", label: "V2EX 创想", active: this.homeSelectedSource === "V2EX", domainStyle: "tools" }
      ];
    }

    pillsData.forEach(p => {
      const btn = document.createElement("button");
      const domainCls = p.domainStyle ? `domain-${p.domainStyle}` : "";
      btn.className = `source-pill ${p.active ? "active" : ""} ${p.isNews ? "source-pill-news" : ""} ${domainCls}`.trim();
      btn.dataset.source = p.source;

      const dotHtml = p.domainStyle ? `<span class="source-pill-dot dot-${p.domainStyle}"></span>` : "";
      btn.innerHTML = `${dotHtml}<span>${p.label}</span>`;

      btn.addEventListener("click", () => {
        pillsContainer.querySelectorAll(".source-pill").forEach(el => el.classList.remove("active"));
        btn.classList.add("active");
        this.homeSelectedSource = p.source;
        this.renderHomeWideCards();
      });

      pillsContainer.appendChild(btn);
    });
  }

  // 渲染首页宽卡片 (支持全网动态 / 破茧资讯 / 创新工具横向双列透光大卡片)
  renderHomeWideCards() {
    const grid = document.getElementById("homeWideGrid");
    const countBadge = document.getElementById("homeDailyCountBadge");
    if (!grid) return;

    const allDaily = window.dailyToolsSyncEngine ? window.dailyToolsSyncEngine.dailyTools : [];
    let list = allDaily;

    const mode = this.homeDailyMode || "all";
    if (mode === "news") {
      list = list.filter(t => t.isNews || t.itemType === "news");
    } else if (mode === "tools") {
      list = list.filter(t => !t.isNews && t.itemType !== "news");
    }

    if (this.homeSelectedSource === "news_all") {
      list = list.filter(t => t.isNews || t.itemType === "news");
    } else if (this.homeSelectedSource && this.homeSelectedSource !== "all") {
      list = list.filter(t => t.sourceType === this.homeSelectedSource || t.sourceId === this.homeSelectedSource);
    }

    // 综合动态与多源推荐机制：未锁定单一特定来源时，自动调用多源轮转穿插引擎，确保前排包罗万象
    if ((!this.homeSelectedSource || this.homeSelectedSource === "all" || this.homeSelectedSource === "news_all") &&
        window.dailyToolsSyncEngine && window.dailyToolsSyncEngine.interleaveAndDiversifyDaily) {
      list = window.dailyToolsSyncEngine.interleaveAndDiversifyDaily(list, mode);
    }

    if (countBadge) {
      if (mode === "news") {
        countBadge.textContent = `${list.length} 篇破茧资讯`;
      } else if (mode === "tools") {
        countBadge.textContent = `${list.length} 款创新工具`;
      } else {
        countBadge.textContent = `${list.length} 条全网动态`;
      }
    }

    if (list.length === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 36px; color: var(--text-tertiary); background: rgba(255,255,255,0.04); border-radius: var(--radius-lg); border: 1px dashed rgba(255,255,255,0.12);";
      emptyBox.textContent = "暂无该分类的最新收录，点击右上角「抓取新源」获取全网更新";
      grid.replaceChildren(emptyBox);
      return;
    }

    const cards = [];
    const fallbackIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-opacity='0.75' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/%3E%3Cpath d='M2 12h20'/%3E%3C/svg%3E";
    const stripLeadingEmoji = (str) => String(str || "").replace(/^[\u{1F1E0}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D⭐★✦✨🔥💡🚀⚡💻🛠️🤖📚🌍📈🧬🎨📖🎙️🔗🕒📱🌱🌐🔭🌈📡\s]+/u, "").trim();
    const sparkleSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3-1.8 5.4a2 2 0 0 1-1.3 1.3L3.5 11.5l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.4a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3L12 3z"/></svg>`;
    const inferDomainStyle = (tool) => {
      if (tool.domainStyle) return tool.domainStyle;
      const src = tool.sourceType || "";
      if (src === "知乎日报" || src === "Aeon 人文") return "humanities";
      if (src === "BBC 中文") return "world";
      if (src === "FT中文网") return "finance";
      if (src === "自然科学") return "science";
      if (src === "艺术美学") return "art";
      return "tech";
    };
    const buildAiStatusHtml = (tool) => {
      if (tool.aiGenerated) {
        return `<span class="card-ai-badge" title="已由 ${tool.aiModel || "AI"} 深度提炼">${sparkleSvg}AI 已提炼</span>`;
      }
      if (tool.aiRiskSkipped) {
        return `<span class="card-ai-raw-tag" title="触发模型合规审核，保留原文">原文</span>`;
      }
      return `<button type="button" class="card-ai-pending-btn" title="点击立即调用 AI 提炼本条">未提炼</button>`;
    };
    const bindInlineAiDistill = (cardEl, tool) => {
      const pendingBtn = cardEl.querySelector(".card-ai-pending-btn");
      if (!pendingBtn) return;
      pendingBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!window.aiService || !window.aiService.isEnabled()) {
          this.openAiSettingsSection();
          return;
        }
        pendingBtn.disabled = true;
        pendingBtn.textContent = "提炼中...";
        try {
          const aiResult = await window.aiService.generateToolSummary(tool);
          if (aiResult && aiResult.summary) {
            tool.descZh = aiResult.summary;
            tool.desc = aiResult.summary;
            if (aiResult.titleZh) tool.titleZh = aiResult.titleZh;
            if (aiResult.highlights && aiResult.highlights.length) tool.highlights = aiResult.highlights;
            tool.aiGenerated = true;
            tool.aiRiskSkipped = false;
            tool.aiModel = window.aiService.getModelName();
            if (window.dailyToolsSyncEngine) await window.dailyToolsSyncEngine.saveToCache();
            this.renderHomeWideCards();
            this.showToast(`已完成「${tool.name.slice(0, 18)}」提炼`);
          }
        } catch (err) {
          if (err && err.isContentRisk) {
            tool.aiRiskSkipped = true;
            if (window.dailyToolsSyncEngine) await window.dailyToolsSyncEngine.saveToCache();
            this.renderHomeWideCards();
            this.showToast("该条目触发模型内容审核，已保留原文");
          } else {
            pendingBtn.disabled = false;
            pendingBtn.textContent = "未提炼";
            this.showToast(`提炼失败：${err.message}`);
          }
        }
      });
    };

    list.forEach(tool => {
      const card = document.createElement("div");
      const domain = window.shortcutsManager.extractDomain(tool.url);
      const isAlreadyAdded = window.shortcutsManager.hasShortcut(tool.url);
      const isSaved = window.archiveManager ? window.archiveManager.isSaved(tool.url) : false;
      const isNewsItem = tool.isNews || tool.itemType === "news" || tool.sourceType === "AIHot";
      const aiStateClass = tool.aiGenerated ? "is-ai-distilled" : "is-raw-item";

      // ================= 资讯源排版模式 (染色液态玻璃分类 + 已提炼/未提炼清晰区分) =================
      if (isNewsItem) {
        card.className = `wide-news-card ${aiStateClass}`;
        const mediaSource = tool.sourceName || tool.titleZh || tool.sourceType || "资讯";
        const domainCls = `domain-${inferDomainStyle(tool)}`;
        const tagsHtml = (tool.highlights || [])
          .slice(0, 2)
          .map(h => stripLeadingEmoji(h))
          .filter(Boolean)
          .map(h => `<span class="news-tag-chip">${h}</span>`)
          .join("");

        card.innerHTML = `
          <div class="news-card-top">
            <div class="news-card-meta-left">
              <span class="news-type-badge ${domainCls}">${tool.badge || "资讯"}</span>
              <span class="news-origin-pill">${mediaSource}</span>
            </div>
            <div class="news-card-meta-right">
              ${buildAiStatusHtml(tool)}
              <span>${tool.pubDate || "今日"}</span>
            </div>
          </div>
          <h3 class="news-card-headline">${tool.name}</h3>
          <div class="news-card-summary" title="${tool.descZh || tool.desc}">
            ${tool.descZh || tool.desc}
          </div>
          <div class="news-card-footer">
            <div class="news-card-tags">
              <span class="news-tag-chip">${domain}</span>
              ${tagsHtml}
            </div>
            <div class="news-card-actions">
              <button class="news-btn-save ${isSaved ? "saved" : ""}" title="${isSaved ? "取消稍后阅读" : "加入稍后阅读"}">
                <span>${isSaved ? "已存" : "暂存"}</span>
              </button>
              <button class="news-btn-detail" title="查看摘要详情">详情</button>
              <a class="news-btn-read" href="${tool.url}" target="_blank" rel="noopener noreferrer">阅读 ↗</a>
            </div>
          </div>
        `;

        // 点击卡片直接打开内参详情模态窗
        card.addEventListener("click", (e) => {
          if (e.target.closest(".news-btn-read") || e.target.closest(".news-btn-save") || e.target.closest(".card-ai-pending-btn")) return;
          e.preventDefault();
          this.openToolDetailModal(tool);
        });

        bindInlineAiDistill(card, tool);

        // 绑定稍后阅读按钮
        const saveBtn = card.querySelector(".news-btn-save");
        if (saveBtn) {
          saveBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (window.archiveManager) {
              const savedNow = await window.archiveManager.toggleSave(tool);
              if (savedNow) {
                saveBtn.classList.add("saved");
                saveBtn.innerHTML = "<span>已存</span>";
                this.showToast(`已将《${tool.name.slice(0, 16)}...》加入稍后阅读`);
              } else {
                saveBtn.classList.remove("saved");
                saveBtn.innerHTML = "<span>暂存</span>";
                this.showToast(`已从稍后阅读中移除`);
              }
            }
          });
        }

        cards.push(card);
        return;
      }

      // ================= 工具/项目源排版模式 (Product Hunt, GitHub, HN, V2EX) =================
      card.className = `wide-tool-card ${aiStateClass}`;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      let sourceTagClass = "ph";
      if (tool.sourceType === "GitHub") sourceTagClass = "gh";
      else if (tool.sourceType === "Hacker News") sourceTagClass = "hn";
      else if (tool.sourceType === "V2EX") sourceTagClass = "v2";

      const highlightsHtml = (tool.highlights || [])
        .slice(0, 2)
        .map(h => stripLeadingEmoji(h))
        .filter(Boolean)
        .map(h => `<span class="card-chip-highlight">${h}</span>`)
        .join("");

      card.innerHTML = `
        <div class="card-head-row">
          <div class="card-head-left">
            <div class="card-icon-squircle">
              <img src="${faviconUrl}" alt="${tool.name}" onerror="this.onerror=null;this.src='${fallbackIcon}'" />
            </div>
            <div class="card-title-group">
              <div class="card-title-main">
                <span class="card-title-name">${tool.name}</span>
                ${tool.titleZh ? `<span class="card-title-sub">${tool.titleZh}</span>` : ""}
              </div>
            </div>
          </div>
          <div class="card-head-right">
            <span class="source-tag ${sourceTagClass}">${tool.sourceType || "工具"}</span>
            ${buildAiStatusHtml(tool)}
          </div>
        </div>

        <div class="card-body-desc" title="${tool.descZh || tool.desc}">
          ${tool.descZh || tool.desc}
        </div>

        <div class="card-foot-row">
          <div class="card-foot-meta">
            <span class="card-chip-domain">${domain}</span>
            ${highlightsHtml}
            <span class="card-chip-date">${tool.pubDate || "今日"}</span>
          </div>
          <div class="card-foot-actions">
            <button class="card-action-btn card-btn-save ${isSaved ? "saved" : ""}" title="${isSaved ? "取消暂存" : "加入暂存箱"}">
              <span>${isSaved ? "已存" : "暂存"}</span>
            </button>
            <button class="card-action-btn card-btn-add ${isAlreadyAdded ? "added" : ""}" data-url="${tool.url}" data-name="${tool.name}" title="${isAlreadyAdded ? "已在首页快捷方式" : "添加到首页快捷方式"}">
              <span>${isAlreadyAdded ? "已添加" : "加到首页"}</span>
            </button>
            <a class="card-action-btn card-btn-visit" href="${tool.url}" target="_blank" rel="noopener noreferrer">直达 ↗</a>
          </div>
        </div>
      `;

      // 点击卡片直接打开详情模态窗
      card.addEventListener("click", (e) => {
        if (e.target.closest(".card-btn-add") || e.target.closest(".card-btn-visit") || e.target.closest(".card-btn-save") || e.target.closest(".card-ai-pending-btn")) {
          return;
        }
        e.preventDefault();
        this.openToolDetailModal(tool);
      });

      bindInlineAiDistill(card, tool);

      // 绑定存入稍后使用暂存箱事件
      const saveBtn = card.querySelector(".card-btn-save");
      if (saveBtn) {
        saveBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (window.archiveManager) {
            const savedNow = await window.archiveManager.toggleSave(tool);
            if (savedNow) {
              saveBtn.classList.add("saved");
              saveBtn.innerHTML = "<span>已存</span>";
              this.showToast(`已将「${tool.name}」加入暂存箱`);
            } else {
              saveBtn.classList.remove("saved");
              saveBtn.innerHTML = "<span>暂存</span>";
              this.showToast(`已从暂存箱移除「${tool.name}」`);
            }
          }
        });
      }

      // 绑定加到首页快捷方式事件
      const addBtn = card.querySelector(".card-btn-add");
      if (addBtn) {
        addBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (addBtn.classList.contains("added")) {
            this.showToast("该网址已在首页快捷方式中");
            return;
          }
          await window.shortcutsManager.addShortcut({
            title: tool.name,
            url: tool.url
          });
          addBtn.classList.add("added");
          addBtn.innerHTML = "<span>已添加</span>";
          this.showToast(`已将「${tool.name}」添加至首页`);
          this.renderTools();
        });
      }

      cards.push(card);
    });

    // 采用 replaceChildren 原子替换，彻底杜绝 innerHTML="" 引起的渲染空白闪烁
    grid.replaceChildren(...cards);
  }

  // 加载用户上次选择的搜索引擎
  async loadEnginePref() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get("searchEngineId");
        if (data.searchEngineId) {
          this.currentEngineId = data.searchEngineId;
        }
      } else {
        const saved = localStorage.getItem("liquid_searchEngineId");
        if (saved) {
          this.currentEngineId = saved;
        }
      }
    } catch (e) {
      console.warn("读取搜索引擎偏好失败:", e);
    }
  }

  async saveEnginePref(id) {
    this.currentEngineId = id;
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ searchEngineId: id });
      } else {
        localStorage.setItem("liquid_searchEngineId", id);
      }
    } catch (e) {
      console.error("保存搜索引擎失败:", e);
    }
  }

  getCurrentEngine() {
    return SEARCH_ENGINES.find(e => e.id === this.currentEngineId) || SEARCH_ENGINES[0];
  }

  // 初始化搜索组件
  initSearch() {
    const trigger = document.getElementById("engineTrigger");
    const popover = document.getElementById("enginePopover");
    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("searchClearBtn");
    const submitBtn = document.getElementById("searchSubmitBtn");

    // 渲染搜索引擎下拉菜单项
    popover.innerHTML = "";
    SEARCH_ENGINES.forEach(eng => {
      const item = document.createElement("div");
      item.className = `engine-item ${eng.id === this.currentEngineId ? "active" : ""}`;
      item.dataset.id = eng.id;
      item.innerHTML = `
        <div class="engine-icon">
          <img src="${eng.icon}" alt="${eng.name}" onerror="this.src='https://www.google.com/s2/favicons?domain=${new URL(eng.url).hostname}&sz=32'" />
        </div>
        <span>${eng.name}</span>
        <span class="engine-hotkey">${eng.hotkey}</span>
      `;
      item.addEventListener("click", () => {
        this.selectEngine(eng.id);
        popover.classList.remove("open");
        trigger.classList.remove("open");
        input.focus();
      });
      popover.appendChild(item);
    });

    this.updateEngineTriggerUI();

    // 点击切换弹出框显隐
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = popover.classList.toggle("open");
      trigger.classList.toggle("open", isOpen);
    });

    // 点击空白关闭弹层
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !popover.contains(e.target)) {
        popover.classList.remove("open");
        trigger.classList.remove("open");
      }
    });

    // 输入框清除按钮状态联动
    input.addEventListener("input", () => {
      clearBtn.classList.toggle("visible", input.value.trim().length > 0);
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.classList.remove("visible");
      input.focus();
    });

    // 回车或点击搜索
    const executeSearch = () => {
      const q = input.value.trim();
      if (!q) return;

      // 如果输入的是合法的 URL，直接访问
      if (/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(q)) {
        const targetUrl = q.startsWith("http://") || q.startsWith("https://") ? q : "https://" + q;
        const target = window.shortcutsManager.openInNewTab ? "_blank" : "_self";
        window.open(targetUrl, target);
        return;
      }

      const eng = this.getCurrentEngine();
      const searchUrl = eng.url + encodeURIComponent(q);
      const target = window.shortcutsManager.openInNewTab ? "_blank" : "_self";
      window.open(searchUrl, target);
    };

    submitBtn.addEventListener("click", executeSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        executeSearch();
      }
    });
  }

  // 选择搜索引擎
  selectEngine(id) {
    this.saveEnginePref(id);
    this.updateEngineTriggerUI();
    const popover = document.getElementById("enginePopover");
    popover.querySelectorAll(".engine-item").forEach(item => {
      item.classList.toggle("active", item.dataset.id === id);
    });
    this.showToast(`已切换搜索引擎为: ${this.getCurrentEngine().name}`);
  }

  updateEngineTriggerUI() {
    const eng = this.getCurrentEngine();
    const iconImg = document.getElementById("currentEngineIcon");
    const nameSpan = document.getElementById("currentEngineName");
    const input = document.getElementById("searchInput");

    if (iconImg) {
      iconImg.src = eng.icon;
      iconImg.onerror = () => {
        iconImg.src = `https://www.google.com/s2/favicons?domain=${new URL(eng.url).hostname}&sz=32`;
      };
    }
    if (nameSpan) nameSpan.textContent = eng.name;
    if (input) input.placeholder = eng.placeholder;
  }

  // 顶部选项卡切换 (我的主页 vs 精选工具)
  initViewTabs() {
    const tabHome = document.getElementById("tabHome");
    const tabTools = document.getElementById("tabTools");
    const viewHome = document.getElementById("viewHome");
    const viewTools = document.getElementById("viewTools");

    tabHome.addEventListener("click", () => {
      this.currentView = "home";
      tabHome.classList.add("active");
      tabTools.classList.remove("active");
      viewHome.classList.add("active");
      viewTools.classList.remove("active");
    });

    tabTools.addEventListener("click", () => {
      this.currentView = "tools";
      tabTools.classList.add("active");
      tabHome.classList.remove("active");
      viewTools.classList.add("active");
      viewHome.classList.remove("active");
      this.renderTools();
    });
  }

  // 首页快捷操作按钮绑定 (直接从书签栏导入 / 手动添加)
  initHomeActions() {
    const quickBookmarksBtn = document.getElementById("homeQuickBookmarksBtn");
    const quickAddBtn = document.getElementById("homeQuickAddBtn");

    if (quickBookmarksBtn) {
      quickBookmarksBtn.addEventListener("click", () => {
        this.openShortcutModal(null, "bookmarks");
      });
    }

    if (quickAddBtn) {
      quickAddBtn.addEventListener("click", () => {
        this.openShortcutModal(null, "manual");
      });
    }
  }

  // 初始化精选工具库
  initToolsLibrary() {
    const catContainer = document.getElementById("toolCategories");
    const searchFilter = document.getElementById("toolFilterInput");
    const funSyncBtn = document.getElementById("funSyncBtn");
    const funSyncText = document.getElementById("funSyncBtnText");

    catContainer.innerHTML = "";
    TOOL_CATEGORIES.forEach(cat => {
      const pill = document.createElement("button");
      pill.className = `category-pill ${cat.id === "all" ? "active" : ""}`;
      pill.innerHTML = `<span>${cat.icon}</span><span>${cat.name}</span>`;
      pill.addEventListener("click", () => {
        catContainer.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.selectedToolCategory = cat.id;
        this.renderTools();
      });
      catContainer.appendChild(pill);
    });

    if (searchFilter) {
      searchFilter.addEventListener("input", () => {
        this.renderTools();
      });
    }

    if (funSyncBtn) {
      funSyncBtn.addEventListener("click", async () => {
        funSyncBtn.classList.add("syncing");
        if (funSyncText) funSyncText.textContent = "探索中...";
        try {
          const fresh = await window.dailyToolsSyncEngine.syncFunExploreTools(true);
          this.renderTools();
          this.showToast(`奇趣探索更新完成！发现 ${fresh.length} 款新奇脑洞网站`);
          const badge = document.getElementById("funLastSyncBadge");
          if (badge && window.dailyToolsSyncEngine) {
            badge.textContent = window.dailyToolsSyncEngine.getFunLastSyncText();
          }
        } catch (e) {
          this.showToast("探索新奇失败，使用本地推荐");
        } finally {
          funSyncBtn.classList.remove("syncing");
          if (funSyncText) funSyncText.textContent = "探索新奇";
        }
      });
    }

    this.renderTools();
  }

  // 渲染精选工具卡片 (纯净常驻精品库，含奇趣低频探索源)
  renderTools() {
    const grid = document.getElementById("toolsGrid");
    const searchFilter = document.getElementById("toolFilterInput");
    const query = searchFilter ? searchFilter.value.trim().toLowerCase() : "";

    let list = CURATED_TOOLS;

    // 针对“奇趣探索”分类展示专属动态探索状态条并合并低频更新源
    const funBanner = document.getElementById("funExploreBanner");
    const funBadge = document.getElementById("funLastSyncBadge");
    if (this.selectedToolCategory === "fun") {
      if (funBanner) funBanner.style.display = "flex";
      if (funBadge && window.dailyToolsSyncEngine) {
        funBadge.textContent = window.dailyToolsSyncEngine.getFunLastSyncText();
      }
      if (window.dailyToolsSyncEngine) {
        list = window.dailyToolsSyncEngine.getFunTools();
      }
    } else {
      if (funBanner) funBanner.style.display = "none";
    }

    if (this.selectedToolCategory !== "all" && this.selectedToolCategory !== "fun") {
      list = list.filter(t => t.category === this.selectedToolCategory);
    }

    if (query) {
      list = list.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.desc.toLowerCase().includes(query) ||
        t.url.toLowerCase().includes(query)
      );
    }

    grid.innerHTML = "";

    if (list.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-tertiary);">未找到匹配的工具网站</div>`;
      return;
    }

    list.forEach(tool => {
      const card = document.createElement("div");
      card.className = "tool-card";

      const domain = window.shortcutsManager.extractDomain(tool.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      const isAlreadyAdded = window.shortcutsManager.hasShortcut(tool.url);
      const badgeClass = tool.isDaily ? "tool-badge daily" : "tool-badge";

      card.innerHTML = `
        <div class="tool-card-main">
          <div class="tool-icon-wrapper">
            <img src="${faviconUrl}" alt="${tool.name}" onerror="this.src='https://api.iconify.design/solar:link-circle-bold-duotone.svg'" />
          </div>
          <div class="tool-info">
            <div class="tool-header-row">
              <span class="tool-title" title="${tool.name}">${tool.name}</span>
              ${tool.badge ? `<span class="${badgeClass}">${tool.badge}</span>` : ""}
            </div>
            <div class="tool-desc" title="${tool.desc}">${tool.desc}</div>
          </div>
        </div>
        <div class="tool-footer">
          <button class="add-to-home-btn ${isAlreadyAdded ? "added" : ""}" data-url="${tool.url}" data-name="${tool.name}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              ${isAlreadyAdded ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
            </svg>
            <span>${isAlreadyAdded ? "已在首页" : "加到首页"}</span>
          </button>
          <span class="view-detail-hint" title="点击查看该工具的详细中文介绍">查看中文介绍 →</span>
          <a class="open-link-btn" href="${tool.url}" target="_blank" rel="noopener noreferrer">
            直达
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      `;

      // 点击卡片主体直接呼出高颜值中文详情小卡片
      card.addEventListener("click", (e) => {
        if (e.target.closest(".add-to-home-btn") || e.target.closest(".open-link-btn")) {
          return;
        }
        e.preventDefault();
        this.openToolDetailModal(tool);
      });

      const addBtn = card.querySelector(".add-to-home-btn");
      addBtn.addEventListener("click", async () => {
        if (addBtn.classList.contains("added")) {
          this.showToast("该网址已经在您的首页了");
          return;
        }
        await window.shortcutsManager.addShortcut({
          title: tool.name,
          url: tool.url
        });
        addBtn.classList.add("added");
        addBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>已在首页</span>
        `;
        this.showToast(`已成功添加「${tool.name}」到主页快捷方式！`);
      });

      grid.appendChild(card);
    });
  }

  // 模态窗口管理 (手动添加与书签栏导入)
  initModals() {
    const modal = document.getElementById("shortcutModal");
    const closeBtn = document.getElementById("shortcutModalClose");
    const cancelBtn = document.getElementById("shortcutCancelBtn");
    const saveBtn = document.getElementById("shortcutSaveBtn");
    const nameInput = document.getElementById("shortcutNameInput");
    const urlInput = document.getElementById("shortcutUrlInput");
    const iconInput = document.getElementById("shortcutIconInput");

    // 模态弹窗顶部的标签切换
    const tabManual = document.getElementById("modalTabManual");
    const tabBookmarks = document.getElementById("modalTabBookmarks");
    const panelManual = document.getElementById("panelManualShortcut");
    const panelBookmarks = document.getElementById("panelBookmarksShortcut");

    const switchModalTab = (tab) => {
      this.modalActiveTab = tab;
      if (tab === "manual") {
        tabManual.classList.add("active");
        tabBookmarks.classList.remove("active");
        panelManual.classList.add("active");
        panelBookmarks.classList.remove("active");
        setTimeout(() => urlInput.focus(), 100);
      } else {
        tabBookmarks.classList.add("active");
        tabManual.classList.remove("active");
        panelBookmarks.classList.add("active");
        panelManual.classList.remove("active");
        this.renderBookmarksList();
      }
    };

    tabManual.addEventListener("click", () => switchModalTab("manual"));
    tabBookmarks.addEventListener("click", () => switchModalTab("bookmarks"));

    const closeModal = () => {
      modal.classList.remove("open");
      this.editingShortcutId = null;
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    saveBtn.addEventListener("click", async () => {
      const url = urlInput.value.trim();
      const title = nameInput.value.trim();
      const icon = iconInput.value.trim();

      if (!url) {
        this.showToast("请输入网址 URL");
        urlInput.focus();
        return;
      }

      if (this.editingShortcutId) {
        await window.shortcutsManager.updateShortcut(this.editingShortcutId, {
          title,
          url,
          customIcon: icon
        });
        this.showToast("快捷方式已更新");
      } else {
        await window.shortcutsManager.addShortcut({
          title,
          url,
          customIcon: icon
        });
        this.showToast("快捷方式已添加到首页");
      }

      closeModal();
    });

    // 绑定详情小卡片弹窗关闭逻辑
    const detailModal = document.getElementById("toolDetailModal");
    const detailCloseBtn = document.getElementById("toolDetailModalClose");
    if (detailCloseBtn && detailModal) {
      const closeDetailModal = () => detailModal.classList.remove("open");
      detailCloseBtn.addEventListener("click", closeDetailModal);
      detailModal.addEventListener("click", (e) => {
        if (e.target === detailModal) closeDetailModal();
      });
    }

    const archiveModal = document.getElementById("archiveModal");
    if (archiveModal) {
      archiveModal.addEventListener("click", (e) => {
        if (e.target === archiveModal) archiveModal.classList.remove("open");
      });
    }
  }

  // 打开今日发现详情小卡片 (100% 纯正地道中文详解)
  openToolDetailModal(tool) {
    const modal = document.getElementById("toolDetailModal");
    if (!modal || !tool) return;

    const iconImg = document.getElementById("detailToolIcon");
    const titleEl = document.getElementById("detailToolTitle");
    const badgeEl = document.getElementById("detailToolBadge");
    const metaEl = document.getElementById("detailToolMeta");
    const descZhEl = document.getElementById("detailToolDescZh");
    const chipsContainer = document.getElementById("detailToolHighlights");
    const visitBtn = document.getElementById("detailVisitSiteBtn");
    const addToHomeBtn = document.getElementById("detailAddToHomeBtn");
    const addToHomeText = document.getElementById("detailAddToHomeText");

    const domain = window.shortcutsManager.extractDomain(tool.url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    if (iconImg) {
      iconImg.src = faviconUrl;
      iconImg.onerror = () => {
        iconImg.src = "https://api.iconify.design/solar:link-circle-bold-duotone.svg";
      };
    }

    const isNews = tool.isNews || tool.itemType === "news" || tool.sourceType === "AIHot";

    if (isNews) {
      if (titleEl) titleEl.textContent = tool.name;
      if (badgeEl) badgeEl.textContent = tool.badge || "前沿资讯";
      if (metaEl) metaEl.textContent = `📰 资讯出处: ${tool.sourceName || "AIHot"} • ${tool.pubDate || "今日"} • ${domain}`;
    } else {
      // 智能提取或匹配中文副标题
      if (!tool.titleZh && window.dailyToolsSyncEngine) {
        tool.titleZh = window.dailyToolsSyncEngine.extractChineseTitle(tool.name, tool.descZh || tool.desc || "");
      }

      if (titleEl) {
        titleEl.textContent = tool.titleZh ? `${tool.name} (${tool.titleZh})` : tool.name;
      }

      if (badgeEl) {
        badgeEl.textContent = tool.badge || (tool.isDaily ? "今日新品" : "精选工具");
      }

      if (metaEl) {
        metaEl.textContent = `${tool.sourceType || "今日精选发现"} • ${tool.pubDate || "实时更新"} • ${domain}`;
      }
    }

    // 中文详细解析 - 确保 100% 呈现地道中文，若含英文立即触发在线即时转译
    const currentText = tool.descZh || tool.desc || "";
    const hasChinese = /[\u4e00-\u9fa5]{3,}/.test(currentText);

    if (descZhEl) {
      if (isNews && tool.reason) {
        descZhEl.innerHTML = `
          <div style="margin-bottom: 12px; padding: 10px 14px; background: rgba(10, 132, 255, 0.12); border-left: 3px solid #0A84FF; border-radius: 6px; font-size: 13px; line-height: 1.55; color: #bfe0ff;">
            <strong style="color: #5ac8fa;">💡 选编看点与内参：</strong>${tool.reason}
          </div>
          <div style="font-size: 13.5px; line-height: 1.65; color: rgba(255, 255, 255, 0.85);">${currentText}</div>
        `;
      } else if (hasChinese) {
        descZhEl.textContent = currentText;
      } else {
        // 动态展示转译状态，即时发起在线翻译
        descZhEl.innerHTML = `
          <span style="display:inline-flex; align-items:center; gap:8px; color: var(--accent-cyan); font-weight: 500;">
            <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            正在智能生成中文详细解析...
          </span>
        `;

        (async () => {
          const rawText = tool.rawDesc || tool.desc || tool.name;
          let translated = "";
          if (window.dailyToolsSyncEngine) {
            translated = await window.dailyToolsSyncEngine.translateToChinese(rawText);
          }
          if (!translated || !/[\u4e00-\u9fa5]/.test(translated)) {
            translated = "精选智能效率工具，深度赋能业务工作流与日常提效，支持便捷直达体验。";
          }
          tool.descZh = translated;
          tool.desc = translated;
          if (!tool.titleZh && window.dailyToolsSyncEngine) {
            tool.titleZh = window.dailyToolsSyncEngine.extractChineseTitle(tool.name, translated);
          }

          if (modal.classList.contains("open")) {
            descZhEl.textContent = translated;
            if (titleEl) {
              titleEl.textContent = tool.titleZh ? `${tool.name} (${tool.titleZh})` : tool.name;
            }
          }
          this.renderTools();
          this.renderHomeWideCards();
          if (window.dailyToolsSyncEngine) {
            await window.dailyToolsSyncEngine.saveToCache();
          }
        })();
      }
    }

    // 核心亮点标签
    if (chipsContainer) {
      chipsContainer.innerHTML = "";
      let highlights = tool.highlights;
      if (!highlights || !highlights.length) {
        highlights = window.dailyToolsSyncEngine ? window.dailyToolsSyncEngine.extractHighlights(tool.name, tool.descZh || tool.desc) : ["⚡ 效率提升", "🚀 热门发现", "💻 实用工具"];
      }
      highlights.forEach(h => {
        const chip = document.createElement("span");
        chip.className = "highlight-chip";
        chip.textContent = h;
        chipsContainer.appendChild(chip);
      });
    }

    // 访问官网 / 阅读全文按钮
    if (visitBtn) {
      visitBtn.href = tool.url;
      visitBtn.innerHTML = isNews ? "<span>阅读原文 ↗</span>" : "<span>访问主页 ↗</span>";
    }

    // AI 摘要徽章展示
    const aiBadge = document.getElementById("detailToolAiBadge");
    if (aiBadge) {
      if (tool.aiGenerated) {
        aiBadge.style.display = "inline-flex";
        aiBadge.textContent = `${tool.aiModel || "AI"} 摘要`;
      } else {
        aiBadge.style.display = "none";
      }
    }

    // AI 重新深度提炼单卡片按钮
    const rescanBtn = document.getElementById("detailAiRescanBtn");
    const rescanText = document.getElementById("detailAiRescanText");
    if (rescanBtn) {
      rescanBtn.onclick = async () => {
        if (!window.aiService || !window.aiService.isEnabled()) {
          this.openAiSettingsSection();
          return;
        }

        rescanBtn.disabled = true;
        if (rescanText) rescanText.textContent = "提炼中...";
        if (descZhEl) {
          descZhEl.innerHTML = `
            <span style="display:inline-flex; align-items:center; gap:8px; color: var(--text-secondary); font-weight: 500;">
              <svg class="spin-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              正在调用 ${window.aiService.getModelName()} 生成摘要...
            </span>
          `;
        }

        try {
          const aiResult = await window.aiService.generateToolSummary(tool);
          if (aiResult && aiResult.summary) {
            tool.descZh = aiResult.summary;
            tool.desc = aiResult.summary;
            if (aiResult.titleZh) tool.titleZh = aiResult.titleZh;
            if (aiResult.highlights && aiResult.highlights.length) tool.highlights = aiResult.highlights;
            tool.aiGenerated = true;
            tool.aiRiskSkipped = false;
            tool.aiModel = window.aiService.getModelName();

            if (modal.classList.contains("open")) {
              descZhEl.textContent = tool.descZh;
              if (titleEl) {
                titleEl.textContent = tool.titleZh ? `${tool.name} (${tool.titleZh})` : tool.name;
              }
              if (aiBadge) {
                aiBadge.style.display = "inline-flex";
                aiBadge.textContent = `${tool.aiModel} 摘要`;
              }
              if (chipsContainer && tool.highlights) {
                chipsContainer.innerHTML = "";
                tool.highlights.forEach(h => {
                  const chip = document.createElement("span");
                  chip.className = "highlight-chip";
                  chip.textContent = h;
                  chipsContainer.appendChild(chip);
                });
              }
            }

            this.renderTools();
            this.renderHomeWideCards();
            await window.dailyToolsSyncEngine.saveToCache();
            this.showToast(`已完成「${tool.name}」摘要提炼`);
          }
        } catch (err) {
          this.showToast(err && err.isContentRisk
            ? "该条目触发模型内容合规审核 (Content Exists Risk)，已保留原文"
            : `AI 提炼失败：${err.message}`);
          if (descZhEl) descZhEl.textContent = tool.descZh || tool.desc;
        } finally {
          rescanBtn.disabled = false;
          if (rescanText) rescanText.textContent = "AI 提炼";
        }
      };
    }

    // 添加到首页快捷方式按钮状态
    const isAdded = window.shortcutsManager.hasShortcut(tool.url);
    if (addToHomeBtn && addToHomeText) {
      if (isAdded) {
        addToHomeBtn.classList.add("added");
        addToHomeText.textContent = "已在首页";
      } else {
        addToHomeBtn.classList.remove("added");
        addToHomeText.textContent = "加到首页";
      }

      // 重置点击事件
      addToHomeBtn.onclick = async () => {
        if (window.shortcutsManager.hasShortcut(tool.url)) {
          this.showToast("该网址已在首页快捷方式中");
          return;
        }
        await window.shortcutsManager.addShortcut({
          title: tool.name,
          url: tool.url
        });
        addToHomeBtn.classList.add("added");
        addToHomeText.textContent = "已在首页";
        this.renderTools();
        this.renderHomeWideCards();
        this.showToast(`已将「${tool.name}」添加至首页`);
      };
    }

    // 暂存归档 (稍后阅读 / 稍后使用) 按钮状态与交互
    const saveArchiveBtn = document.getElementById("detailSaveArchiveBtn");
    const saveArchiveText = document.getElementById("detailSaveArchiveText");
    if (saveArchiveBtn && saveArchiveText && window.archiveManager) {
      const isSaved = window.archiveManager.isSaved(tool.url);
      if (isSaved) {
        saveArchiveBtn.classList.add("added");
        saveArchiveText.textContent = isNews ? "★ 已存入稍后阅读" : "★ 已在稍后使用暂存箱";
      } else {
        saveArchiveBtn.classList.remove("added");
        saveArchiveText.textContent = isNews ? "⭐ 存入稍后阅读" : "⭐ 暂存归档 (稍后使用)";
      }

      saveArchiveBtn.onclick = async () => {
        const savedNow = await window.archiveManager.toggleSave(tool);
        if (savedNow) {
          saveArchiveBtn.classList.add("added");
          saveArchiveText.textContent = isNews ? "★ 已存入稍后阅读" : "★ 已在稍后使用暂存箱";
          this.showToast(isNews ? `已将《${tool.name.slice(0, 16)}...》存入稍后阅读！` : `已将「${tool.name}」存入稍后使用暂存箱！`);
        } else {
          saveArchiveBtn.classList.remove("added");
          saveArchiveText.textContent = isNews ? "⭐ 存入稍后阅读" : "⭐ 暂存归档 (稍后使用)";
          this.showToast(`已从暂存箱移除「${tool.name}」`);
        }
        this.renderHomeWideCards();
      };
    }

    modal.classList.add("open");
  }

  // 打开设置面板中的 AI 模型配置区
  openAiSettingsSection(toastMsg = "请先在设置中配置并开启 AI 大模型 API") {
    this.showToast(toastMsg);
    const modal = document.getElementById("settingsModal");
    if (modal) modal.classList.add("open");
    const section = document.getElementById("settingSectionAi");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }

  // 渲染「AI 跨界今日总览」简报卡片
  renderAiDailyOverview(allowAuto = false) {
    const body = document.getElementById("aiDailyOverviewBody");
    const meta = document.getElementById("aiOverviewMeta");
    const btnText = document.getElementById("refreshAiOverviewText");
    if (!body) return;

    const mode = this.homeDailyMode || "all";
    const items = window.dailyToolsSyncEngine
      ? window.dailyToolsSyncEngine.getToolsByModeAndSource(mode, "all")
      : [];
    const aiReady = !!(window.aiService && window.aiService.isEnabled());

    if (!aiReady) {
      if (meta) meta.textContent = "未配置 AI 模型";
      if (btnText) btnText.textContent = "配置 AI";
      const empty = document.createElement("div");
      empty.className = "ai-overview-empty";
      const span = document.createElement("span");
      span.textContent = `当前共聚合 ${items.length} 条多源动态，开启 AI 摘要引擎后可一键生成今日总览。`;
      empty.appendChild(span);
      body.replaceChildren(empty);
      return;
    }

    const cached = window.aiService.getCachedOverview(mode);
    if (cached) {
      if (meta) {
        const riskNote = cached.riskFiltered ? " · 已过滤风控条目" : "";
        meta.textContent = `${cached.date} · ${cached.model} · ${cached.sourceCount || "多"} 源${riskNote}`;
      }
      if (btnText) btnText.textContent = "重新概括";

      const nodes = [];

      if (cached.headline) {
        const hl = document.createElement("div");
        hl.className = "ai-overview-headline";
        hl.textContent = cached.headline;
        nodes.push(hl);
      }

      if (cached.overview) {
        const sum = document.createElement("div");
        sum.className = "ai-overview-summary";
        sum.textContent = cached.overview;
        nodes.push(sum);
      }

      if (Array.isArray(cached.sectors) && cached.sectors.length > 0) {
        const grid = document.createElement("div");
        grid.className = "ai-overview-sectors";
        cached.sectors.forEach(sec => {
          const card = document.createElement("div");
          card.className = "ai-sector-item";

          const dom = document.createElement("div");
          dom.className = "ai-sector-domain";
          dom.textContent = sec.domain || "领域动态";

          const dig = document.createElement("div");
          dig.className = "ai-sector-digest";
          dig.textContent = sec.digest || "";

          card.appendChild(dom);
          card.appendChild(dig);
          grid.appendChild(card);
        });
        nodes.push(grid);
      }

      if (cached.topPick) {
        const pick = document.createElement("div");
        pick.className = "ai-overview-toppick";
        pick.textContent = `精读推荐：${cached.topPick}`;
        nodes.push(pick);
      }

      body.replaceChildren(...nodes);
      return;
    }

    if (meta) meta.textContent = `${window.aiService.getModelName()}`;
    if (btnText) btnText.textContent = "生成总览";

    const empty = document.createElement("div");
    empty.className = "ai-overview-empty";
    const span = document.createElement("span");
    span.textContent = window.aiService.isGeneratingOverview
      ? `正在梳理 ${items.length} 条订阅动态...`
      : `已汇聚 ${items.length} 条多源内容，点击右侧生成今日总览。`;
    empty.appendChild(span);
    body.replaceChildren(empty);

    if (allowAuto && items.length > 0 && !this.autoOverviewTriggered.has(mode) && !window.aiService.isGeneratingOverview) {
      this.autoOverviewTriggered.add(mode);
      this.triggerAiDailyOverview(false);
    }
  }

  // 触发 AI 生成今日跨界总览
  async triggerAiDailyOverview(interactive = true) {
    if (!window.aiService || !window.aiService.isEnabled()) {
      if (interactive) this.openAiSettingsSection();
      return;
    }

    const mode = this.homeDailyMode || "all";
    const items = window.dailyToolsSyncEngine
      ? window.dailyToolsSyncEngine.getToolsByModeAndSource(mode, "all")
      : [];

    if (!items.length) {
      if (interactive) this.showToast("当前分类暂无内容，请先刷新订阅源");
      return;
    }

    const refreshBtn = document.getElementById("refreshAiOverviewBtn");
    const refreshText = document.getElementById("refreshAiOverviewText");
    const navBtn = document.getElementById("homeAiOverviewBtn");
    const navBtnText = document.getElementById("homeAiOverviewBtnText");
    const body = document.getElementById("aiDailyOverviewBody");

    if (refreshBtn) refreshBtn.disabled = true;
    if (navBtn) navBtn.disabled = true;
    if (refreshText) refreshText.textContent = "概括中...";
    if (navBtnText) navBtnText.textContent = "概括中...";

    if (body && interactive) {
      const loading = document.createElement("div");
      loading.className = "ai-overview-empty";
      loading.textContent = `正在调用 ${window.aiService.getModelName()} 梳理今日多源简报...`;
      body.replaceChildren(loading);
    }

    try {
      const ov = await window.aiService.generateDailyOverview(items, mode);
      this.renderAiDailyOverview(false);
      if (interactive) {
        this.showToast(ov && ov.riskFiltered ? "今日总览已生成（已自动跳过风控条目）" : "今日总览已生成");
      }
    } catch (err) {
      this.renderAiDailyOverview(false);
      if (interactive) {
        this.showToast(err && err.isContentRisk
          ? "当前条目触发了模型内容合规审核，建议切换模型或筛选其他分类重试"
          : `生成今日总览失败：${err.message}`);
      }
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
      if (navBtn) navBtn.disabled = false;
      if (navBtnText) navBtnText.textContent = "今日总览";
    }
  }

  // 批量调用大模型扫描提炼今日新发现（区分内容风控跳过与真实接口故障）
  async triggerAiBatchScan() {
    if (!window.aiService || !window.aiService.isEnabled()) {
      this.openAiSettingsSection();
      return;
    }

    const scanBtn = document.getElementById("triggerAiBatchScanBtn");
    const scanText = document.getElementById("triggerAiBatchScanText");
    const homeAiBtn = document.getElementById("homeAiScanBtn");
    const homeAiText = document.getElementById("homeAiScanText");
    const toolsBtn = document.getElementById("aiScanToolsBtn");
    const toolsText = document.getElementById("aiScanToolsText");

    if (scanBtn) scanBtn.disabled = true;
    if (homeAiBtn) homeAiBtn.disabled = true;
    if (toolsBtn) toolsBtn.disabled = true;
    if (scanText) scanText.textContent = "提炼中...";
    if (homeAiText) homeAiText.textContent = "提炼中...";
    if (toolsText) toolsText.textContent = "提炼中...";

    try {
      const engine = window.dailyToolsSyncEngine;
      const allDaily = engine ? (engine.dailyTools || []) : [];

      const mode = this.homeDailyMode || "all";
      const source = this.homeSelectedSource || "all";
      let scopedTools = allDaily;
      if (engine && (mode !== "all" || source !== "all")) {
        if (source === "news_all") {
          scopedTools = engine.getToolsByModeAndSource("news", "all");
        } else {
          scopedTools = engine.getToolsByModeAndSource(mode, source);
        }
      }
      if (!scopedTools.length) scopedTools = allDaily;

      const unscannedCount = scopedTools.filter(t => !t.aiGenerated && !t.aiRiskSkipped).length;
      const forceRescan = unscannedCount === 0 && !window.aiService.isScanning;

      if (window.aiService.isScanning) {
        this.showToast("后台 AI 提炼正在运行，已同步进度...");
      } else if (forceRescan) {
        this.showToast(`正在使用 ${window.aiService.getModelName()} 重新提炼当前分类 (${scopedTools.length} 条)...`);
      } else {
        this.showToast(`开始使用 ${window.aiService.getModelName()} 提炼 ${unscannedCount} 条新内容...`);
      }

      const stats = await window.aiService.batchScanDailyTools(scopedTools, {
        forceRescan,
        onProgress: (completed, total) => {
          if (scanText) scanText.textContent = `提炼中 (${completed}/${total})`;
          if (homeAiText) homeAiText.textContent = `提炼 (${completed}/${total})`;
          if (toolsText) toolsText.textContent = `提炼 (${completed}/${total})`;
        },
        onBatchComplete: async () => {
          if (engine) await engine.saveToCache();
          this.renderHomeWideCards();
        }
      });

      if (engine) await engine.saveToCache();
      this.renderTools();
      this.renderHomeWideCards();

      if (stats && stats.skipped) {
        this.openAiSettingsSection();
      } else if (stats && stats.succeeded > 0) {
        const notes = [];
        if (stats.riskSkipped > 0) notes.push(`${stats.riskSkipped} 条触发内容审核已保留原文`);
        if (stats.failed > 0) notes.push(`${stats.failed} 条请求失败`);
        this.showToast(notes.length
          ? `已提炼 ${stats.succeeded} 条（${notes.join("，")}）`
          : `已完成 ${stats.succeeded} 条内容提炼`);
      } else if (stats && stats.riskSkipped > 0 && stats.failed === 0) {
        this.showToast(`当前 ${stats.riskSkipped} 条内容触发模型内容审核 (Content Exists Risk)，已保留原文`);
      } else if (stats && stats.failed > 0) {
        this.showToast(`AI 提炼失败：${stats.lastError || "接口请求异常"}`);
      } else if (stats && stats.allAlreadyScanned) {
        this.showToast("当前内容已完成提炼");
      } else {
        this.showToast("当前暂无可提炼内容");
      }
    } catch (err) {
      this.showToast(`提炼异常：${err.message}`);
    } finally {
      if (scanBtn) scanBtn.disabled = false;
      if (homeAiBtn) homeAiBtn.disabled = false;
      if (toolsBtn) toolsBtn.disabled = false;
      if (scanText) scanText.textContent = "提炼今日内容";
      if (homeAiText) homeAiText.textContent = "提炼";
      if (toolsText) toolsText.textContent = "提炼";
    }
  }

  // 初始化历史足迹与稍后使用暂存归档系统
  initArchiveVault() {
    const openBtn = document.getElementById("openArchiveBtn");
    const modal = document.getElementById("archiveModal");
    const closeBtn = document.getElementById("archiveModalClose");
    const tabSaved = document.getElementById("archiveTabSaved");
    const tabHistory = document.getElementById("archiveTabHistory");
    const searchInput = document.getElementById("archiveSearchInput");
    const sourcePills = document.getElementById("archiveSourcePills");
    const exportJsonBtn = document.getElementById("exportArchiveJsonBtn");
    const exportHtmlBtn = document.getElementById("exportArchiveHtmlBtn");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    this.archiveCurrentTab = "saved";
    this.archiveSearchQuery = "";
    this.archiveSelectedSource = "all";

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.add("open");
        this.renderArchiveList();
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
      });
    }

    if (tabSaved && tabHistory) {
      tabSaved.addEventListener("click", () => {
        tabSaved.classList.add("active");
        tabHistory.classList.remove("active");
        this.archiveCurrentTab = "saved";
        if (clearHistoryBtn) clearHistoryBtn.style.display = "none";
        const tips = document.getElementById("archiveFooterTips");
        if (tips) tips.textContent = "💡 暂存箱永久保存，今后要用时随时一键添加至首页或直达";
        this.renderArchiveList();
      });

      tabHistory.addEventListener("click", () => {
        tabHistory.classList.add("active");
        tabSaved.classList.remove("active");
        this.archiveCurrentTab = "history";
        if (clearHistoryBtn) clearHistoryBtn.style.display = "inline-flex";
        const tips = document.getElementById("archiveFooterTips");
        if (tips) tips.textContent = "🕒 自动沉淀每日全网发现与热点动态历史，支持回溯查阅";
        this.renderArchiveList();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.archiveSearchQuery = searchInput.value.trim();
        this.renderArchiveList();
      });
    }

    if (sourcePills) {
      sourcePills.querySelectorAll(".archive-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          sourcePills.querySelectorAll(".archive-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          this.archiveSelectedSource = pill.dataset.source || "all";
          this.renderArchiveList();
        });
      });
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", () => {
        if (window.archiveManager) window.archiveManager.exportAsJson();
      });
    }

    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener("click", () => {
        if (window.archiveManager) window.archiveManager.exportAsHtml();
      });
    }

    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", async () => {
        if (confirm("确定要清空全网发现的历史长廊吗？（您收藏在“稍后使用”中的网址不会受影响）")) {
          if (window.archiveManager) {
            await window.archiveManager.clearHistory();
            this.showToast("已清空发现历史长廊");
            this.renderArchiveList();
          }
        }
      });
    }

    // 监听归档库更新事件，实时刷新列表与角标
    window.addEventListener("archiveVaultUpdated", () => {
      if (modal && modal.classList.contains("open")) {
        this.renderArchiveList();
      }
    });
  }

  // 渲染历史与暂存列表
  renderArchiveList() {
    const listEl = document.getElementById("archiveList");
    const savedCountEl = document.getElementById("archiveSavedCount");
    const historyCountEl = document.getElementById("archiveHistoryCount");
    if (!listEl || !window.archiveManager) return;

    const savedAll = window.archiveManager.savedItems || [];
    const historyAll = window.archiveManager.historyItems || [];

    if (savedCountEl) savedCountEl.textContent = savedAll.length;
    if (historyCountEl) historyCountEl.textContent = historyAll.length;

    let items = [];
    if (this.archiveCurrentTab === "saved") {
      items = window.archiveManager.getSavedList(this.archiveSearchQuery, this.archiveSelectedSource);
    } else {
      items = window.archiveManager.getHistoryList(this.archiveSearchQuery, this.archiveSelectedSource);
    }

    listEl.innerHTML = "";

    if (items.length === 0) {
      const isSavedTab = this.archiveCurrentTab === "saved";
      listEl.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; color: var(--text-tertiary);">
          <div style="font-size: 32px; margin-bottom: 12px;">${isSavedTab ? "📦" : "🔍"}</div>
          <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 6px;">
            ${isSavedTab ? "暂存箱空空如也" : "未找到匹配的历史足迹"}
          </div>
          <div style="font-size: 12.5px;">
            ${isSavedTab ? "在主页宽卡片或详情弹窗中点击「☆ 暂存」，即可保存万一今后要用到的好网站" : "每日全网更新后会自动在此为您沉淀历史长廊"}
          </div>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "archive-card";

      const domain = window.shortcutsManager.extractDomain(item.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      const isAlreadyAdded = window.shortcutsManager.hasShortcut(item.url);
      const isCurrentlySaved = window.archiveManager.isSaved(item.url);
      const isNews = item.isNews || item.itemType === "news" || item.sourceType === "AIHot";

      const titleDisplay = item.titleZh ? `${item.name} (${item.titleZh})` : item.name;
      const dateText = item.savedTimeText || item.discoveredTimeText || item.pubDate || "近期收录";
      const sourceBadgeHtml = isNews 
        ? `<span class="archive-card-source-badge" style="background: rgba(255, 75, 43, 0.25); color: #ff7654; border: 1px solid rgba(255, 75, 43, 0.45);">📰 深度资讯</span>` 
        : `<span class="archive-card-source-badge">${item.sourceType || "全网发现"}</span>`;

      card.innerHTML = `
        <div class="archive-card-left">
          <div class="archive-card-icon">
            <img src="${faviconUrl}" alt="${item.name}" onerror="this.src='https://api.iconify.design/solar:link-circle-bold-duotone.svg'" />
          </div>
          <div class="archive-card-info">
            <div class="archive-card-title-row">
              <span class="archive-card-title" title="${item.name}">${titleDisplay}</span>
              ${sourceBadgeHtml}
              <span class="archive-card-date">🕒 ${dateText}</span>
            </div>
            <div class="archive-card-desc" title="${item.descZh || item.desc}">
              ${item.descZh || item.desc}
            </div>
          </div>
        </div>
        <div class="archive-card-actions">
          <button class="archive-action-btn archive-btn-add ${isAlreadyAdded ? "added" : ""}" title="加到主页快捷方式">
            ${isAlreadyAdded ? "✓ 已在首页" : "＋ 加到首页"}
          </button>
          <a class="archive-action-btn" href="${item.url}" target="_blank" rel="noopener noreferrer" title="${isNews ? "阅读新闻原文" : "在新标签页直达"}">
            ${isNews ? "📖 阅读全文 ↗" : "直达 ↗"}
          </a>
          ${this.archiveCurrentTab === "saved" ? `
            <button class="archive-action-btn btn-remove archive-btn-remove" title="从稍后使用暂存箱中移除">
              ✕ 移除
            </button>
          ` : `
            <button class="archive-action-btn archive-btn-star" title="${isCurrentlySaved ? "已暂存" : (isNews ? "稍后阅读" : "存入稍后使用")}">
              ${isCurrentlySaved ? "★ 已存" : (isNews ? "☆ 稍后阅读" : "☆ 暂存")}
            </button>
          `}
        </div>
      `;

      // 绑定加到首页快捷方式
      const addBtn = card.querySelector(".archive-btn-add");
      if (addBtn) {
        addBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (window.shortcutsManager.hasShortcut(item.url)) {
            this.showToast("该网址已经在您的首页了");
            return;
          }
          await window.shortcutsManager.addShortcut({
            title: item.name,
            url: item.url
          });
          addBtn.classList.add("added");
          addBtn.textContent = "✓ 已在首页";
          this.showToast(`已成功将「${item.name}」添加至首页快捷方式！`);
          this.renderTools();
          this.renderHomeWideCards();
        });
      }

      // 绑定移除暂存
      const removeBtn = card.querySelector(".archive-btn-remove");
      if (removeBtn) {
        removeBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          await window.archiveManager.unsaveItem(item.url);
          this.showToast(`已将「${item.name}」从暂存箱中移除`);
          this.renderArchiveList();
          this.renderHomeWideCards();
        });
      }

      // 绑定历史中快速暂存
      const starBtn = card.querySelector(".archive-btn-star");
      if (starBtn) {
        starBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const savedNow = await window.archiveManager.toggleSave(item);
          if (savedNow) {
            starBtn.textContent = "★ 已暂存";
            this.showToast(`已将「${item.name}」存入稍后使用暂存箱！`);
          } else {
            starBtn.textContent = "☆ 暂存";
            this.showToast(`已从暂存箱移除「${item.name}」`);
          }
          this.renderArchiveList();
          this.renderHomeWideCards();
        });
      }

      listEl.appendChild(card);
    });
  }

  // 初始化书签栏交互逻辑
  initBookmarksIntegration() {
    const searchInput = document.getElementById("bookmarksSearchInput");
    const batchBtn = document.getElementById("bookmarksBatchImportBtn");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.renderBookmarksList(searchInput.value.trim());
      });
    }

    if (batchBtn) {
      batchBtn.addEventListener("click", async () => {
        const count = await window.bookmarksManager.batchImportTop(8);
        if (count > 0) {
          this.showToast(`已成功批量导入 ${count} 个书签至首页！`);
          this.renderBookmarksList(searchInput ? searchInput.value.trim() : "");
        } else {
          this.showToast("常用书签均已存在于首页");
        }
      });
    }
  }

  // 渲染书签列表
  async renderBookmarksList(query = "") {
    const container = document.getElementById("bookmarksListContainer");
    const statusBanner = document.getElementById("bookmarksStatusBanner");
    if (!container) return;

    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-tertiary);">正在读取书签...</div>`;

    await window.bookmarksManager.loadBookmarks();

    // 如果处于本地预览环境展示提示横幅
    if (statusBanner) {
      if (window.bookmarksManager.isDemo) {
        statusBanner.style.display = "block";
        statusBanner.innerHTML = `💡 <strong>本地预览模式</strong>：当前展示预置书签。安装扩展后将直接读取您的 Chrome 浏览器真实书签栏！`;
      } else {
        statusBanner.style.display = "none";
      }
    }

    const list = window.bookmarksManager.search(query);
    container.innerHTML = "";

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-tertiary);">没有找到匹配的书签</div>`;
      return;
    }

    list.forEach(bm => {
      const row = document.createElement("div");
      row.className = "bookmark-row";

      const domain = window.shortcutsManager.extractDomain(bm.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      const isAlreadyAdded = window.shortcutsManager.hasShortcut(bm.url);

      row.innerHTML = `
        <div class="bookmark-info">
          <div class="bookmark-icon">
            <img src="${faviconUrl}" alt="${bm.title}" onerror="this.src='https://api.iconify.design/solar:bookmark-linear.svg'" />
          </div>
          <div class="bookmark-text">
            <div class="bookmark-title" title="${bm.title}">${bm.title}</div>
            <div class="bookmark-folder-tag">📁 ${bm.folder || "书签栏"} • ${domain}</div>
          </div>
        </div>
        <button class="bookmark-import-btn ${isAlreadyAdded ? "added" : ""}" data-url="${bm.url}" data-title="${bm.title}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            ${isAlreadyAdded ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
          </svg>
          <span>${isAlreadyAdded ? "已在首页" : "添加"}</span>
        </button>
      `;

      const importBtn = row.querySelector(".bookmark-import-btn");
      importBtn.addEventListener("click", async () => {
        if (importBtn.classList.contains("added")) {
          this.showToast("该书签已经在首页了");
          return;
        }

        await window.bookmarksManager.importToHomepage(bm);
        importBtn.classList.add("added");
        importBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>已在首页</span>
        `;
        this.showToast(`已成功添加「${bm.title}」到首页！`);
      });

      container.appendChild(row);
    });
  }

  // 打开添加/编辑模态窗 (可指定默认选项卡: 'manual' 或 'bookmarks')
  openShortcutModal(item = null, defaultTab = "manual") {
    const modal = document.getElementById("shortcutModal");
    const title = document.getElementById("shortcutModalTitle");
    const nameInput = document.getElementById("shortcutNameInput");
    const urlInput = document.getElementById("shortcutUrlInput");
    const iconInput = document.getElementById("shortcutIconInput");
    const tabsContainer = document.getElementById("shortcutModalTabs");
    const tabManual = document.getElementById("modalTabManual");
    const tabBookmarks = document.getElementById("modalTabBookmarks");
    const panelManual = document.getElementById("panelManualShortcut");
    const panelBookmarks = document.getElementById("panelBookmarksShortcut");

    if (item) {
      // 编辑模式下隐藏书签栏选项卡
      this.editingShortcutId = item.id;
      if (tabsContainer) tabsContainer.style.display = "none";
      nameInput.value = item.title || "";
      urlInput.value = item.url || "";
      iconInput.value = item.customIcon || "";
      tabManual.classList.add("active");
      tabBookmarks.classList.remove("active");
      panelManual.classList.add("active");
      panelBookmarks.classList.remove("active");
    } else {
      this.editingShortcutId = null;
      if (tabsContainer) tabsContainer.style.display = "inline-flex";
      nameInput.value = "";
      urlInput.value = "";
      iconInput.value = "";

      if (defaultTab === "bookmarks") {
        tabBookmarks.classList.add("active");
        tabManual.classList.remove("active");
        panelBookmarks.classList.add("active");
        panelManual.classList.remove("active");
        this.renderBookmarksList();
      } else {
        tabManual.classList.add("active");
        tabBookmarks.classList.remove("active");
        panelManual.classList.add("active");
        panelBookmarks.classList.remove("active");
      }
    }

    modal.classList.add("open");
    setTimeout(() => {
      if (defaultTab === "manual" && !item) {
        urlInput.focus();
      } else if (item) {
        nameInput.focus();
      }
    }, 150);
  }

  // 设置面板初始化
  initSettings() {
    const modal = document.getElementById("settingsModal");
    const openBtn = document.getElementById("settingsBtn");
    const closeBtn = document.getElementById("settingsCloseBtn");
    const randomWpBtn = document.getElementById("randomWallpaperBtn");

    const sourceSelect = document.getElementById("settingWpSource");
    const freqSelect = document.getElementById("settingWpFreq");
    const meshStyleGroup = document.getElementById("settingMeshStyleGroup");
    const meshStyleSelect = document.getElementById("settingMeshStyle");
    const customUrlGroup = document.getElementById("settingCustomUrlGroup");
    const customUrlInput = document.getElementById("settingCustomWpUrl");
    const blurSlider = document.getElementById("settingBlurSlider");
    const blurVal = document.getElementById("settingBlurVal");
    const maskSlider = document.getElementById("settingMaskSlider");
    const maskVal = document.getElementById("settingMaskVal");
    const newTabToggle = document.getElementById("settingNewTabToggle");
    const exportBtn = document.getElementById("exportDataBtn");
    const importBtn = document.getElementById("importDataBtn");
    const importFile = document.getElementById("importDataFile");
    const resetBtn = document.getElementById("resetDefaultsBtn");

    openBtn.addEventListener("click", () => {
      const cfg = window.wallpaperEngine.config;
      sourceSelect.value = cfg.source;
      freqSelect.value = cfg.frequency;
      if (meshStyleGroup) meshStyleGroup.style.display = cfg.source === "mesh" ? "block" : "none";
      if (meshStyleSelect) meshStyleSelect.value = cfg.meshStyle || "auto";
      customUrlInput.value = cfg.customUrl || "";
      customUrlGroup.style.display = cfg.source === "custom" ? "block" : "none";
      blurSlider.value = cfg.blur || 0;
      blurVal.textContent = `${cfg.blur || 0}px`;
      maskSlider.value = cfg.maskOpacity || 35;
      maskVal.textContent = `${cfg.maskOpacity || 35}%`;
      newTabToggle.checked = window.shortcutsManager.openInNewTab;

      // 同步 AI 大模型配置项至设置面板
      if (window.aiService) {
        const aiCfg = window.aiService.config;
        const aiToggle = document.getElementById("settingAiToggle");
        const aiBody = document.getElementById("aiConfigBody");
        const aiProvider = document.getElementById("settingAiProvider");
        const aiBaseUrl = document.getElementById("settingAiBaseUrl");
        const aiApiKey = document.getElementById("settingAiApiKey");
        const aiModel = document.getElementById("settingAiModel");
        const aiStatus = document.getElementById("aiStatusBanner");

        if (aiToggle) aiToggle.checked = !!aiCfg.enabled;
        if (aiBody) aiBody.classList.toggle("disabled", !aiCfg.enabled);
        if (aiProvider) aiProvider.value = aiCfg.provider || "deepseek";
        if (aiBaseUrl) aiBaseUrl.value = aiCfg.baseUrl || "https://api.deepseek.com/v1";
        if (aiApiKey) aiApiKey.value = aiCfg.apiKey || "";
        if (aiModel) aiModel.value = aiCfg.model || "deepseek-chat";
        if (aiStatus) aiStatus.style.display = "none";
      }

      renderNewsSettings();

      modal.classList.add("open");
    });

    const closeSettings = () => modal.classList.remove("open");
    closeBtn.addEventListener("click", closeSettings);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeSettings();
    });

    randomWpBtn.addEventListener("click", async () => {
      await window.wallpaperEngine.manualNext();
      this.showToast("已切换为下一张壁纸");
    });

    sourceSelect.addEventListener("change", async () => {
      const source = sourceSelect.value;
      customUrlGroup.style.display = source === "custom" ? "block" : "none";
      if (meshStyleGroup) meshStyleGroup.style.display = source === "mesh" ? "block" : "none";
      await window.wallpaperEngine.updateConfig({ source });
    });

    if (meshStyleSelect) {
      meshStyleSelect.addEventListener("change", async () => {
        await window.wallpaperEngine.updateConfig({ meshStyle: meshStyleSelect.value });
        this.showToast("纯代码流体风格已更新");
      });
    }

    customUrlInput.addEventListener("change", async () => {
      await window.wallpaperEngine.updateConfig({ customUrl: customUrlInput.value.trim() });
    });

    freqSelect.addEventListener("change", async () => {
      await window.wallpaperEngine.updateConfig({ frequency: freqSelect.value });
      this.showToast("壁纸变换频率已更新");
    });

    blurSlider.addEventListener("input", () => {
      blurVal.textContent = `${blurSlider.value}px`;
      window.wallpaperEngine.updateConfig({ blur: parseInt(blurSlider.value, 10) });
    });

    maskSlider.addEventListener("input", () => {
      maskVal.textContent = `${maskSlider.value}%`;
      window.wallpaperEngine.updateConfig({ maskOpacity: parseInt(maskSlider.value, 10) });
    });

    newTabToggle.addEventListener("change", async () => {
      window.shortcutsManager.openInNewTab = newTabToggle.checked;
      await window.shortcutsManager.saveShortcuts();
      window.shortcutsManager.render();
      this.showToast(newTabToggle.checked ? "已设置为在新标签页打开网址" : "已设置为在当前页打开网址");
    });

    exportBtn.addEventListener("click", () => {
      const backupData = {
        shortcuts: window.shortcutsManager.shortcuts,
        wallpaper: window.wallpaperEngine.config,
        searchEngineId: this.currentEngineId,
        openInNewTab: window.shortcutsManager.openInNewTab,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `liquid-tab-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast("配置与快捷方式已导出为 JSON 备份");
    });

    importBtn.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.shortcuts && Array.isArray(data.shortcuts)) {
          window.shortcutsManager.shortcuts = data.shortcuts;
          await window.shortcutsManager.saveShortcuts();
          window.shortcutsManager.render();
        }
        if (data.wallpaper) {
          await window.wallpaperEngine.updateConfig(data.wallpaper);
        }
        if (data.searchEngineId) {
          await this.saveEnginePref(data.searchEngineId);
          this.updateEngineTriggerUI();
        }
        this.showToast("配置备份已成功导入恢复！");
        closeSettings();
      } catch (err) {
        this.showToast("解析备份文件失败，请确保格式正确");
      }
    });

    resetBtn.addEventListener("click", async () => {
      if (confirm("确定要恢复出厂默认设置吗？已添加的快捷方式将被重置。")) {
        window.shortcutsManager.shortcuts = [...DEFAULT_SHORTCUTS];
        await window.shortcutsManager.saveShortcuts();
        window.shortcutsManager.render();
        await window.wallpaperEngine.updateConfig({
          source: "bing",
          frequency: "every_newtab",
          blur: 0,
          maskOpacity: 35
        });
        await this.saveEnginePref("google");
        this.updateEngineTriggerUI();
        this.showToast("已恢复出厂默认状态");
        closeSettings();
      }
    });

    // 绑定 AI 大模型控制事件
    const aiToggle = document.getElementById("settingAiToggle");
    const aiBody = document.getElementById("aiConfigBody");
    const aiProvider = document.getElementById("settingAiProvider");
    const aiBaseUrl = document.getElementById("settingAiBaseUrl");
    const aiApiKey = document.getElementById("settingAiApiKey");
    const aiModel = document.getElementById("settingAiModel");
    const toggleKeyBtn = document.getElementById("toggleAiKeyVisibility");
    const testAiBtn = document.getElementById("testAiConnectionBtn");
    const testAiText = document.getElementById("testAiConnectionText");
    const aiStatus = document.getElementById("aiStatusBanner");
    const triggerBatchBtn = document.getElementById("triggerAiBatchScanBtn");

    if (aiToggle) {
      aiToggle.addEventListener("change", async () => {
        const enabled = aiToggle.checked;
        if (aiBody) aiBody.classList.toggle("disabled", !enabled);
        if (window.aiService) {
          await window.aiService.saveConfig({ enabled });
        }
        this.renderAiDailyOverview(false);
        this.showToast(enabled ? "已开启 AI 智能大模型深度概要引擎" : "已停用 AI 大模型引擎");
      });
    }

    const fetchModelsBtn = document.getElementById("fetchAiModelsBtn");
    const aiModelDatalist = document.getElementById("aiModelDatalist");
    const aiModelQuickPills = document.getElementById("aiModelQuickPills");

    if (aiProvider) {
      aiProvider.addEventListener("change", async () => {
        const pKey = aiProvider.value;
        const presets = window.AI_PRESETS || AI_PRESETS;
        const preset = presets[pKey];
        if (preset) {
          if (preset.isAggregator) {
            // 聚合平台或中转站：若用户已经输入过自定义地址或模型，则予以保留，避免被无意覆盖
            if (preset.baseUrl && (!aiBaseUrl.value || aiBaseUrl.value.includes("api.deepseek.com"))) {
              aiBaseUrl.value = preset.baseUrl;
            }
            if (preset.model && (!aiModel.value || aiModel.value === "deepseek-chat")) {
              aiModel.value = preset.model;
            }
            this.showToast(`已切换至「${preset.name.split(" ")[0]}」模式，支持 OneAPI/NewAPI 等任意中转，可点「拉取模型」`);
          } else if (pKey === "custom") {
            this.showToast("已切换至「自定义兼容 API」模式，支持任意中转网关与私有模型");
          } else {
            if (preset.baseUrl && aiBaseUrl) aiBaseUrl.value = preset.baseUrl;
            if (preset.model && aiModel) aiModel.value = preset.model;
            if (pKey === "ollama") {
              this.showToast("已切换为本地私有 Ollama，无需填写 API Key");
            } else {
              this.showToast(`已选用「${preset.name.split(" ")[0]}」预设配置`);
            }
          }

          if (window.aiService) {
            await window.aiService.saveConfig({
              provider: pKey,
              baseUrl: aiBaseUrl ? aiBaseUrl.value.trim() : "",
              model: aiModel ? aiModel.value.trim() : ""
            });
          }
        }
      });
    }

    if (toggleKeyBtn && aiApiKey) {
      toggleKeyBtn.addEventListener("click", () => {
        if (aiApiKey.type === "password") {
          aiApiKey.type = "text";
          toggleKeyBtn.textContent = "隐藏密钥";
        } else {
          aiApiKey.type = "password";
          toggleKeyBtn.textContent = "显示密钥";
        }
      });
    }

    const saveAiConfig = async () => {
      if (window.aiService) {
        await window.aiService.saveConfig({
          baseUrl: aiBaseUrl ? aiBaseUrl.value.trim() : "",
          apiKey: aiApiKey ? aiApiKey.value.trim() : "",
          model: aiModel ? aiModel.value.trim() : ""
        });
        this.renderAiDailyOverview(false);
      }
    };

    if (aiBaseUrl) aiBaseUrl.addEventListener("change", saveAiConfig);
    if (aiApiKey) aiApiKey.addEventListener("change", saveAiConfig);
    if (aiModel) aiModel.addEventListener("change", saveAiConfig);

    // 聚合平台 / OpenAI 兼容网关：一键拉取可用模型列表 (GET /models)
    if (fetchModelsBtn) {
      fetchModelsBtn.addEventListener("click", async () => {
        await saveAiConfig();
        const baseUrl = aiBaseUrl ? aiBaseUrl.value.trim() : "";
        const apiKey = aiApiKey ? aiApiKey.value.trim() : "";
        const pKey = aiProvider ? aiProvider.value : "custom";

        if (!apiKey && pKey !== "ollama") {
          this.showToast("请先填写有效的 API Key 密钥后再拉取模型");
          if (aiApiKey) aiApiKey.focus();
          return;
        }

        fetchModelsBtn.disabled = true;
        fetchModelsBtn.textContent = "🔄 拉取中...";

        try {
          const models = await window.aiService.fetchModelList({
            baseUrl,
            apiKey,
            provider: pKey
          });

          if (!models || models.length === 0) {
            this.showToast("未能从该接口检索到模型清单，您可直接手动输入模型名称");
            return;
          }

          // 填充 datalist 供用户输入时自动提示与补全
          if (aiModelDatalist) {
            aiModelDatalist.innerHTML = "";
            models.forEach(mId => {
              const opt = document.createElement("option");
              opt.value = mId;
              aiModelDatalist.appendChild(opt);
            });
          }

          // 渲染快速选择标签气泡 (优先展示前 14 个常用模型)
          if (aiModelQuickPills) {
            aiModelQuickPills.style.display = "flex";
            aiModelQuickPills.innerHTML = "";
            models.slice(0, 14).forEach(mId => {
              const pill = document.createElement("button");
              pill.type = "button";
              pill.className = "ai-model-pill";
              pill.textContent = mId;
              pill.title = `点击选用: ${mId}`;
              pill.addEventListener("click", () => {
                if (aiModel) {
                  aiModel.value = mId;
                  saveAiConfig();
                  this.showToast(`已选用模型: ${mId}`);
                }
              });
              aiModelQuickPills.appendChild(pill);
            });
          }

          if (aiModel && (!aiModel.value.trim() || aiModel.value === "deepseek-chat") && models.length > 0) {
            // 如果用户尚未输入模型，默认采用拉取到的首个模型
            aiModel.value = models[0];
            await saveAiConfig();
          }

          this.showToast(`🎉 成功从网关获取到 ${models.length} 个可用模型！可点击下方标签快速选用`);
        } catch (e) {
          this.showToast(`获取模型列表失败: ${e.message}`);
        } finally {
          fetchModelsBtn.disabled = false;
          fetchModelsBtn.textContent = "🔄 拉取可用模型";
        }
      });
    }

    if (testAiBtn) {
      testAiBtn.addEventListener("click", async () => {
        await saveAiConfig();
        testAiBtn.disabled = true;
        if (testAiText) testAiText.textContent = "测试中...";
        if (aiStatus) {
          aiStatus.style.display = "block";
          aiStatus.className = "ai-status-banner loading";
          aiStatus.innerHTML = `<span class="spin-icon">🌐</span> 正在向大模型 API 发起测试请求...`;
        }

        try {
          const res = await window.aiService.testConnection();
          if (aiStatus) {
            aiStatus.className = "ai-status-banner success";
            aiStatus.innerHTML = `✅ <b>连接成功！</b> 模型响应延迟: <b>${res.latency}ms</b><br><span style="opacity: 0.85;">回复内容: "${res.reply}"</span>`;
          }
          this.showToast("AI 模型 API 接口连接成功！");
        } catch (err) {
          if (aiStatus) {
            aiStatus.className = "ai-status-banner error";
            aiStatus.innerHTML = `❌ <b>连接失败:</b> ${err.message}`;
          }
          this.showToast("AI 模型连接测试未通过，请检查配置");
        } finally {
          testAiBtn.disabled = false;
          if (testAiText) testAiText.textContent = "测试 API 连接";
        }
      });
    }

    if (triggerBatchBtn) {
      triggerBatchBtn.addEventListener("click", async () => {
        await saveAiConfig();
        await this.triggerAiBatchScan();
      });
    }

    // ================= 破茧资讯源与自定义 RSS 订阅管理 =================
    const renderNewsSettings = () => {
      const grid = document.getElementById("newsSourcesGrid");
      const feedsList = document.getElementById("customFeedsList");
      if (!window.dailyToolsSyncEngine) return;

      const cfg = window.dailyToolsSyncEngine.newsConfig || { enabledSources: {}, customFeeds: [] };
      const builtin = window.BUILTIN_NEWS_SOURCES || [];

      if (grid) {
        grid.innerHTML = "";
        builtin.forEach(src => {
          const card = document.createElement("div");
          card.className = "news-source-card";
          const isEnabled = cfg.enabledSources[src.id] !== false;

          card.innerHTML = `
            <div class="source-card-left">
              <div class="source-card-icon">${src.icon || "📰"}</div>
              <div class="source-card-text">
                <div class="source-card-title">
                  <span>${src.name}</span>
                  <span class="source-card-tag">${src.badge}</span>
                </div>
                <div class="source-card-desc" title="${src.desc}">${src.desc}</div>
              </div>
            </div>
            <label class="switch-toggle" title="开启/关闭 ${src.name}">
              <input type="checkbox" class="news-source-toggle" data-source-id="${src.id}" ${isEnabled ? "checked" : ""} />
              <span class="switch-slider"></span>
            </label>
          `;

          const toggle = card.querySelector(".news-source-toggle");
          toggle.addEventListener("change", async () => {
            await window.dailyToolsSyncEngine.toggleSource(src.id, toggle.checked);
            this.showToast(toggle.checked ? `已开启《${src.name}》破茧资讯源` : `已停用《${src.name}》`);
            this.renderHomeSubchannelPills();
            this.renderHomeWideCards();
          });

          grid.appendChild(card);
        });
      }

      if (feedsList) {
        feedsList.innerHTML = "";
        const customFeeds = cfg.customFeeds || [];
        if (customFeeds.length === 0) {
          feedsList.innerHTML = `<span style="font-size: 12px; color: var(--text-tertiary);">暂无自定义订阅源，在上方输入源名称与 RSS 地址即可订阅并破茧</span>`;
        } else {
          customFeeds.forEach(feed => {
            const tag = document.createElement("span");
            tag.className = "custom-feed-tag";
            tag.innerHTML = `
              <span>📡 ${feed.name}</span>
              <button class="custom-feed-del" title="取消订阅并移除">✕</button>
            `;
            const delBtn = tag.querySelector(".custom-feed-del");
            delBtn.addEventListener("click", async () => {
              await window.dailyToolsSyncEngine.removeCustomFeed(feed.id);
              this.showToast(`已取消订阅《${feed.name}》`);
              renderNewsSettings();
              this.renderHomeSubchannelPills();
              this.renderHomeWideCards();
            });
            feedsList.appendChild(tag);
          });
        }
      }
    };

    // 绑定添加自定义 RSS 订阅源按钮
    const addRssBtn = document.getElementById("addCustomRssBtn");
    const customRssName = document.getElementById("customRssName");
    const customRssUrl = document.getElementById("customRssUrl");

    if (addRssBtn && customRssName && customRssUrl) {
      const handleAddRss = async () => {
        const name = customRssName.value.trim();
        const url = customRssUrl.value.trim();
        if (!name) {
          this.showToast("请输入自定义订阅源的名称 (如：InfoQ 深度 / 36氪)");
          customRssName.focus();
          return;
        }
        if (!url || !/^https?:\/\//i.test(url)) {
          this.showToast("请输入合法的 RSS / Atom 地址 (以 http:// 或 https:// 开头)");
          customRssUrl.focus();
          return;
        }

        addRssBtn.disabled = true;
        addRssBtn.textContent = "订阅中...";
        try {
          await window.dailyToolsSyncEngine.addCustomFeed(name, url);
          customRssName.value = "";
          customRssUrl.value = "";
          this.showToast(`🎉 成功订阅《${name}》！正在后台抓取首批资讯...`);
          renderNewsSettings();
          this.renderHomeSubchannelPills();

          // 后台触发一次抓取
          window.dailyToolsSyncEngine.syncDailyTools(true).then(() => {
            this.renderHomeWideCards();
          });
        } catch (e) {
          this.showToast("添加自定义订阅失败: " + e.message);
        } finally {
          addRssBtn.disabled = false;
          addRssBtn.textContent = "＋ 订阅并破茧";
        }
      };

      addRssBtn.addEventListener("click", handleAddRss);
      customRssUrl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleAddRss();
      });
    }
  }

  // 全局快捷键
  initGlobalKeys() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
        document.getElementById("enginePopover").classList.remove("open");
        document.getElementById("engineTrigger").classList.remove("open");
        return;
      }

      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.focus();
      }
    });
  }

  // Toast 弹窗通知
  showToast(message) {
    let toast = document.getElementById("toastNotice");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toastNotice";
      toast.className = "toast-notice";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }
}

// 导出全局单例
window.appController = new AppController();

// DOM 加载就绪后启动全部子系统
document.addEventListener("DOMContentLoaded", async () => {
  if (window.aiService) {
    await window.aiService.init();
  }
  await window.wallpaperEngine.init();
  await window.shortcutsManager.init();
  if (window.dailyToolsSyncEngine) {
    await window.dailyToolsSyncEngine.init();
  }
  await window.appController.init();
});
