import axios from "axios";

// Android (OkHttp) keeps idle connections in a pool. When the server/Cloudflare has already closed
// one, or the device switched Wi-Fi <-> mobile data / came back from background, the next request
// sent on it fails right away with axios "Network Error" (no response). A second attempt opens a
// fresh connection and succeeds - that is why "login again" works. Retry once automatically.
//
// Only GET/HEAD are retried by default. Other methods must opt in with `retryOnNetworkError: true`
// in the request config, because a lost response does not prove the server did not process it
// (e.g. wallet deposit/withdraw must never be sent twice).
const RETRY_DELAY = 600;

export const isNetworkError = (error) =>
    !!error && !error.response && error.code === 'ERR_NETWORK';

let installed = false;

export const installNetworkRetry = () => {
    if (installed) return;
    installed = true;

    axios.interceptors.response.use(undefined, async (error) => {
        const config = error?.config;
        if (!config || config.__networkRetried || !isNetworkError(error)) {
            return Promise.reject(error);
        }
        const method = (config.method || 'get').toLowerCase();
        if (method !== 'get' && method !== 'head' && !config.retryOnNetworkError) {
            return Promise.reject(error);
        }
        config.__networkRetried = true;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return axios.request(config);
    });
};

installNetworkRetry();
