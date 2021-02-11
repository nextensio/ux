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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { DocsLink } from 'src/reusable'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../common')

const fields = [
    "tenant",
    "bid",
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
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard>
                        <CCardHeader>
                            Bundle Attributes
                  <DocsLink name="CModal" />
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPage={15}
                                pagination
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CButton
                                                        color="primary"
                                                        variant="outline"
                                                        shape="square"
                                                        size="sm"
                                                        onClick={() => { handleEdit(index) }}
                                                    >
                                                        Edit
                                            </CButton>
                                                </td>
                                            )
                                        },
                                }}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CButton size="large" color="primary" onClick={handleRefresh}>Refresh</CButton>
            <CButton size="large" color="secondary" onClick={handleAdd}>Add</CButton>
        </>
    )
}

export default withRouter(BundleAttrView)
