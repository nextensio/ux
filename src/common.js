let re = /:[0-9]+/g;

export function api_href(api) {
    return window.location.origin.replace(re, ":8080") + api
}

