const selectedTextStorageKey = 'kotoba-compass:selected-text';
async function getStoredSelectedText(): Promise<string> {
  const stored = await browser.storage.local.get(selectedTextStorageKey);
  const value = stored[selectedTextStorageKey];
  return typeof value === 'string' ? value : '';
}
async function storeSelectedText(selectedText: string): Promise<void> {
  await browser.storage.local.set({ [selectedTextStorageKey]: selectedText });
}
export { getStoredSelectedText, storeSelectedText };
