export const getAAPayloadByMassages = (messages: Array<any> = []) =>
  messages.find(m => m.app === 'data')?.payload || {};
