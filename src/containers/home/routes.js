import React from 'react';

const DashboardView = React.lazy(() => import('../../views/home/dashboard/Dashboard'));
const GatewaysView = React.lazy(() => import('../../views/home/gateways/GatewaysView'));
const GatewaysEdit = React.lazy(() => import('../../views/home/gateways/GatewaysEdit'));
const TenantsView = React.lazy(() => import('../..//views/home/tenants/TenantsView'));
const TenantsEdit = React.lazy(() => import('../../views/home/tenants/TenantsEdit'));
const CertsView = React.lazy(() => import('../../views/home/certs/CertsView'));
const CertsEdit = React.lazy(() => import('../../views/home/certs/CertsEdit'));
const Logout = React.lazy(() => import('../../views/home/logout/Logout'))

const routes = [
    { path: '/home/dashboard', name: 'Dashboard', component: DashboardView },
    { path: '/home/gateways', name: 'Gateways', component: GatewaysView, exact: true },
    { path: '/home/gateways/add', name: 'Edit', component: GatewaysEdit },
    { path: '/home/certs', name: 'Certificates', component: CertsView, exact: true },
    { path: '/home/certs/add', name: 'Edit', component: CertsEdit },
    { path: '/home/tenants', name: 'Tenants', component: TenantsView, exact: true },
    { path: '/home/tenants/add', name: 'Edit', component: TenantsEdit },
    { path: '/home/logout', name: 'Logout', component: Logout },

];

export default routes;
