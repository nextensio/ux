import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { useOktaAuth } from '@okta/okta-react';
import {
    CLabel
} from '@coreui/react'

var common = require('../../../common')


const BidDropdown = (props) => {

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };
    const [options, updateOptions] = useState(Object.freeze([{ value: 'global', label: 'Global (All Bundles)' }]))

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.ID + '/get/allbundles'), hdrs)
            .then(response => response.json())
            .then(data => {
                let selectOptions = [...options]
                for (let i = 0; i < data.length; i++) {
                    selectOptions.push({ value: data[i].bid, label: data[i].bid })
                }
                updateOptions(selectOptions)
            });
    }, [])

    const handleBidChange = (e) => {
        if (props.BID) {
            props.BID(e.value)
        }
    }

    return (
        <>
            <CLabel>Bundle ID</CLabel>
            <Select
                name="bid"
                className="mb-4"
                options={options}
                onChange={handleBidChange}
                isSearchable
            />
        </>
    )
}

export default BidDropdown