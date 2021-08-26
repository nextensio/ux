import React, { lazy, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    CCreateElement,
    CNavItem,
    CNavLink,
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CSidebarNavDivider,
    CSidebarNavTitle,
    CSidebarMinimizer,
    CSidebarNavDropdown,
    CSidebarNavItem,
    CSidebarFooter,
} from '@coreui/react'

import './home.scss'
import CIcon from '@coreui/icons-react'
import { useOktaAuth } from '@okta/okta-react';


// sidebar nav config
import navigation from './_nav'

const TheSidebar = () => {
    const dispatch = useDispatch()
    const show = useSelector(state => state.sidebarShow)

    return (
        <CSidebar
            show={show}
            onShowChange={(val) => dispatch({ type: 'set', sidebarShow: val })}
            colorScheme="dark">
            <CSidebarBrand className="d-md-down-none" to="/">
                <div className="c-sidebar-brand-full sidebar-brand">
                    <CIcon name="cil-videogame" />{' '}
                    Nextensio
                </div>
                <CIcon className="c-sidebar-brand-minimized" name="cil-videogame" size="2xl" />
            </CSidebarBrand>
            <CSidebarNav>
                <CCreateElement
                    items={navigation}
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
                    <CNavLink to='/home/logout'>
                        <CIcon name="cil-account-logout" />{"\n"}Log Out
                    </CNavLink>
                </CNavItem>
            </CSidebarFooter>
            <CSidebarMinimizer className="c-d-md-down-none" />

        </CSidebar>

    )
}

export default React.memo(TheSidebar)
