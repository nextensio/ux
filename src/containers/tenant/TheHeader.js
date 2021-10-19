import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    CHeader,
    CLink,
    CToggler,
    CHeaderNav,
    CHeaderNavItem,
    CHeaderNavLink
} from '@coreui/react'
import { TheHeaderDropdown } from './index'
import CIcon from '@coreui/icons-react'
import { useSettingsChange, useTheme } from './Context'

const TheHeader = (props) => {
    const SettingsChange = useSettingsChange()
    const Theme = useTheme()
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
        </CHeader>
    )
}

export default TheHeader
