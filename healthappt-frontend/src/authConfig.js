// ---------------------------------------------------------------------------
// authConfig.js — tells MSAL (the Microsoft sign-in library) who we are.
// The values come from your "SPA" app registration and your tenant.
// ---------------------------------------------------------------------------

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_SPA_CLIENT_ID,
    // "common" lets anyone with a Microsoft account sign in (any work/school
    // tenant + personal Outlook/Hotmail/Live accounts), not just our directory.
    // To restrict back to only our directory, put ${import.meta.env.VITE_TENANT_ID} here.
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin   // works for both localhost and Azure
  },
  cache: { cacheLocation: 'sessionStorage' }
};

// The permission ("scope") we ask for so our token is accepted by the API.
export const apiRequest = { scopes: [import.meta.env.VITE_API_SCOPE] };
