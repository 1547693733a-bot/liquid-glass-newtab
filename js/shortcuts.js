/**
 * Liquid Tab - 首页快捷方式管理系统
 * 负责快捷方式的增删改查、图标智能识别、本地持久化及与工具库一键联动
 */

// 首次安装预置的经典高质量快捷方式
const DEFAULT_SHORTCUTS = [
  {
    id: "sc-deepseek",
    title: "DeepSeek",
    url: "https://chat.deepseek.com",
    customIcon: ""
  },
  {
    id: "sc-github",
    title: "GitHub",
    url: "https://github.com",
    customIcon: ""
  },
  {
    id: "sc-bilibili",
    title: "哔哩哔哩",
    url: "https://www.bilibili.com",
    customIcon: ""
  },
  {
    id: "sc-youtube",
    title: "YouTube",
    url: "https://www.youtube.com",
    customIcon: ""
  },
  {
    id: "sc-sspai",
    title: "少数派",
    url: "https://sspai.com",
    customIcon: ""
  },
  {
    id: "sc-v2ex",
    title: "V2EX",
    url: "https://www.v2ex.com",
    customIcon: ""
  },
  {
    id: "sc-zhihu",
    title: "知乎",
    url: "https://www.zhihu.com",
    customIcon: ""
  },
  {
    id: "sc-notion",
    title: "Notion",
    url: "https://www.notion.so",
    customIcon: ""
  }
];

class ShortcutsManager {
  constructor() {
    this.shortcuts = [];
    this.container = document.getElementById("shortcutsGrid");
    this.countPill = document.getElementById("shortcutsCountPill");
    this.openInNewTab = true; // 默认新标签页打开
  }

  async init() {
    await this.loadShortcuts();
    this.render();
  }

