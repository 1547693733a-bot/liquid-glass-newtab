/**
 * Liquid Tab - 浏览器书签栏集成模块
 * 负责与 Chrome Bookmarks API 通信，读取、搜索、一键导入书签到主页快捷方式
 */

class BookmarksManager {
  constructor() {
    this.bookmarksList = [];
    this.isDemo = false;
  }

  // 初始化并加载浏览器书签数据
  async loadBookmarks() {
    if (window.chrome && chrome.bookmarks && chrome.bookmarks.getTree) {
      try {
        const tree = await chrome.bookmarks.getTree();
        this.bookmarksList = this.flattenTree(tree);
        this.isDemo = false;
        return this.bookmarksList;
      } catch (err) {
        console.warn("读取 Chrome 书签失败，回退至演示模式:", err);
        return this.loadFallbackBookmarks();
      }
    } else {
      // 本地文件预览模式 (file:// 或未分配权限时)
      return this.loadFallbackBookmarks();
    }
  }

  // 递归展平书签树结构
  flattenTree(nodes, parentTitle = "书签栏") {
    let result = [];
    for (const node of nodes) {
      const currentFolder = node.title || parentTitle;
      if (node.url) {
        // 是一个有效网页书签
        result.push({
          id: node.id,
          title: node.title || node.url,
          url: node.url,
          folder: parentTitle || "书签栏",
          dateAdded: node.dateAdded || 0
        });
      }
      if (node.children && node.children.length > 0) {
        result = result.concat(this.flattenTree(node.children, currentFolder));
      }
    }
    return result;
  }

  // 本地预览/免权限环境下的演示与预置书签
  loadFallbackBookmarks() {
    this.isDemo = true;
    this.bookmarksList = [
      { id: "bm-1", title: "GitHub - Build from here", url: "https://github.com", folder: "常用技术" },
      { id: "bm-2", title: "哔哩哔哩 (゜-゜)つロ 干杯~", url: "https://www.bilibili.com", folder: "影音娱乐" },
      { id: "bm-3", title: "少数派 - 高效工作，品质生活", url: "https://sspai.com", folder: "日常阅读" },
      { id: "bm-4", title: "DeepSeek 深度求索官方对话", url: "https://chat.deepseek.com", folder: "AI 工具" },
      { id: "bm-5", title: "V2EX 程序员与极客社区", url: "https://www.v2ex.com", folder: "技术社区" },
      { id: "bm-6", title: "知乎 - 有问题，就会有答案", url: "https://www.zhihu.com", folder: "日常阅读" },
      { id: "bm-7", title: "Figma: the collaborative interface design tool", url: "https://www.figma.com", folder: "设计工作" },
      { id: "bm-8", title: "Notion – One workspace. Every team.", url: "https://www.notion.so", folder: "笔记整理" },
      { id: "bm-9", title: "YouTube 全球视频分享平台", url: "https://www.youtube.com", folder: "影音娱乐" },
      { id: "bm-10", title: "MDN Web Docs 开发者文档", url: "https://developer.mozilla.org", folder: "常用技术" }
    ];
    return this.bookmarksList;
  }

  // 搜索书签
  search(keyword = "") {
    const q = keyword.trim().toLowerCase();
    if (!q) return this.bookmarksList;
    return this.bookmarksList.filter(bm => 
      bm.title.toLowerCase().includes(q) || 
      bm.url.toLowerCase().includes(q) ||
      (bm.folder && bm.folder.toLowerCase().includes(q))
    );
  }

  // 导入单个书签到快捷方式
  async importToHomepage(bookmark) {
    if (!bookmark || !bookmark.url) return false;
    const added = await window.shortcutsManager.addShortcut({
      title: bookmark.title,
      url: bookmark.url
    });
    return added;
  }

  // 批量导入书签栏常用项目
  async batchImportTop(limit = 8) {
    let count = 0;
    for (const bm of this.bookmarksList) {
      if (!window.shortcutsManager.hasShortcut(bm.url)) {
        await window.shortcutsManager.addShortcut({
          title: bm.title,
          url: bm.url
        });
        count++;
        if (count >= limit) break;
      }
    }
    return count;
  }
}

// 导出全局单例
window.bookmarksManager = new BookmarksManager();
