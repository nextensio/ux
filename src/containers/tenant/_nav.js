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
        to: '/tenant/:id/documentation',
        className: 'roboto-font',
        icon: {
            name: 'cil-info',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Images',
        href: 'http://nextensio-images.s3-website-us-west-1.amazonaws.com/',
        className: 'roboto-font',
        icon: {
            name: 'cil-3d',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Feedback',
        to: '/tenant/:id/feedback',
        className: 'roboto-font',
        icon: {
            name: 'cil-speech',
            size: 'lg'
        },
    },
]

