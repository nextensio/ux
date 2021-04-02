import React from 'react'
import CIcon from '@coreui/icons-react'
import './tenant.scss'

export default [
    {
        _tag: 'CSidebarNavItem',
        name: 'Users',
        to: '/tenant/:id/users',
        className: 'roboto-font',
        icon: {
            name: 'cil-user',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'User Attributes',
        to: '/tenant/:id/userattr',
        className: 'roboto-font',
        icon: {
            name: 'cil-user-plus',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundles',
        to: '/tenant/:id/bundles',
        className: 'roboto-font',
        icon: {
            name: 'cil-notes',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundle Attributes',
        to: '/tenant/:id/bundleattr',
        className: 'roboto-font',
        icon: {
            name: 'cil-note-add',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Policies',
        to: '/tenant/:id/policy',
        className: 'roboto-font',
        icon: {
            name: 'cil-fingerprint',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Attribute Editor',
        to: '/tenant/:id/attreditor',
        className: 'roboto-font',
        icon: {
            name: 'cil-code',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    }
]

