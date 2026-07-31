const getSelectedTextMessageType = 'kotoba-compass:get-selected-text';

type GetSelectedTextMessage = {
  type: typeof getSelectedTextMessageType;
};

type GetSelectedTextResponse = {
  selectedText: string;
};

function createGetSelectedTextMessage(): GetSelectedTextMessage {
  return { type: getSelectedTextMessageType };
}

function isGetSelectedTextMessage(
  message: unknown,
): message is GetSelectedTextMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === getSelectedTextMessageType
  );
}

export {
  createGetSelectedTextMessage,
  isGetSelectedTextMessage,
  type GetSelectedTextResponse,
};
