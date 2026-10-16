import uuid from 'react-native-uuid';
import { getItem, getItemStrict, setItem } from './utils';
import { DEVICE_GUID_KEY, SESSION_LOGIN_AT_KEY } from './constant';

let deviceGUID = null;
let pendingRead = null;

const readOrCreateGUID = async (tries, delay) => {
  for (let i = 0; i < tries; i += 1) {
    try {
      let guid = await getItemStrict(DEVICE_GUID_KEY);
      if (!guid) {
        guid = String(uuid.v4()).toLowerCase();
        await setItem(DEVICE_GUID_KEY, guid);
      }
      deviceGUID = guid;
      return guid;
    } catch (error) {
      if (i < tries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return null;
};

// Stable per-install identifier the server uses to tell this device's sessions apart.
// Resolves null (instead of minting a new one) when the keychain is still unreadable, e.g.
// a cold start from a VoIP push on a locked phone, so the device never reports a fake GUID.
export const getDeviceGUID = async (tries = 5, delay = 300) => {
  if (deviceGUID) return deviceGUID;
  if (!pendingRead) {
    pendingRead = readOrCreateGUID(tries, delay).finally(() => {
      pendingRead = null;
    });
  }
  return pendingRead;
};

// When this device's session was created. Sent with the GUID so the server can tell a new login
// on another device (which logs this one out) from this device reconnecting later.
export const markSessionLogin = () => setItem(SESSION_LOGIN_AT_KEY, String(Date.now()));

// null for sessions created before this was tracked; the server then keeps whichever device it
// already knows.
export const getSessionLoginAt = async () => {
  const value = Number(await getItem(SESSION_LOGIN_AT_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
};
