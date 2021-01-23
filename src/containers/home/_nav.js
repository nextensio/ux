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
        to: '/home/gateways/view',
        icon: 'cil-sitemap',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Tenants',
        to: '/home/tenants/view',
        icon: 'cil-group',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Certificates',
        to: '/home/certs/view',
        icon: 'cil-notes',
    },
    {
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    }
]

