import React from 'react';

const Home = React.lazy(() => import('../../views/tenant/home/Home'));
const UsersView = React.lazy(() => import('../../views/tenant/UsersView'));
const UsersAdd = React.lazy(() => import('../../views/tenant/UsersAdd'));
const UsersEdit = React.lazy(() => import('../../views/tenant/UsersEdit'));
const HostsView = React.lazy(() => import('../../views/tenant/HostsView'));
const HostsAdd = React.lazy(() => import('../../views/tenant/HostsAdd'));
const HostsEdit = React.lazy(() => import('../../views/tenant/HostsEdit'));
const HostsRule = React.lazy(() => import('../../views/tenant/HostsRule'));
const HostRouteConfig = React.lazy(() => import('../../views/tenant/HostRouteConfig'));
const BundlesView = React.lazy(() => import('../../views/tenant/BundlesView'));
const BundlesAdd = React.lazy(() => import('../../views/tenant/BundlesAdd'));
const BundlesEdit = React.lazy(() => import('../../views/tenant/BundlesEdit'));
const BundlesRule = React.lazy(() => import('../../views/tenant/BundlesRule'));
const StatRule = React.lazy(() => import('../../views/tenant/StatRule'));
const TracingRule = React.lazy(() => import('../../views/tenant/TracingRule'));
const PolicyView = React.lazy(() => import('../../views/tenant/policies/PolicyView'));
const PolicyAdd = React.lazy(() => import('../../views/tenant/policies/PolicyAdd'));
const PolicyEdit = React.lazy(() => import('../../views/tenant/policies/PolicyEdit'));
const AttributeEditor = React.lazy(() => import('../../views/tenant/AttributeEditor'));
const AttributesView = React.lazy(() => import('../../views/tenant/AttributesView'));
const Profile = React.lazy(() => import('../../views/tenant/Profile'));
const Settings = React.lazy(() => import('../../views/tenant/Settings'));
const Images = React.lazy(() => import('../../views/tenant/Images'));
const Logout = React.lazy(() => import('../../views/tenant/Logout'));
const TenantsMSPView = React.lazy(() => import('../../views/tenant/msp/TenantsView'));
const TenantsMSPEdit = React.lazy(() => import('../../views/tenant/msp/TenantsEdit'));

const routes = [
    { path: '/tenant/:id/:group', exact: true },
    { path: '/tenant/:id/:group/home', name: 'Home', component: Home },
    { path: '/tenant/:id/:group/users', name: 'Users', component: UsersView, exact: true },
    { path: '/tenant/:id/:group/users/add', name: 'Add', component: UsersAdd },
    { path: '/tenant/:id/:group/users/edit', name: 'Edit', component: UsersEdit },
    { path: '/tenant/:id/:group/hosts', name: 'Hosts', component: HostsView, exact: true },
    { path: '/tenant/:id/:group/hosts/add', name: 'Add', component: HostsAdd },
    { path: '/tenant/:id/:group/hosts/edit', name: 'Edit', component: HostsEdit },
    { path: '/tenant/:id/:group/hosts/rule', name: 'Rule', component: HostsRule },
    { path: '/tenant/:id/:group/hosts/routeconfig', name: 'Route Configure', component: HostRouteConfig },
    { path: '/tenant/:id/:group/bundles', name: 'Bundles', component: BundlesView, exact: true },
    { path: '/tenant/:id/:group/bundles/add', name: 'Add', component: BundlesAdd },
    { path: '/tenant/:id/:group/bundles/edit', name: 'Edit', component: BundlesEdit },
    { path: '/tenant/:id/:group/bundles/rule', name: 'Rule', component: BundlesRule },
    { path: '/tenant/:id/:group/stats', name: 'Stats', component: StatRule },
    { path: '/tenant/:id/:group/tracing', name: 'Tracing', component: TracingRule },
    { path: '/tenant/:id/:group/policy', name: 'Policies', component: PolicyView, exact: true },
    { path: '/tenant/:id/:group/policy/add', name: 'Add', component: PolicyAdd },
    { path: '/tenant/:id/:group/policy/edit', name: 'Edit', component: PolicyEdit },
    { path: '/tenant/:id/:group/attreditor', name: 'Attribute Editor', component: AttributeEditor },
    { path: '/tenant/:id/:group/attributes', name: 'Attributes Add', component: AttributesView },
    { path: '/tenant/:id/:group/profile', name: 'Profile', component: Profile, exact: true },
    { path: '/tenant/:id/:group/settings', name: 'Settings', component: Settings, exact: true },
    { path: '/tenant/:id/:group/images', name: 'Images', component: Images, exact: true },
    { path: '/tenant/:id/:group/logout', name: 'Log Out', component: Logout },
    { path: '/tenant/:id/:group/msp', name: 'MSP-View', component: TenantsMSPView, exact: true },
    { path: '/tenant/:id/:group/msp/add', name: 'MSP-Edit', component: TenantsMSPEdit },
];

export default routes;
