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
        to: '/home/dashboard',
        className: 'roboto-font',
        icon: {
            name: 'cil-home',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Gateways',
        to: '/home/gateways',
        className: 'roboto-font',
        icon: {
            name: 'cil-sitemap',
            size: 'lg',
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Tenants',
        to: '/home/tenants',
        className: 'roboto-font',
        icon: {
            name: 'cil-group',
            size: 'lg',
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Certificates',
        to: '/home/certs',
        className: 'roboto-font',
        icon: {
            name: 'cil-notes',
            size: 'lg',
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Client ID',
        to: '/home/clientid',
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
]

