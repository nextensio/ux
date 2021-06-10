import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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

const TheSidebar = (props) => {
    const dispatch = useDispatch()
    const show = useSelector(state => state.sidebarShow)
    const [navExact, updateNav] = useState(navigation);

    useEffect(() => {
        let newNav = navigation.slice()
        for (var i = 0; i < navigation.length; i++) {
            if (navigation[i].hasOwnProperty('to')) {
                newNav[i].to = navigation[i].to.replace(":id", props.match.params.id)
            }
            updateNav(newNav)
        }
    }, [JSON.stringify(props.match.params)]);

    const logoutURL = '/tenant/' + props.match.params.id + '/logout';

    return (

        <CSidebar
            show={show}
            onShowChange={(val) => dispatch({ type: 'set', sidebarShow: val })}
            colorScheme="light"
        >
            <CSidebarBrand className="d-md-down-none" to="/">
                <div className="c-sidebar-brand-full sidebar-brand">
                    <CIcon name="cil-videogame" />{' '}
                Nextensio Controller
                </div>
                <CIcon className="c-sidebar-brand-minimized" name="cil-videogame" size="2xl" />
            </CSidebarBrand>

            <CSidebarNav>
                <CSidebarNavTitle>Home</CSidebarNavTitle>
                <CButton onClick={() => console.log(JSON.stringify(props.match.params))}>
                    Props ID
                </CButton>
                <CButton onClick={() => console.log(navExact)}>
                    Navexact
                </CButton>
                <CCreateElement
                    items={navExact}
                    components={{
                        CSidebarNavDivider,
                        CSidebarNavDropdown,
                        CSidebarNavItem,
                    }}
                />
            </CSidebarNav>
            <CSidebarFooter>
                <CNavItem>
                    <CNavLink to={logoutURL}>
                        <CIcon name="cil-account-logout" /> Log Out
          </CNavLink>
                </CNavItem>
            </CSidebarFooter>
            <CSidebarMinimizer className="c-d-md-down-none" />
        </CSidebar >
    )
}

export default React.memo(TheSidebar)
