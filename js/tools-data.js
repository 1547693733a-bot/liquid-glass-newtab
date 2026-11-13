/**
 * 精选优质工具与实用网址数据库
 * 分类清晰，涵盖 AI 效率、开发、设计、媒体、常用实用工具、学习等
 */
const CURATED_TOOLS = [
  // --- 🤖 AI 智能与效率 ---
  {
    id: "tool-deepseek",
    name: "DeepSeek",
    desc: "国产顶尖开源推理模型，逻辑推理与代码表现极佳",
    url: "https://chat.deepseek.com",
    category: "ai",
    badge: "热门"
  },
  {
    id: "tool-chatgpt",
    name: "ChatGPT",
    desc: "OpenAI 旗舰生成式 AI 助手，强大的多模态与日常工作效率神器",
    url: "https://chatgpt.com",
    category: "ai",
    badge: "推荐"
  },
  {
    id: "tool-claude",
    name: "Claude",
    desc: "Anthropic 出品，代码理解、写作润色与超长文档分析极具优势",
    url: "https://claude.ai",
    category: "ai"
  },
  {
    id: "tool-kimi",
    name: "Kimi 智能助手",
    desc: "月之暗面长文本大模型，擅长超长文件研读与学术搜索",
    url: "https://kimi.moonshot.cn",
    category: "ai"
  },
  {
    id: "tool-perplexity",
    name: "Perplexity AI",
    desc: "下一代智能对话式搜索引擎，提供带有权威引用的精准回答",
    url: "https://www.perplexity.ai",
    category: "ai",
    badge: "搜索"
  },
  {
    id: "tool-v0",
    name: "v0 by Vercel",
    desc: "自然语言生成高质量现代前端 React/Tailwind/HTML 界面",
    url: "https://v0.dev",
    category: "ai"
  },
  {
    id: "tool-huggingface",
    name: "Hugging Face",
    desc: "开源机器学习模型、数据集与 AI 社区中心",
    url: "https://huggingface.co",
    category: "ai"
  },

  // --- 💻 开发者必备 ---
  {
    id: "tool-github",
    name: "GitHub",
    desc: "全球最大的开源代码托管与协作平台",
    url: "https://github.com",
    category: "dev",
    badge: "必备"
  },
  {
    id: "tool-vercel",
    name: "Vercel",
    desc: "前端与全栈应用现代化极速部署云平台",
    url: "https://vercel.com",
    category: "dev"
  },
  {
    id: "tool-mdn",
    name: "MDN Web Docs",
    desc: "权威的前端 Web 技术与标准参考手册（HTML/CSS/JS）",
    url: "https://developer.mozilla.org",
    category: "dev",
    badge: "权威"
  },
  {
    id: "tool-stackoverflow",
    name: "Stack Overflow",
    desc: "全球最大程序员技术问答与疑难排查社区",
    url: "https://stackoverflow.com",
    category: "dev"
  },
  {
    id: "tool-caniuse",
    name: "Can I use",
    desc: "浏览器前端特性与 CSS/JS 兼容性实时查询表",
    url: "https://caniuse.com",
    category: "dev"
  },
  {
    id: "tool-npm",
    name: "npm",
    desc: "Node.js 官方包管理器与开源组件注册表",
    url: "https://www.npmjs.com",
    category: "dev"
  },
  {
    id: "tool-linuxcool",
    name: "Linux 命令速查",
    desc: "全面详尽的 Linux 终端命令在线查询与示例解释",
    url: "https://www.linuxcool.com",
    category: "dev"
  },

  // --- 🎨 创意与设计 ---
  {
    id: "tool-figma",
    name: "Figma",
    desc: "业界首屈一指的协作式 UI/UX 界面原型设计工具",
    url: "https://www.figma.com",
    category: "design",
    badge: "主流"
  },
  {
    id: "tool-dribbble",
    name: "Dribbble",
    desc: "全球顶尖视觉设计师与交互设计师灵感集结地",
    url: "https://dribbble.com",
    category: "design"
  },
  {
    id: "tool-unsplash",
    name: "Unsplash",
    desc: "超高清精选无版权商业级摄影图片库",
    url: "https://unsplash.com",
    category: "design"
  },
  {
    id: "tool-coolors",
    name: "Coolors",
    desc: "极简实用的配色方案生成器与调色板灵感库",
    url: "https://coolors.co",
    category: "design"
  },
  {
    id: "tool-iconfont",
    name: "Iconfont 矢量图标",
    desc: "阿里巴巴矢量图标库，丰富国内图标与 SVG 资源",
    url: "https://www.iconfont.cn",
    category: "design"
  },
  {
    id: "tool-mobbin",
    name: "Mobbin",
    desc: "全球知名 iOS & Android App 真实交互与 UI 设计模式库",
    url: "https://mobbin.com",
    category: "design"
  },

  // --- 📺 媒体与资讯 ---
  {
    id: "tool-bilibili",
    name: "哔哩哔哩 Bilibili",
    desc: "国内年轻人与极客喜爱的视频弹幕与科技知识社区",
    url: "https://www.bilibili.com",
    category: "media",
    badge: "热门"
  },
  {
    id: "tool-youtube",
    name: "YouTube",
    desc: "全球最大的视频平台与高质量技术演讲知识分享地",
    url: "https://www.youtube.com",
    category: "media"
  },
  {
    id: "tool-sspai",
    name: "少数派",
    desc: "高质量数字消费与生产力生活方式指南平台",
    url: "https://sspai.com",
    category: "media",
    badge: "精选"
  },
  {
    id: "tool-v2ex",
    name: "V2EX",
    desc: "程序员、极客与创意工作者汇聚的交流社区",
    url: "https://www.v2ex.com",
    category: "media"
  },
  {
    id: "tool-juejin",
    name: "稀土掘金",
    desc: "国内热门的开发者技术内容社区与前端实践沉淀地",
    url: "https://juejin.cn",
    category: "media"
  },
  {
    id: "tool-producthunt",
    name: "Product Hunt",
    desc: "全球最新科技产品、开源独立项目每日发布榜单",
    url: "https://www.producthunt.com",
    category: "media"
  },

  // --- 🛠️ 效率工具 ---
  {
    id: "tool-notion",
    name: "Notion",
    desc: "集笔记、知识库、项目管理与协作于一体的数字工作台",
    url: "https://www.notion.so",
    category: "tools",
    badge: "推荐"
  },
  {
    id: "tool-tinypng",
    name: "TinyPNG",
    desc: "智能有损压缩 WebP/PNG/JPEG 图片，大幅减小体积",
    url: "https://tinypng.com",
    category: "tools"
  },
  {
    id: "tool-excalidraw",
    name: "Excalidraw",
    desc: "手绘风格的轻量级虚拟白板与流程图绘制工具",
    url: "https://excalidraw.com",
    category: "tools",
    badge: "好用"
  },
  {
    id: "tool-carbon",
    name: "Carbon",
    desc: "创建并分享极高颜值的精美代码截图卡片",
    url: "https://carbon.now.sh",
    category: "tools"
  },
  {
    id: "tool-deepl",
    name: "DeepL 翻译",
    desc: "业界公认语境感知最精准的专业 AI 机器翻译",
    url: "https://www.deepl.com/translator",
    category: "tools"
  },
  {
    id: "tool-cyberchef",
    name: "CyberChef",
    desc: "瑞士军刀般的万能数据编解码、加密解密转换工具",
    url: "https://gchq.github.io/CyberChef",
    category: "tools"
  },
  {
    id: "tool-jsoncn",
    name: "JSON 在线解析",
    desc: "JSON 格式化校验、着色高亮与数据比对工具",
    url: "https://www.json.cn",
    category: "tools"
  },
  {
    id: "tool-speedtest",
    name: "Speedtest",
    desc: "全球知名的网络测速平台，测试实时宽带与延迟",
    url: "https://www.speedtest.net",
    category: "tools"
  },

  // --- 📖 学习与知识 ---
  {
    id: "tool-wikipedia",
    name: "维基百科",
    desc: "自由开放的全球百科全书，人类知识的宝库",
    url: "https://zh.wikipedia.org",
    category: "learn"
  },
  {
    id: "tool-weread",
    name: "微信读书网页版",
    desc: "海量正版优质电子书，随时在浏览器沉浸阅读",
    url: "https://weread.qq.com",
    category: "learn"
  },
  {
    id: "tool-ruanyifeng",
    name: "阮一峰的网络日志",
    desc: "国内知名技术博主，每周科技爱好者周刊与通俗技术教程",
    url: "https://www.ruanyifeng.com/blog",
    category: "learn",
    badge: "周刊"
  },
  {
    id: "tool-coursera",
    name: "Coursera",
    desc: "联合全球顶尖大学的高质量专业在线课程平台",
    url: "https://www.coursera.org",
    category: "learn"
  },

  // --- 🌈 奇趣新探索 (脑洞大开与创意互动) ---
  {
    id: "tool-nealfun",
    name: "Neal.fun 奇趣实验",
    desc: "无限合成、深海下潜探秘、花光比尔盖茨财富等风靡全网的顶级创意互动集合",
    url: "https://neal.fun",
    category: "fun",
    badge: "神仙网站"
  },
  {
    id: "tool-radiogarden",
    name: "Radio Garden",
    desc: "转动 3D 绿色地球仪，实时收听全球数千座城市的本土现场广播电台",
    url: "https://radio.garden",
    category: "fun",
    badge: "全球电台"
  },
  {
    id: "tool-squoosh",
    name: "Squoosh 极速压缩",
    desc: "Google 出品的浏览器无损图片压缩神器，实时双边滑动对比前后极致画质",
    url: "https://squoosh.app",
    category: "fun",
    badge: "谷歌出品"
  },
  {
    id: "tool-infinitecraft",
    name: "Infinite Craft",
    desc: "水火土风四大基础元素，基于 AI 逻辑推演无限无规则合成世间万物",
    url: "https://neal.fun/infinite-craft",
    category: "fun",
    badge: "爆火合成"
  },
  {
    id: "tool-windows93",
    name: "Windows 93",
    desc: "脑洞大开的复古像素风 Web 操作系统，充满极客彩蛋、鬼畜应用与魔性交互",
    url: "https://www.windows93.net",
    category: "fun",
    badge: "复古彩蛋"
  },
  {
    id: "tool-pointerpointer",
    name: "Pointer Pointer",
    desc: "无论你的鼠标停在屏幕哪个像素角落，总能瞬间找到一张真实手指指向该位置的照片",
    url: "https://pointerpointer.com",
    category: "fun",
    badge: "魔性好玩"
  },
  {
    id: "tool-autodraw",
    name: "Google AutoDraw",
    desc: "Google AI 智能画板，随意画几笔凌乱涂鸦即可自动识别并秒变大师级精美矢量图标",
    url: "https://www.autodraw.com",
    category: "fun"
  },
  {
    id: "tool-myfridgefood",
    name: "冰箱食谱魔法师",
    desc: "输入你冰箱里现存的各种食材，一秒为你智能推选能做出的家常美味佳肴",
    url: "https://myfridgefood.com",
    category: "fun"
  },
  {
    id: "tool-shadertoy",
    name: "Shadertoy 视觉特效",
    desc: "全球顶级图形极客聚集地，纯代码着色器实现的震撼 3D 实时动态渲染艺术",
    url: "https://www.shadertoy.com",
    category: "fun",
    badge: "图形极客"
  },
  {
    id: "tool-roadmap",
    name: "Roadmap.sh 技能树",
    desc: "全球最受欢迎的开发者全栈技能成长路线图与知识树导航",
    url: "https://roadmap.sh",
    category: "fun",
    badge: "程序员必备"
  }
];

const TOOL_CATEGORIES = [
  { id: "all", name: "全部精选", icon: "✨" },
  { id: "fun", name: "奇趣探索", icon: "🌈" },
  { id: "ai", name: "人工智能", icon: "🤖" },
  { id: "dev", name: "开发编程", icon: "💻" },
  { id: "design", name: "创意设计", icon: "🎨" },
  { id: "media", name: "资讯媒体", icon: "📺" },
  { id: "tools", name: "实用工具", icon: "🛠️" },
  { id: "learn", name: "学习提升", icon: "📖" }
];

if (typeof window !== "undefined") {
  window.CURATED_TOOLS = CURATED_TOOLS;
  window.TOOL_CATEGORIES = TOOL_CATEGORIES;
}
