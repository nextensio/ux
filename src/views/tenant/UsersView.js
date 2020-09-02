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

var common = require('../../common')

const fields = [
    "tenant",
    "uid",
    "name",
    "email",
    {
        key: 'edit',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: 'delete',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]


const UsersView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);

    useEffect(() => {
        fetch(common.api_href('/api/v1/getallusers/') + props.match.params.id)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/getallusers/') + props.match.params.id)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/users/add')
    }

    const handleEdit = (index) => {
        console.log('ID is %d', index)
    }

    const handleDelete = (index) => {
        console.log('ID is %d', index)
    }

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard>
                        <CCardHeader>
                            Users
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
                                    'delete':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CButton
                                                        color="primary"
                                                        variant="outline"
                                                        shape="square"
                                                        size="sm"
                                                        onClick={() => { handleDelete(index) }}
                                                    >
                                                        Delete
                                            </CButton>
                                                </td>
                                            )
                                        }
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

export default withRouter(UsersView)