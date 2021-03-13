import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
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
} from '@coreui/react'

import CIcon from '@coreui/icons-react'

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
  }, []);

  return (

    < CSidebar
      show={show}
      onShowChange={(val) => dispatch({ type: 'set', sidebarShow: val })}
    >
      <CSidebarBrand className="d-md-down-none" to="/">
        <CIcon
          className="my-n5 ml-n3"
          name="logo"
          size={'7xl'}
        />
      </CSidebarBrand>
      
      <CSidebarNav>
      <CSidebarNavTitle>Tenant:{props.match.params.id}</CSidebarNavTitle>
        <CCreateElement
          items={navExact}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
          }}
        />
      </CSidebarNav>
      <CSidebarMinimizer className="c-d-md-down-none" />
    </CSidebar >
  )
}

export default React.memo(TheSidebar)
