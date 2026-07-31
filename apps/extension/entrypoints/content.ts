import {
  isGetSelectedTextMessage,
  type GetSelectedTextResponse,
} from '../lib/selection-messages';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener(
      (message: unknown): Promise<GetSelectedTextResponse> | undefined => {
        if (!isGetSelectedTextMessage(message)) return undefined;

        return Promise.resolve({ selectedText: window.getSelection()?.toString().trim() ?? '' });
      },
    );
  },
});

