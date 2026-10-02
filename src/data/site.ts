import data from './projects.json';

export type Locale = 'en' | 'zh-cn';
export const projects = data;
export type Project = (typeof projects)[number];
export const locales: Locale[] = ['en', 'zh-cn'];
export const localePath = (lang: Locale, path = '/') => `${lang === 'en' ? '' : '/zh-cn'}${path}`;
export const repository = (project: Project) => `https://github.com/caelis-labs/${project.id}`;
export const getLocale = (path: string): Locale => path.startsWith('/zh-cn/') ? 'zh-cn' : 'en';
export const alternatePath = (path: string) => path.startsWith('/zh-cn/') ? path.slice(6) || '/' : `/zh-cn${path}`;
export const statusLabel = (project: Project, lang: Locale) => ({
  release: { en: 'Open source', 'zh-cn': '开源项目' },
  preview: { en: 'Preview', 'zh-cn': '预览版' },
  beta: { en: 'Early beta', 'zh-cn': '早期 Beta' },
}[project.status as 'release' | 'preview' | 'beta'][lang]);

export const ui = {
  en: {
    projects: 'Projects', docs: 'Documentation', github: 'GitHub', theme: 'Switch theme', menu: 'Open navigation', close: 'Close navigation',
    skip: 'Skip to content', all: 'All projects', explore: 'Explore projects', readDocs: 'Read the docs', learn: 'Explore the project',
    heroLine1: 'Open tools.', heroLine2: 'Connected intelligence.',
    intro: 'A workspace to collaborate. A companion to keep close. Building blocks to make them your own.',
    eyebrow: 'INDEPENDENT TOOLS. SHARED POSSIBILITIES.',
    collection: 'A small constellation.', collectionSub: 'Find your starting point.',
    collectionText: 'Five open projects, each with a purpose. Use them on their own, or bring them together.',
    watch: 'Watch the collaboration', featured: '01 / THE WORKSPACE', botFeature: '02 / THE COMPANION',
    botNote: 'macOS · Apple Silicon', building: 'Tools for what comes next.',
    buildingSub: 'Open protocols. Reusable foundations.',
    docsTitle: 'From curious to creating.', docsText: 'Find your project, follow a guide, and make the first connection.', docsCta: 'Find your starting point',
    footerLine: 'Open tools. Shared possibilities.', footerNote: 'Code is open source. Character assets have their own license.',
    installation: 'Get started', source: 'Source code', release: 'Releases', latestRelease: 'Latest release', copy: 'Copy command', copied: 'Copied', failed: 'Select and copy the command',
    productDocs: 'Project documentation', overview: 'Overview', edit: 'View source', available: 'Available for',
  },
  'zh-cn': {
    projects: '项目', docs: '文档', github: 'GitHub', theme: '切换主题', menu: '打开导航', close: '关闭导航',
    skip: '跳转到正文', all: '所有项目', explore: '探索项目', readDocs: '阅读文档', learn: '了解项目',
    heroLine1: '开放的工具，', heroLine2: '协作的智能。',
    intro: '协同创造的工作空间，陪在身边的桌面伙伴，以及让你自由构建的基础组件。',
    eyebrow: '独立的工具，共同的可能。',
    collection: '群星，各有其光。', collectionSub: '找到你的起点。',
    collectionText: '五个开放项目，各有所长。独立使用，也可以一起创造更多可能。',
    watch: '观看协作演示', featured: '01 / 协作工作空间', botFeature: '02 / 桌面伙伴',
    botNote: '正式版 · Apple Silicon', building: '为下一次创造，做好准备。',
    buildingSub: '开放的协议，可复用的基础。',
    docsTitle: '从好奇，到开始创造。', docsText: '找到适合的项目，跟随指南，建立第一次连接。', docsCta: '找到你的起点',
    footerLine: '开放的工具，共同的可能。', footerNote: '项目代码开源。角色资产适用独立许可。',
    installation: '开始使用', source: '源代码', release: '版本发布', latestRelease: '最新正式版', copy: '复制指令', copied: '已复制', failed: '请选择并复制指令',
    productDocs: '项目文档', overview: '概览', edit: '查看来源', available: '适用平台',
  },
};
