import React from 'react'
import CIcon from '@coreui/icons-react'

export default [
  {
    _tag: 'CSidebarNavTitle',
    _children: ['Summary']
  },
  {
    _tag: 'CSidebarNavItem',
    name: 'Gateways',
    to: '/home/gateways/view',
    icon: 'cil-industry',
  },
  {
    _tag: 'CSidebarNavItem',
    name: 'Tenants',
    to: '/home/tenants/view',
    icon: 'cil-industry',
  },
  {
    _tag: 'CSidebarNavDivider',
    className: 'm-2'
  }
]

