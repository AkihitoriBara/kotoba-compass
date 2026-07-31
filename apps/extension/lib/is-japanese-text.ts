const japaneseCharacterPattern =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff66-\uff9f]/u;
function isJapaneseText(text: string): boolean {
  return japaneseCharacterPattern.test(text);
}
export { isJapaneseText };
