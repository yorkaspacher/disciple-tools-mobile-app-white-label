/*
 * Action Types
 */

export const PUBLIC_GET_SITE_SETTINGS = 'PUBLIC_GET_SITE_SETTINGS';
export const PUBLIC_GET_SITE_SETTINGS_START = 'PUBLIC_GET_SITE_SETTINGS_START';
export const PUBLIC_GET_SITE_SETTINGS_SUCCESS = 'PUBLIC_GET_SITE_SETTINGS_SUCCESS';
export const PUBLIC_GET_SITE_SETTINGS_RESPONSE = 'PUBLIC_GET_SITE_SETTINGS_RESPONSE';
export const PUBLIC_GET_SITE_SETTINGS_FAILURE = 'PUBLIC_GET_SITE_SETTINGS_FAILURE';

export const PUBLIC_CLEAR_SITE_SETTINGS = 'PUBLIC_CLEAR_SITE_SETTINGS';

export const PUBLIC_GET_O365_TOKEN = 'PUBLIC_GET_O365_TOKEN';
export const PUBLIC_GET_O365_TOKEN_START = 'PUBLIC_GET_O365_TOKEN_START';
export const PUBLIC_GET_O365_TOKEN_SUCCESS = 'PUBLIC_GET_O365_TOKEN_SUCCESS';
export const PUBLIC_GET_O365_TOKEN_RESPONSE = 'PUBLIC_GET_O365_TOKEN_RESPONSE';
export const PUBLIC_GET_O365_TOKEN_FAILURE = 'PUBLIC_GET_O365_TOKEN_FAILURE';

/*
 * Action Creators
 */
/**
 *
 * @param {*} domain
 */
export function getSiteSettings(domain) {
  return {
    type: PUBLIC_GET_SITE_SETTINGS,
    domain,
  };
}

export function clearSiteSettings() {
  return {
    type: PUBLIC_CLEAR_SITE_SETTINGS,
  };
}

export function getO365Token({ url, params }) {
  return {
    type: PUBLIC_GET_O365_TOKEN,
    url,
    params,
  };
}
