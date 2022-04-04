import './tenant.scss'

export default [
    {
        _tag: 'CSidebarNavItem',
        name: 'Users',
        to: '/tenant/:id/:group/users',
        className: 'roboto-font',
        icon: {
            name: 'cil-user',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Apps',
        to: '/tenant/:id/:group/hosts',
        className: 'roboto-font',
        icon: {
            name: 'cil-link',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'AppGroups',
        to: '/tenant/:id/:group/bundles',
        className: 'roboto-font',
        icon: {
            name: 'cil-notes',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Telemetry',
        to: '/tenant/:id/:group/stats',
        className: 'roboto-font',
        icon: {
            name: 'cil-chart',
            size: 'lg'
        }
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Tracing',
        to: '/tenant/:id/:group/tracing',
        className: 'roboto-font',
        icon: {
            name: 'cil-graph',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Policies',
        to: '/tenant/:id/:group/policy',
        className: 'roboto-font',
        icon: {
            name: 'cil-fingerprint',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Advanced',
        to: '/tenant/:id/:group/advanced',
        className: 'roboto-font',
        icon: {
            name: 'cil-home',
            size: 'lg'
        }
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Software',
        to: '/tenant/:id/:group/images',
        className: 'roboto-font',
        icon: {
            name: 'cil-3d',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Help',
        to: '/tenant/:id/:group/help',
        className: 'roboto-font',
        icon: {
            name: 'cil-3d',
            size: 'lg'
        },
    },
]

