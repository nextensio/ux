import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { useOktaAuth } from '@okta/okta-react'
import {
    CButton,
    CLabel
} from '@coreui/react'

var common = require('../../../common')

const HostDropdown = (props) => {
    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };
    const [hostOptions, updateHostOptions] = useState(Object.freeze([{ value: 'global', label: 'Global' }]))
    const [routeOptions, updateRouteOptions] = useState(Object.freeze([{ value: 'global', label: 'All routes' }]))
    const [selectedHost, setSelectedHost] = useState(null)

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.ID + '/get/allhostattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                let selectOptions = [...hostOptions]
                for (let i = 0; i < data.length; i++) {
                    selectOptions.push({ value: data[i].host, label: data[i].host })
                }
                updateHostOptions(selectOptions)
            })
    }, [])

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.ID + '/get/allhostattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                let selectOptions = [...routeOptions]
                for (let i = 0; i < data.length; i++) {
                    if (data[i].host == selectedHost) {
                        for (let j = 0; j < data[i].routeattrs.length; j++) {
                            if (data[i].routeattrs[j].tag) {
                                selectOptions.push({ value: data[i].routeattrs[j].tag, label: data[i].routeattrs[j].tag })
                            }
                        }
                    }
                }
                updateRouteOptions(selectOptions)
            })
    }, [selectedHost])

    const handleHostChange = (e) => {
        setSelectedHost(e.value)
    }

    const handleRouteChange = (e) => {
        // 
    }
    return (
        <>
            <CLabel>Hosts</CLabel>
            <Select
                className='mb-3'
                options={hostOptions}
                onChange={handleHostChange}
                isSearchable
            />
            <CLabel>Routes</CLabel>
            <Select
                isDisabled={!selectedHost}
                className="mb-3"
                isMulti
                options={routeOptions}
            />

        </>
    )
}

export default HostDropdown