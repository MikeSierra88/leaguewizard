import { ManagementClient } from 'auth0';

const { AUTH0_ISSUER_BASE_URL_WITHOUT_HTTPS, AUTH0_API_CLIENT_ID, AUTH0_API_CLIENT_SECRET } = process.env;

/**
 * Global is used here to maintain a cached management client across hot reloads
 * in development. This prevents creating a new management client every time
 * during API Route usage.
 */

let managementClient: ManagementClient = global.auth0ManagementClient;

if (!managementClient) {
  managementClient = global.auth0ManagementClient = null;
}

/**
 * Returns an auth0 Management Client from cache if exists, or creates one.
 */
export const getManagementClient = async () => {
  if (!AUTH0_ISSUER_BASE_URL_WITHOUT_HTTPS || !AUTH0_API_CLIENT_ID || !AUTH0_API_CLIENT_SECRET) {
    console.error('Please provide Auth0 credentials to use the Management API');
    return null;
  }

  if (!managementClient) {
    managementClient = global.auth0ManagementClient = new ManagementClient({
      domain: AUTH0_ISSUER_BASE_URL_WITHOUT_HTTPS,
      clientId: AUTH0_API_CLIENT_ID,
      clientSecret: AUTH0_API_CLIENT_SECRET,
      scope: 'read:users update:users delete:users',
    });
  }

  return managementClient;
};
