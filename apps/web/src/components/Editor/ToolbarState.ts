// 外链转脚注开关状态（全局，供复制服务使用）
let linkToFootnoteEnabled = false;

export function getLinkToFootnoteEnabled() {
  return linkToFootnoteEnabled;
}

export function setLinkToFootnoteEnabled(enabled: boolean) {
  linkToFootnoteEnabled = enabled;
}
