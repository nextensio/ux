import './tenant.scss'

export default [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['Home']
    },
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
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['Additional']
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Docs',
        href: 'https://docs.nextensio.net/',
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'roboto-font',
        icon: {
            name: 'cil-info',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Images',
        to: '/tenant/:id/images',
        className: 'roboto-font',
        icon: {
            name: 'cil-3d',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Feedback',
        href: 'https://github.com/nextensio',
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'roboto-font',
        icon: {
            name: 'cil-speech',
            size: 'lg'
        },
    },
]

