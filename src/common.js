export function api_href(api) {
    return process.env.REACT_APP_API_URL + api
}

export function GetAccessToken(authState) {
    return authState.accessToken.accessToken
}

export function GetIdToken(authState) {
    return authState.idToken.idToken
}

export function decodeToken(token) {
    const jwtBody = token.split('.')[1];
    const base64 = jwtBody.replace('-', '+').replace('_', '/');
    const decodedJwt = Buffer.from(base64, 'base64');
    var idTokenJSON = JSON.parse(decodedJwt);
    return idTokenJSON;
}

export function getGroup(token, props) {
    const userInfo = decodeToken(token);
    if (typeof props.match.params.group === 'undefined') {
        return userInfo['usertype'];
    }
    return props.match.params.group;
}

const CALLBACK_PATH = '/login/callback';

const oktaAuthConfig = {
    // Note: If your app is configured to use the Implicit Flow
    // instead of the Authorization Code with Proof of Code Key Exchange (PKCE)
    // you will need to add `pkce: false`
    issuer: process.env.REACT_APP_IDP_URI + '/oauth2/default',
    clientId: process.env.REACT_APP_CLIENT_ID,
    redirectUri: window.location.origin + CALLBACK_PATH,
};

export { oktaAuthConfig, CALLBACK_PATH };