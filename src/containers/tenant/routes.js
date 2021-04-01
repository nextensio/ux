import React from 'react';

const TenantDashboard = React.lazy(() => import('../../views/tenant/TenantDashboard'));
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
const AttributeEditor = React.lazy(() => import('../../views/tenant/AttributeEditor'));

const routes = [
    { path: '/tenant/:id', exact: true, name: 'Tenant Home' },
    { path: '/tenant/:id/home', name: 'Dashboard', component: TenantDashboard },
    { path: '/tenant/:id/users', name: 'Users', component: UsersView, exact: true },
    { path: '/tenant/:id/users/add', name: 'Edit', component: UsersEdit },
    { path: '/tenant/:id/userattr', name: 'User Properties', component: UserAttrView, exact: true },
    { path: '/tenant/:id/userattr/add', name: 'Edit', component: UserAttrEdit },
    { path: '/tenant/:id/bundles', name: 'Bundles', component: BundlesView, exact: true },
    { path: '/tenant/:id/bundles/add', name: 'Edit', component: BundlesEdit },
    { path: '/tenant/:id/bundleattr', name: 'Bundle Properties', component: BundleAttrView, exact: true },
    { path: '/tenant/:id/bundleattr/add', name: 'Edit', component: BundleAttrEdit },
    { path: '/tenant/:id/policy', name: 'Policies', component: PolicyView, exact: true },
    { path: '/tenant/:id/policy/add', name: 'Edit', component: PolicyEdit },
    { path: '/tenant/:id/attreditor', name: 'Edit', component: AttributeEditor },
];

export default routes;
