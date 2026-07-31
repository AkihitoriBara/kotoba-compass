import { useCallback, useEffect, useState } from 'react';
import {
  createGetSelectedTextMessage,
  type GetSelectedTextResponse,
} from '../lib/selection-messages';

type SelectedTextState = {
  error: string | null;
  loading: boolean;
  selectedText: string | null;
};

const initialState: SelectedTextState = {
  error: null,
  loading: true,
  selectedText: null,
};

function isRestrictedPage(url: string | undefined) {
  return /^(about|brave|chrome|edge|moz-extension|opera|vivaldi):/i.test(
    url ?? '',
  );
}

function useSelectedText() {
  const [state, setState] = useState<SelectedTextState>(initialState);
  const refresh = useCallback(async () => {
    setState({ error: null, loading: true, selectedText: null });
    try {
      const [activeTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!activeTab?.id) throw new Error('Unable to access the current tab.');
      if (isRestrictedPage(activeTab.url))
        throw new Error('This page does not allow browser extensions.');
      const response = (await browser.tabs.sendMessage(
        activeTab.id,
        createGetSelectedTextMessage(),
      )) as GetSelectedTextResponse;
      setState({
        error: null,
        loading: false,
        selectedText: response.selectedText || null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const knownErrors = [
        'Unable to access the current tab.',
        'This page does not allow browser extensions.',
      ];
      setState({
        error: knownErrors.includes(message)
          ? message
          : 'Unable to retrieve selected text. Please try again.',
        loading: false,
        selectedText: null,
      });
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { ...state, refresh };
}

export { useSelectedText };
