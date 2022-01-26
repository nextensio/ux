import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    CHeader,
    CHeaderNav,
    CHeaderNavItem,
    CToggler,
} from '@coreui/react'
import { useTheme } from './Context'
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../common')

const TheHeader = (props) => {

    const Theme = useTheme()

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
        },
    };

    const idTokenJson = common.decodeToken(bearer)

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => {
                if (!data.Tenant.easymode && !Theme.darkMode) {
                    Theme.toggleTheme()
                }
            })
    }, []);

    const dispatch = useDispatch()
    const sidebarShow = useSelector(state => state.sidebarShow)

    const toggleSidebar = () => {
        const val = [true, 'responsive'].includes(sidebarShow) ? false : 'responsive'
        dispatch({ type: 'set', sidebarShow: val })
    }

    const toggleSidebarMobile = () => {
        const val = [false, 'responsive'].includes(sidebarShow) ? true : 'responsive'
        dispatch({ type: 'set', sidebarShow: val })
    }

    return (
        <CHeader colorScheme={Theme.darkMode && "dark"}>
            <CToggler
                inHeader
                className="ml-md-3 d-lg-none"
                onClick={toggleSidebarMobile}
            />
            <CToggler
                inHeader
                className="ml-3 d-md-down-none"
                onClick={toggleSidebar}
            />

            <CHeaderNav className="ml-auto mr-3 py-3 roboto-font text-dark">
                <CHeaderNavItem className="mr-3">{idTokenJson.usertype}</CHeaderNavItem>
                <CHeaderNavItem>|</CHeaderNavItem>
                <CHeaderNavItem className="ml-3">{Theme.darkMode ? "Expert Mode" : "Easy Mode"}</CHeaderNavItem>

            </CHeaderNav>
        </CHeader>
    )
}

export default TheHeader
