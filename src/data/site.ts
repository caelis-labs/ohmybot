export type Locale = 'en' | 'zh-cn';
export const alternatePath = (path: string) => path.startsWith('/zh-cn/') ? path.slice(6) || '/' : `/zh-cn${path}`;
