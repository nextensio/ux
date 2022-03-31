import './tenant.scss'

export default [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['Users']
    },
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
        name: 'Stats',
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
        to: '/tenant/:id/:group/home',
        className: 'roboto-font',
        icon: {
            name: 'cil-home',
            size: 'lg'
        }
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
        name: 'Images',
        to: '/tenant/:id/:group/images',
        className: 'roboto-font',
        icon: {
            name: 'cil-3d',
            size: 'lg'
        },
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
        name: 'Ticketing',
        href: 'https://github.com/nextensio/tickets/issues',
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'roboto-font',
        icon: {
            name: 'cil-speech',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Slack',
        href: 'https://join.slack.com/t/nextensio-community/shared_invite/zt-15br229n8-GDbNHrijOUnVcwL5LdGN1w',
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'roboto-font',
        icon: {
            name: 'cib-slack',
            size: 'lg'
        },
    },
    {
        _tag: 'CSidebarNavItem',
        name: 'Settings',
        to: '/tenant/:id/:group/settings',
        className: 'roboto-font',
        icon: {
            name: 'cil-settings',
            size: 'lg'
        },
    },
]

