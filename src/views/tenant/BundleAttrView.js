import React, { lazy, useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CButtonGroup,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CProgress,
    CRow,
    CCallout,
    CDataTable,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'


var common = require('../../common')

const fields = [
    {
        key: "bid",
        label: "Bundle ID"
    },
    "team",
    "dept",
    "IC",
    "manager",
    "nonemployee",
    {
        key: 'edit',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
]


const BundleAttrView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/getallbundleattr/') + props.match.params.id, hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    // The AttrHeader should not show up among attributes
                    if (data[i].hasOwnProperty('bid') && data[i].bid == 'AppAttr') {
                        data.splice(i, 1);
                        break;
                    }
                }
                updateUserData(data)
            });
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/getallbundleattr/') + props.match.params.id, hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    // The AttrHeader should not show up among attributes
                    if (data[i].hasOwnProperty('bid') && data[i].bid == 'AppAttr') {
                        data.splice(i, 1);
                        break;
                    }
                }
                updateUserData(data)
            });
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/bundleattr/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundleattr/add',
            state: usersData[index]
        });
    }

    return (
        <>
            <CCallout color="primary" className="bg-title">
                <h4 className="title">Bundle Attributes</h4>
            </CCallout>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard>
                        <CCardHeader>
                            <strong>Bundle Attributes</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{placeholder:'By bundle ID, team...',label:'Search: '}}
                                noItemsView={{noItems:'No bundle properties exist '}}
                                sorter
                                pagination
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip
                                                        content='Edit'
                                                        placement='bottom'
                                                    >
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleEdit(index) }}
                                                        >
                                                            <CIcon name='cil-pencil' className='text-dark' />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                }}
                            />
                        </CCardBody>
                        <CCardFooter>
                            <CButton className="button-footer-primary" color="primary" variant="outline" onClick={handleRefresh}>
                                <CIcon name="cil-reload" />
                                <strong>{" "}Refresh</strong>
                            </CButton>
                            <CButton className="button-footer-success" color="success" variant="outline" onClick={handleAdd}>
                                <CIcon name="cil-plus" />
                                <strong>{" "}Add</strong>
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(BundleAttrView)
