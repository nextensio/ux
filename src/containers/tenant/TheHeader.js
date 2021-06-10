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

const TheHeader = (props) => {
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

    const toFeedback = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/feedback')
    }

    const toDocs = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/documentation')
    }

    return (
        <CHeader withSubheader>
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

            <CHeaderNav className='ml-auto px-3'>
                <CHeaderNavItem className="px-3">
                    <CHeaderNavItem onClick={() => console.log(props.match.params.id)}>
                        PROPS.MATCH.PARAMS.ID
                    </CHeaderNavItem>
                </CHeaderNavItem>
                <CHeaderNavItem className="px-3">
                    <CHeaderNavItem onClick={() => console.log(props)}>
                        PROPS
                    </CHeaderNavItem>
                </CHeaderNavItem>
                <CHeaderNavItem className="px-3" >
                    <CHeaderNavLink onClick={toFeedback}>
                        <CIcon size="lg" name="cil-speech"/>
                    </CHeaderNavLink>
                </CHeaderNavItem>
                <CHeaderNavItem className="px-3" >
                    <CHeaderNavLink onClick={toDocs}>
                        <CIcon size="lg" name="cil-info"/>
                    </CHeaderNavLink>
                </CHeaderNavItem>
                <TheHeaderDropdown {...props}/>
            </CHeaderNav>

        </CHeader>
    )
}

export default TheHeader
