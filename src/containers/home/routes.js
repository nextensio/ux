import React from 'react';

const DashboardView = React.lazy(() => import('../../views/home/dashboard/Dashboard'));
const GatewaysView = React.lazy(() => import('../../views/home/gateways/GatewaysView'));
const GatewaysEdit = React.lazy(() => import('../../views/home/gateways/GatewaysEdit'));
const TenantsView = React.lazy(() => import('../..//views/home/tenants/TenantsView'));
const TenantsEdit = React.lazy(() => import('../../views/home/tenants/TenantsEdit'));
const CertsView = React.lazy(() => import('../../views/home/certs/CertsView'));
const CertsEdit = React.lazy(() => import('../../views/home/certs/CertsEdit'));

const routes = [
    { path: '/home', exact: true, name: 'Home', component: DashboardView },
    { path: '/home/gateways', name: 'Gateways', component: GatewaysView },
    { path: '/home/gateways/add', name: 'Edit', component: GatewaysEdit },
    { path: '/home/certs', name: 'Certs', component: CertsView },
    { path: '/home/certs/add', name: 'Edit', component: CertsEdit },
    { path: '/home/tenants', name: 'Tenants', component: TenantsView },
    { path: '/home/tenants/add', name: 'Edit', component: TenantsEdit },
];

export default routes;
