import ReactDOM, { type Root } from 'react-dom/client';
import { ContentApp } from '../components/content-app';
import '../assets/tailwind.css';
import {
  isGetSelectedTextMessage,
  type GetSelectedTextResponse,
} from '../lib/selection-messages';


export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    // 1. Respond to popup messaging queries for selection
    browser.runtime.onMessage.addListener(
      (message: unknown): Promise<GetSelectedTextResponse> | undefined => {
        if (!isGetSelectedTextMessage(message)) return undefined;

        return Promise.resolve({
          selectedText: window.getSelection()?.toString().trim() ?? '',
        });
      },
    );

    // 2. Initialize in-page React shadow root UI
    const ui = await createShadowRootUi(ctx, {
      name: 'kotoba-compass-shadow-host',
      position: 'inline',
      anchor: 'body',
      onMount: (container: HTMLElement) => {
        const wrapper = document.createElement('div');
        container.append(wrapper);
        const root = ReactDOM.createRoot(wrapper);
        root.render(<ContentApp />);
        return root;
      },
      onRemove: (root: Root | undefined) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});

