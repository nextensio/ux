import React from 'react'
import CIcon from '@coreui/icons-react'

export default [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['Summary']
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Users',
        to: '/tenant/:id/users/view',
        icon: 'cil-industry',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'User Attributes',
        to: '/tenant/:id/userattr/view',
        icon: 'cil-industry',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundles',
        to: '/tenant/:id/bundles/view',
        icon: 'cil-industry',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundle Attributes',
        to: '/tenant/:id/bundleattr/view',
        icon: 'cil-industry',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Policies',
        to: '/tenant/:id/policy/view',
        icon: 'cil-industry',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Routing',
        to: '/tenant/:id/route/view',
        icon: 'cil-industry',
    },
    {
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    }
]