  // 加载数据
  async loadShortcuts() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(["userShortcuts", "openInNewTab"]);
        if (data.userShortcuts && Array.isArray(data.userShortcuts)) {
          this.shortcuts = data.userShortcuts;
        } else {
          this.shortcuts = [...DEFAULT_SHORTCUTS];
          await this.saveShortcuts();
        }
        if (data.openInNewTab !== undefined) {
          this.openInNewTab = data.openInNewTab;
        }
      } else {
        const saved = localStorage.getItem("liquid_shortcuts");
        if (saved) {
          this.shortcuts = JSON.parse(saved);
        } else {
          this.shortcuts = [...DEFAULT_SHORTCUTS];
          this.saveShortcuts();
        }
        const savedNewTab = localStorage.getItem("liquid_openInNewTab");
        if (savedNewTab !== null) {
          this.openInNewTab = JSON.parse(savedNewTab);
        }
      }
    } catch (e) {
      console.warn("读取快捷方式失败，载入默认列表:", e);
      this.shortcuts = [...DEFAULT_SHORTCUTS];
    }
  }

  // 持久化保存
  async saveShortcuts() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          userShortcuts: this.shortcuts,
          openInNewTab: this.openInNewTab
        });
      } else {
        localStorage.setItem("liquid_shortcuts", JSON.stringify(this.shortcuts));
        localStorage.setItem("liquid_openInNewTab", JSON.stringify(this.openInNewTab));
      }
    } catch (e) {
      console.error("保存快捷方式失败:", e);
    }
  }

  // 获取 URL 域名
  extractDomain(rawUrl) {
    try {
      let u = rawUrl.trim();
      if (!u.startsWith("http://") && !u.startsWith("https://")) {
        u = "https://" + u;
      }
      return new URL(u).hostname;
    } catch (e) {
      return "";
    }
  }

  // 格式化标准 URL
  formatUrl(rawUrl) {
    let u = rawUrl.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      u = "https://" + u;
    }
    return u;
  }

  // 获取 Favicon 链接
  getFaviconUrl(url, customIcon) {
    if (customIcon && customIcon.trim()) {
      return customIcon.trim();
    }
    const domain = this.extractDomain(url);
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  // 判断是否已存在
  hasShortcut(url) {
    const domain = this.extractDomain(url);
    if (!domain) return false;
    return this.shortcuts.some(s => this.extractDomain(s.url) === domain);
  }

  // 添加快捷方式
  async addShortcut({ title, url, customIcon = "" }) {
    if (!url) return false;
    const formattedUrl = this.formatUrl(url);
    const domain = this.extractDomain(formattedUrl);
    
    // 若未填写标题，尝试从域名生成一个简洁的名字
    let finalTitle = title ? title.trim() : "";
    if (!finalTitle && domain) {
      const parts = domain.replace(/^www\./, "").split(".");
      finalTitle = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }

    const item = {
      id: "sc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      title: finalTitle || "新网页",
      url: formattedUrl,
      customIcon: customIcon ? customIcon.trim() : ""
    };

    this.shortcuts.push(item);
    await this.saveShortcuts();
    this.render();
    return true;
  }

  // 更新快捷方式
  async updateShortcut(id, { title, url, customIcon = "" }) {
    const idx = this.shortcuts.findIndex(s => s.id === id);
    if (idx === -1) return false;

    this.shortcuts[idx] = {
      ...this.shortcuts[idx],
      title: title.trim(),
      url: this.formatUrl(url),
      customIcon: customIcon ? customIcon.trim() : ""
    };

    await this.saveShortcuts();
    this.render();
    return true;
  }

  // 删除快捷方式
  async removeShortcut(id) {
    this.shortcuts = this.shortcuts.filter(s => s.id !== id);
    await this.saveShortcuts();
    this.render();
  }

  // 渲染快捷方式网格
  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    // 更新快捷方式站点数量
    const countPill = document.getElementById("shortcutsCountPill");
    if (countPill) {
      countPill.textContent = `${this.shortcuts.length} 个站点`;
    }

    // 渲染已有快捷方式
    this.shortcuts.forEach(item => {
      const card = document.createElement("a");
      card.className = "shortcut-card";
      card.href = item.url;
      card.setAttribute("target", this.openInNewTab ? "_blank" : "_self");
      card.setAttribute("rel", "noopener noreferrer");
      card.dataset.id = item.id;

      const faviconUrl = this.getFaviconUrl(item.url, item.customIcon);
      const firstLetter = (item.title || "W").trim().charAt(0).toUpperCase();

      card.innerHTML = `
        <div class="shortcut-icon-wrapper">
          <div class="shortcut-actions">
            <button class="shortcut-action-btn edit-btn" title="编辑" data-action="edit" data-id="${item.id}">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="shortcut-action-btn delete-btn" title="删除" data-action="delete" data-id="${item.id}">
              <svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <img class="shortcut-icon-img" src="${faviconUrl}" alt="${item.title}" loading="lazy" />
        </div>
        <span class="shortcut-title" title="${item.title}">${item.title}</span>
      `;

      // 图标加载失败时优雅降级为液态渐变文字首字母
      const img = card.querySelector(".shortcut-icon-img");
      img.onerror = () => {
        img.remove();
        const avatar = document.createElement("div");
        avatar.className = "shortcut-text-avatar";
        avatar.textContent = firstLetter;
        card.querySelector(".shortcut-icon-wrapper").appendChild(avatar);
      };

      this.container.appendChild(card);
    });

    // 渲染 "+" 添加卡片
    const addCard = document.createElement("div");
    addCard.className = "shortcut-card add-card";
    addCard.title = "添加新快捷方式";
    addCard.innerHTML = `
      <div class="shortcut-icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <span class="shortcut-title">添加</span>
    `;
    addCard.addEventListener("click", () => {
      window.appController.openShortcutModal();
    });
    this.container.appendChild(addCard);

    // 绑定卡片上的编辑与删除点击事件（阻止链接跳转）
    this.container.querySelectorAll(".shortcut-action-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === "delete") {
          this.removeShortcut(id);
          window.appController.showToast("已删除快捷方式");
        } else if (action === "edit") {
          const item = this.shortcuts.find(s => s.id === id);
          if (item) {
            window.appController.openShortcutModal(item);
          }
        }
      });
    });
  }
}

// 导出全局单例
window.shortcutsManager = new ShortcutsManager();
