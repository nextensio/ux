var common = require('../../common')


// Add an attribute to attribute collection.
export function AddAttributeApi(tenantID, headers, payload, successFunc) {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    }
    fetch(common.api_href('/api/v1/tenant/' + tenantID + '/add/attrset'), requestOptions)
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                // get error message from body or default to response status
                alert(error);
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }
            // check for error response
            if (data["Result"] != "ok") {
                alert(data["Result"]);
            } else {
                successFunc()
            }

        })
        .catch(error => {
            alert('Error contacting server', error);
        });
}

// Get all users
export const GetAllUsers = async (tenantID, headers) => {
    fetch(common.api_href('/api/v1/tenant/' + tenantID + '/get/allusers'), headers)
        .then(response => response.json())
}
export function GetAllUserAttrs(tenantID, headers) {
    return fetch(common.api_href('/api/v1/tenant/' + tenantID + '/get/alluserattr'), headers)
        .then(response => response.json())
        .then(data => { return data })
}