import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CCreateElement,
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

// sidebar nav config
import navigation from './_nav'

const TheSidebar = () => {
  const dispatch = useDispatch()
  const show = useSelector(state => state.sidebarShow)

  return (
    <CSidebar
      show={show}
      onShowChange={(val) => dispatch({ type: 'set', sidebarShow: val })}
      colorScheme="light">
      <CSidebarBrand className="d-md-down-none" to="/">
        <div className="c-sidebar-brand-full sidebar-brand">
          <CIcon name="cil-videogame"/>{' '}
          Nextensio Controller
        </div>
        <CIcon className="c-sidebar-brand-minimized" name="cil-videogame" size="2xl"/>
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
        <div className="justify-content-end">
          <CIcon name="cil-account-logout"/>{"\n"}Log Out 
        </div>
      </CSidebarFooter>
      <CSidebarMinimizer className="c-d-md-down-none"/>
    </CSidebar>
  )
}

export default React.memo(TheSidebar)
