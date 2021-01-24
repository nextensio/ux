import React from 'react'
import CIcon from '@coreui/icons-react'

export default [
    {
        _tag: 'CSidebarNavItem',
        name: 'Users',
        to: '/tenant/:id/users',
        icon: 'cil-user',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'User Attributes',
        to: '/tenant/:id/userattr',
        icon: 'cil-user-plus',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundles',
        to: '/tenant/:id/bundles',
        icon: 'cil-notes',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundle Attributes',
        to: '/tenant/:id/bundleattr',
        icon: 'cil-note-add',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Policies',
        to: '/tenant/:id/policy',
        icon: 'cil-fingerprint',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Routing',
        to: '/tenant/:id/route',
        icon: 'cil-router',
    },
    {
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    }
]

