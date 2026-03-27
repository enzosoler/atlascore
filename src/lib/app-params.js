const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

// Public Base44 identifiers for Atlas Core production.
// These are safe client-side values and act as a deploy fallback when Vite env vars are missing.
const ATLAS_CORE_BASE44_DEFAULTS = {
	appId: '69b82580c6c8520dcb835843',
	appBaseUrl: 'https://atlascore.base44.app',
};

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `atlas_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('atlas_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", {
			defaultValue: import.meta.env.VITE_BASE44_APP_ID || ATLAS_CORE_BASE44_DEFAULTS.appId
		}),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", {
			defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL || ATLAS_CORE_BASE44_DEFAULTS.appBaseUrl
		}),
	}
}


const _rawParams = getAppParams();

// Final safety net: always ensure appId and appBaseUrl are set,
// even if Vite env vars were not injected at build time and localStorage is empty.
export const appParams = {
	..._rawParams,
	appId: _rawParams.appId || ATLAS_CORE_BASE44_DEFAULTS.appId,
	appBaseUrl: _rawParams.appBaseUrl || ATLAS_CORE_BASE44_DEFAULTS.appBaseUrl,
};

export const hasBase44Config = Boolean(appParams.appId && appParams.appBaseUrl);
