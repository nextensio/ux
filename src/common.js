// If the webpage was served from https://some-link:port then modify it
// to https://some-link:8080 for the API endpoint. But if it was served
// from https://some-link then also make it https://some-link:8080
export function api_href(api) {
    let re = /:[0-9]+/g;
    let href = window.location.origin.replace(re, ":8080");
    if (href == window.location.origin) {
        href = href + ":8080";
    }
    return href + api

}
