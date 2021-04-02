import './home.scss'

export default [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['General'],
        className: 'sidebar-nav-title',
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Home',
        to: '/home',
        className: 'roboto-font',
        icon: {
            name: 'cil-home',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Gateways',
        to: '/gateways',
        className: 'roboto-font',
        icon: {
            name: 'cil-sitemap',
            size: 'lg',
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Tenants',
        to: '/tenants',
        className: 'roboto-font',
        icon: {
            name: 'cil-group',
            size: 'lg',
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Certificates',
        to: '/certs',
        className: 'roboto-font',
        icon: {
            name: 'cil-notes',
            size: 'lg',
        },
    },
    {
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['Tenant Specific'],
        className: 'sidebar-nav-title'
    },
]

