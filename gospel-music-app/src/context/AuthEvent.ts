// src/context/AuthEvent.ts
type LogoutCallback = () => void;
let _globalLogout: LogoutCallback | null = null;

export const setGlobalLogout = (callback: LogoutCallback) => {
  _globalLogout = callback;
};

export const triggerGlobalLogout = () => {
  if (_globalLogout) _globalLogout();
};
