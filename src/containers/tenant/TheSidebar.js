import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useOktaAuth } from '@okta/okta-react';
import {
    CButton,
    CCreateElement,
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CSidebarHeader,
    CSidebarNavDivider,
    CSidebarNavTitle,
    CSidebarMinimizer,
    CSidebarNavDropdown,
    CSidebarNavItem,
    CSidebarFooter,
    CNavItem,
    CNavLink,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import './tenant.scss'

// sidebar nav config
import navigation from './_nav'

var common = require('../../common')

const TheSidebar = (props) => {
    const dispatch = useDispatch()
    const show = useSelector(state => state.sidebarShow)
    const [navExact, updateNav] = useState(navigation);
    const [easyMode, setEasyMode] = useState(true)
    let easyIgnore = ['Policies']

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => {
                setEasyMode(data.Tenant.easymode)
                var newNav = []
                for (var i = 0; i < navigation.length; i++) {
                    // There are some stuff which are not needed in easy mode, dont show those in navigation
                    if (data.Tenant.easymode && navigation[i].hasOwnProperty('name') && easyIgnore.includes(navigation[i].name)) {
                        // ignore the item
                    } else {
                        newNav.push(navigation[i])
                    }
                }
                for (var i = 0; i < newNav.length; i++) {
                    if (newNav[i].hasOwnProperty('to')) {
                        newNav[i].to = newNav[i].to.replace(":id", props.match.params.id)
                        newNav[i].to = newNav[i].to.replace(":group", props.match.params.group)
                    }
                }
                updateNav(newNav)
            });
    }, [JSON.stringify(props.match.params)]);

    const logoutURL = '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/logout';

    return (

        <CSidebar
            show={show}
            onShowChange={(val) => dispatch({ type: 'set', sidebarShow: val })}
            colorScheme="dark"
        >
            <CSidebarBrand className="d-md-down-none" to="/">
                <div className="c-sidebar-brand-full sidebar-brand">
                    <CIcon name="cil-videogame" />{' '}
                    Nextensio
                </div>
                <CIcon className="c-sidebar-brand-minimized" name="cil-videogame" size="2xl" />
            </CSidebarBrand>

            <CSidebarNav>
                <CCreateElement
                    items={navExact}
                    components={{
                        CSidebarNavDivider,
                        CSidebarNavDropdown,
                        CSidebarNavItem,
                        CSidebarNavTitle
                    }}
                />
            </CSidebarNav>
            <CSidebarFooter>
                <CNavItem>
                    <CNavLink to={logoutURL} className="text-success roboto-font">
                        <CIcon name="cil-account-logout" /> Log Out
                    </CNavLink>
                </CNavItem>
            </CSidebarFooter>
            <CSidebarMinimizer className="c-d-md-down-none" />
        </CSidebar >
    )
}

export default React.memo(TheSidebar)
