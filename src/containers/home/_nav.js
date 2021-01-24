import React from 'react'
import CIcon from '@coreui/icons-react'

export default [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['Home']
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Gateways',
        to: '/gateways',
        icon: 'cil-sitemap',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Tenants',
        to: '/tenants',
        icon: 'cil-group',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Certificates',
        to: '/certs',
        icon: 'cil-notes',
    },
    {
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    }
]

