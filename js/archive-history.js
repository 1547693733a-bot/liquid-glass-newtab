/**
 * Liquid Tab - 历史足迹与稍后使用暂存归档系统 (Archive & Discovery History Vault)
 * 解决用户“现在用不到、但万一今后要用到”的网站收纳痛点，同时提供全网发现的历史时间线
 */

class ArchiveHistoryManager {
  constructor() {
    this.storageKey = "liquid_archive_vault_v1";
    this.savedItems = [];    // 用户主动收藏归档、以备今后使用的网站库
    this.historyItems = [];  // 全网动态与资讯发现的自动历史时间线 (自动沉淀)
    this.maxHistoryCount = 800; // 最多保留 800 条历史足迹
    this.initialized = false;
  }

  async init() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(this.storageKey);
        if (data && data[this.storageKey]) {
          const vault = data[this.storageKey];
          this.savedItems = Array.isArray(vault.savedItems) ? vault.savedItems : [];
          this.historyItems = Array.isArray(vault.historyItems) ? vault.historyItems : [];
        }
      } else if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const vault = JSON.parse(raw);
          this.savedItems = Array.isArray(vault.savedItems) ? vault.savedItems : [];
          this.historyItems = Array.isArray(vault.historyItems) ? vault.historyItems : [];
        }
      }
    } catch (e) {
      console.warn("读取历史与归档暂存库异常:", e);
    }
    this.initialized = true;
    this.updateCountBadge();
    return this;
  }

  async saveToStorage() {
    const payload = {
      savedItems: this.savedItems,
      historyItems: this.historyItems.slice(0, this.maxHistoryCount),
      lastUpdated: Date.now()
    };
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.storageKey]: payload });
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(payload));
      }
    } catch (e) {
      console.error("保存历史与暂存库失败:", e);
    }
    this.updateCountBadge();
    window.dispatchEvent(new CustomEvent("archiveVaultUpdated"));
  }

  // 格式化当前日期时间 (YYYY-MM-DD HH:mm)
  formatDateTime(ts = Date.now()) {
    const d = new Date(ts);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    const hr = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yr}-${mo}-${da} ${hr}:${mi}`;
  }

  // 判断指定网址是否已被存入“稍后使用暂存箱”
  isSaved(url) {
    if (!url) return false;
    const clean = url.trim().toLowerCase().replace(/\/+$/, "");
    return this.savedItems.some(i => i.url.trim().toLowerCase().replace(/\/+$/, "") === clean);
  }

  // 存入稍后使用暂存箱
  async saveItem(item, note = "") {
    if (!item || !item.url) return false;
    if (this.isSaved(item.url)) return true;

    const entry = {
      id: item.id || `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: item.name || item.title || "未命名网站",
      titleZh: item.titleZh || "",
      desc: item.descZh || item.desc || "",
      descZh: item.descZh || item.desc || "",
      url: item.url,
      sourceType: item.sourceType || "手动收藏",
      badge: item.badge || "已暂存",
      highlights: Array.isArray(item.highlights) ? item.highlights : ["⭐ 稍后使用"],
      savedAt: Date.now(),
      savedTimeText: this.formatDateTime(),
      note: note
    };

    this.savedItems.unshift(entry);
    await this.saveToStorage();
    return true;
  }

  // 从稍后使用暂存箱移除
  async unsaveItem(url) {
    if (!url) return false;
    const clean = url.trim().toLowerCase().replace(/\/+$/, "");
    const beforeCount = this.savedItems.length;
    this.savedItems = this.savedItems.filter(i => i.url.trim().toLowerCase().replace(/\/+$/, "") !== clean);
    if (this.savedItems.length !== beforeCount) {
      await this.saveToStorage();
      return true;
    }
    return false;
  }

  // 切换暂存状态
  async toggleSave(item) {
    if (!item || !item.url) return false;
    if (this.isSaved(item.url)) {
      await this.unsaveItem(item.url);
      return false; // 代表当前已取消
    } else {
      await this.saveItem(item);
      return true; // 代表当前已暂存
    }
  }

  // 批量自动沉淀全网发现至历史时间线 (自动去重并保留最新)
  async recordHistory(items) {
    if (!Array.isArray(items) || items.length === 0) return;
    let added = 0;
    const now = Date.now();
    const timeText = this.formatDateTime(now);

    // 构建现有 url 映射
    const existingMap = new Map();
    this.historyItems.forEach((h, index) => {
      const cleanUrl = (h.url || "").trim().toLowerCase().replace(/\/+$/, "");
      if (cleanUrl) existingMap.set(cleanUrl, index);
    });

    for (const it of items) {
      if (!it || !it.url) continue;
      const cleanUrl = it.url.trim().toLowerCase().replace(/\/+$/, "");
      if (!cleanUrl) continue;

      const record = {
        id: it.id || `hist-${now}-${Math.random().toString(36).slice(2, 7)}`,
        name: it.name || it.title || "未知项目",
        titleZh: it.titleZh || "",
        desc: it.descZh || it.desc || "",
        descZh: it.descZh || it.desc || "",
        url: it.url,
        sourceType: it.sourceType || "每日发现",
        badge: it.badge || "全网发现",
        highlights: Array.isArray(it.highlights) ? it.highlights : [],
        discoveredAt: now,
        discoveredTimeText: it.pubDate || timeText
      };

      if (existingMap.has(cleanUrl)) {
        // 更新已有记录的最新发现时间与描述
        const idx = existingMap.get(cleanUrl);
        this.historyItems[idx] = { ...this.historyItems[idx], ...record };
      } else {
        this.historyItems.unshift(record);
        existingMap.set(cleanUrl, 0);
        added++;
      }
    }

    if (this.historyItems.length > this.maxHistoryCount) {
      this.historyItems = this.historyItems.slice(0, this.maxHistoryCount);
    }

    await this.saveToStorage();
  }

  // 筛选获取“稍后使用”项目
  getSavedList(query = "", source = "all") {
    let list = this.savedItems;
    if (source && source !== "all") {
      list = list.filter(i => (i.sourceType || "").toLowerCase() === source.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(i =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.titleZh && i.titleZh.toLowerCase().includes(q)) ||
        (i.desc && i.desc.toLowerCase().includes(q)) ||
        (i.url && i.url.toLowerCase().includes(q)) ||
        (i.note && i.note.toLowerCase().includes(q))
      );
    }
    return list;
  }

  // 筛选获取“历史足迹”时间线
  getHistoryList(query = "", source = "all") {
    let list = this.historyItems;
    if (source && source !== "all") {
      list = list.filter(i => (i.sourceType || "").toLowerCase() === source.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(i =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.titleZh && i.titleZh.toLowerCase().includes(q)) ||
        (i.desc && i.desc.toLowerCase().includes(q)) ||
        (i.url && i.url.toLowerCase().includes(q))
      );
    }
    return list;
  }

  // 清空历史足迹 (保留用户的稍后使用)
  async clearHistory() {
    this.historyItems = [];
    await this.saveToStorage();
  }

  // 更新顶栏角标数量
  updateCountBadge() {
    if (typeof document === "undefined") return;
    const badge = document.getElementById("archiveCountBadge");
    if (!badge) return;
    const count = this.savedItems.length;
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : count;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  }

  // 导出归档为 JSON
  exportAsJson() {
    const data = {
      exportTime: this.formatDateTime(),
      count: this.savedItems.length,
      savedItems: this.savedItems
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LiquidTab_Saved_Archive_${this.formatDateTime().replace(/[: ]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 导出为 HTML 书签格式
  exportAsHtml() {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Liquid Tab 稍后使用归档书签</TITLE>
<H1>Liquid Tab 暂存归档</H1>
<DL><p>
`;
    this.savedItems.forEach(item => {
      const title = item.titleZh ? `${item.name} (${item.titleZh})` : item.name;
      html += `    <DT><A HREF="${item.url}" ADD_DATE="${Math.floor((item.savedAt || Date.now()) / 1000)}">${title}</A>\n`;
      if (item.desc) {
        html += `    <DD>${item.desc}\n`;
      }
    });
    html += `</DL><p>\n`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LiquidTab_Bookmarks_${this.formatDateTime().replace(/[: ]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// 导出全局单例
window.archiveManager = new ArchiveHistoryManager();
