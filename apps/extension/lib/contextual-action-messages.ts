const openCompanionMessageType = 'kotoba-compass:open-companion';
type OpenCompanionMessage = {
  selectedText: string;
  type: typeof openCompanionMessageType;
};
function createOpenCompanionMessage(
  selectedText: string,
): OpenCompanionMessage {
  return { selectedText, type: openCompanionMessageType };
}
function isOpenCompanionMessage(
  message: unknown,
): message is OpenCompanionMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === openCompanionMessageType &&
    'selectedText' in message &&
    typeof message.selectedText === 'string'
  );
}
export { createOpenCompanionMessage, isOpenCompanionMessage };
