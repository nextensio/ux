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

var common = require('../../common')

const fields = [
    {
        key: "uid",
        label: "User ID"
    },
    "category",
    "type",
    "level",
    "dept",
    "team",
    {
        key: 'edit',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
]


const UserAttrView = (props) => {

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
        fetch(common.api_href('/api/v1/getalluserattr/') + props.match.params.id, hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    // The AttrHeader should not show up among attributes
                    if (data[i].hasOwnProperty('uid') && data[i].uid == 'UserAttr') {
                        data.splice(i, 1);
                        break;
                    }
                }
                updateUserData(data)
            });
    }, []);

    const handleRefresh = (e) => {
        fetch('http://127.0.0.1:8080/api/v1/getalluserattr/' + props.match.params.id, hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    // The AttrHeader should not show up among attributes
                    if (data[i].hasOwnProperty('uid') && data[i].uid == 'UserAttr') {
                        data.splice(i, 1);
                        break;
                    }
                }
                updateUserData(data)
            });
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/userattr/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/userattr/add',
            state: usersData[index]
        });
    }


    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className='border-primary'>
                        <CCardHeader className='bg-primary text-white'>
                            <strong>User Properties</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{placeholder:'By user, category...',label:'Search: '}}
                                noItemsView={{noItems:'No user properties exist '}}
                                sorter
                                pagination
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip content='Edit' placement='bottom'>
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleEdit(index) }}
                                                        >
                                                            <CIcon name='cil-pencil' className='text-dark'/>
                                                        </CButton>
                                                    </CTooltip>
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

export default withRouter(UserAttrView)