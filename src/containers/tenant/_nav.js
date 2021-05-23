import './tenant.scss'

export default [
    {
        _tag: 'CSidebarNavItem',
        name: 'Home',
        to: '/tenant/:id/home',
        className: 'roboto-font',
        icon: {
            name: 'cil-home',
            size: 'lg'
        }
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Cluster Config',
        to: '/tenant/:id/clusterconfig',
        className: 'roboto-font',
        icon: {
            name: 'cil-home',
            size: 'lg'
        }
    },
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
        name: 'AppGroups',
        to: '/tenant/:id/bundles',
        className: 'roboto-font',
        icon: {
            name: 'cil-notes',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Hosts',
        to: '/tenant/:id/hosts',
        className: 'roboto-font',
        icon: {
            name: 'cil-input-power',
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
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    }
]

