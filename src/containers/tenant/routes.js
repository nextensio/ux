import React from 'react';

const Home = React.lazy(() => import('../../views/tenant/home/Home'));
const ClusterConfig = React.lazy(() => import('../../views/tenant/ClusterConfig'));
const UsersView = React.lazy(() => import('../../views/tenant/UsersView'));
const UsersAdd = React.lazy(() => import('../../views/tenant/UsersAdd'));
const UsersEdit = React.lazy(() => import('../../views/tenant/UsersEdit'));
const HostsView = React.lazy(() => import('../../views/tenant/HostsView'));
const HostsAdd = React.lazy(() => import('../../views/tenant/HostsAdd'));
const HostsEdit = React.lazy(() => import('../../views/tenant/HostsEdit'));
const HostRouteConfig = React.lazy(() => import('../../views/tenant/HostRouteConfig'));
const BundlesView = React.lazy(() => import('../../views/tenant/BundlesView'));
const BundlesAdd = React.lazy(() => import('../../views/tenant/BundlesAdd'));
const BundlesEdit = React.lazy(() => import('../../views/tenant/BundlesEdit'));
const PolicyView = React.lazy(() => import('../../views/tenant/PolicyView'));
const PolicyAdd = React.lazy(() => import('../../views/tenant/PolicyAdd'));
const PolicyEdit = React.lazy(() => import('../../views/tenant/PolicyEdit'));
const AttributeEditor = React.lazy(() => import('../../views/tenant/AttributeEditor'));
const Profile = React.lazy(() => import('../../views/tenant/Profile'));
const Settings = React.lazy(() => import('../../views/tenant/Settings'));
const Images = React.lazy(() => import('../../views/tenant/Images'));
const Logout = React.lazy(() => import('../../views/tenant/Logout'));

const routes = [
    { path: '/tenant/:id', exact: true },
    { path: '/tenant/:id/home', name: 'Home', component: Home },
    { path: '/tenant/:id/clusterconfig', name: 'Cluster Config', component: ClusterConfig , exact: true },
    { path: '/tenant/:id/users', name: 'Users', component: UsersView, exact: true },
    { path: '/tenant/:id/users/add', name: 'Add', component: UsersAdd },
    { path: '/tenant/:id/users/edit', name: 'Edit', component: UsersEdit },
    { path: '/tenant/:id/hosts', name: 'Host Attributes', component: HostsView, exact: true },
    { path: '/tenant/:id/hosts/add', name: 'Add', component: HostsAdd },
    { path: '/tenant/:id/hosts/edit', name: 'Edit', component: HostsEdit },
    { path: '/tenant/:id/hosts/routeconfig', name: 'Route Configure', component: HostRouteConfig },
    { path: '/tenant/:id/bundles', name: 'Bundles', component: BundlesView, exact: true },
    { path: '/tenant/:id/bundles/add', name: 'Add', component: BundlesAdd },
    { path: '/tenant/:id/bundles/edit', name: 'Edit', component: BundlesEdit },
    { path: '/tenant/:id/policy', name: 'Policies', component: PolicyView, exact: true },
    { path: '/tenant/:id/policy/add', name: 'Add', component: PolicyAdd },
    { path: '/tenant/:id/policy/edit', name: 'Edit', component: PolicyEdit },
    { path: '/tenant/:id/attreditor', name: 'Attribute Editor', component: AttributeEditor },
    { path: '/tenant/:id/profile', name: 'Profile', component: Profile, exact: true },
    { path: '/tenant/:id/settings', name: 'Settings', component: Settings, exact: true },
    { path: '/tenant/:id/images', name: 'Images', component: Images, exact: true },
    { path: '/tenant/:id/logout', name: 'Log Out', component: Logout },
];

export default routes;
