import React from 'react';

const DashboardView = React.lazy(() => import('../../views/home/dashboard/Dashboard'));
const GatewaysView = React.lazy(() => import('../../views/home/gateways/GatewaysView'));
const GatewaysEdit = React.lazy(() => import('../../views/home/gateways/GatewaysEdit'));
const GatewaysData = React.lazy(() => import('../../views/home/gateways/GatewaysData'));
const TenantsView = React.lazy(() => import('../..//views/home/tenants/TenantsView'));
const TenantsEdit = React.lazy(() => import('../../views/home/tenants/TenantsEdit'));
const CertsView = React.lazy(() => import('../../views/home/certs/CertsView'));
const CertsEdit = React.lazy(() => import('../../views/home/certs/CertsEdit'));
const Logout = React.lazy(() => import('../../views/home/logout/Logout'))

const routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/home', name: 'Dashboard', component: DashboardView },
    { path: '/gateways', name: 'Gateways', component: GatewaysView, exact: true },
    { path: '/gateways/add', name: 'Edit', component: GatewaysEdit },
    { path: '/gateways/data', name: 'Data', component: GatewaysData },
    { path: '/certs', name: 'Certificates', component: CertsView, exact: true },
    { path: '/certs/add', name: 'Edit', component: CertsEdit },
    { path: '/tenants', name: 'Tenants', component: TenantsView, exact: true },
    { path: '/tenants/add', name: 'Edit', component: TenantsEdit },
    { path: '/logout', name: 'Logout', component: Logout },

];

export default routes;
