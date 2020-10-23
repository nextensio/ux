import React from 'react';

const UsersView = React.lazy(() => import('../../views/tenant/UsersView'));
const UsersEdit = React.lazy(() => import('../../views/tenant/UsersEdit'));
const UserAttrView = React.lazy(() => import('../../views/tenant/UserAttrView'));
const UserAttrEdit = React.lazy(() => import('../../views/tenant/UserAttrEdit'));
const BundlesView = React.lazy(() => import('../../views/tenant/BundlesView'));
const BundlesEdit = React.lazy(() => import('../../views/tenant/BundlesEdit'));
const BundleAttrView = React.lazy(() => import('../../views/tenant/BundleAttrView'));
const BundleAttrEdit = React.lazy(() => import('../../views/tenant/BundleAttrEdit'));
const PolicyView = React.lazy(() => import('../../views/tenant/PolicyView'));
const PolicyEdit = React.lazy(() => import('../../views/tenant/PolicyEdit'));
const RoutingView = React.lazy(() => import('../../views/tenant/RoutingView'));
const RoutingEdit = React.lazy(() => import('../../views/tenant/RoutingEdit'));

const routes = [
    { path: '/tenant/:id/users/view', name: 'Tenant', component: UsersView },
    { path: '/tenant/:id/users/add', name: 'Tenant', component: UsersEdit },
    { path: '/tenant/:id/userattr/view', name: 'Tenant', component: UserAttrView },
    { path: '/tenant/:id/userattr/add', name: 'Tenant', component: UserAttrEdit },
    { path: '/tenant/:id/bundles/view', name: 'Tenant', component: BundlesView },
    { path: '/tenant/:id/bundles/add', name: 'Tenant', component: BundlesEdit },
    { path: '/tenant/:id/bundleattr/view', name: 'Tenant', component: BundleAttrView },
    { path: '/tenant/:id/bundleattr/add', name: 'Tenant', component: BundleAttrEdit },
    { path: '/tenant/:id/policy/view', name: 'Tenant', component: PolicyView },
    { path: '/tenant/:id/policy/add', name: 'Tenant', component: PolicyEdit },
    { path: '/tenant/:id/route/view', name: 'Tenant', component: RoutingView },
    { path: '/tenant/:id/route/add', name: 'Tenant', component: RoutingEdit },
];

export default routes;
