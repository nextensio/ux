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
        _tag: 'CSidebarNavDivider',
        className: 'm-2'
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['Tenant Specific'],
        className: 'sidebar-nav-title'
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Dashboard',
        className: 'roboto-font',
        icon: {
            name: 'cil-speedometer',
            size: 'lg'
        },
        addLinkClass: 'c-disabled',
        'disabled': true,
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Users',
        className: 'roboto-font',
        icon: {
            name: 'cil-user',
            size: 'lg'
        },
        addLinkClass: 'c-disabled',
        'disabled': true,
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'User Attributes',
        className: 'roboto-font',
        icon: {
            name: 'cil-user-plus',
            size: 'lg'
        },
        addLinkClass: 'c-disabled',
        'disabled': true
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundles',
        className: 'roboto-font',
        icon: {
            name: 'cil-notes',
            size: 'lg'
        },
        addLinkClass: 'c-disabled',
        'disabled': true,

    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Bundle Attributes',
        className: 'roboto-font',
        icon: {
            name: 'cil-note-add',
            size: 'lg'
        },
        addLinkClass: 'c-disabled',
        'disabled': true
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Policies',
        className: 'roboto-font',
        icon: {
            name: 'cil-fingerprint',
            size: 'lg'
        },
        addLinkClass: 'c-disabled',
        'disabled': true
    },
]

