import React from 'react';

const GatewaysView = React.lazy(() => import('../../views/home/gateways/GatewaysView'));
const GatewaysEdit = React.lazy(() => import('../../views/home/gateways/GatewaysEdit'));
const TenantsView = React.lazy(() => import('../..//views/home/tenants/TenantsView'));
const TenantsEdit = React.lazy(() => import('../../views/home/tenants/TenantsEdit'));
const CertsView = React.lazy(() => import('../../views/home/certs/CertsView'));
const CertsEdit = React.lazy(() => import('../../views/home/certs/CertsEdit'));

const routes = [
    { path: '/home/gateways/view', name: 'GatewaysView', component: GatewaysView },
    { path: '/home/gateways/add', name: 'GatewaysEdit', component: GatewaysEdit },
    { path: '/home/certs/view', name: 'CertsView', component: CertsView },
    { path: '/home/certs/add', name: 'CertsEdit', component: CertsEdit },
    { path: '/home/tenants/view', name: 'TenantsView', component: TenantsView },
    { path: '/home/tenants/add', name: 'TenantsEdit', component: TenantsEdit },
];

export default routes;
