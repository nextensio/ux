import React, { lazy, useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CButtonGroup,
    CCard,
    CCardBody,
    CCollapse,
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

var common = require('../../common')

const fields = [
    {   
        key: "pid",
        label: "Policy ID"
    },
    "majver",
    "minver",
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
    },
    {
        key: 'show_details',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]


const PolicyView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);
    const [details, setDetails] = useState([])

    useEffect(() => {
        setDetails([])
        fetch(common.api_href('/api/v1/getallpolicies/') + props.match.params.id)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].hasOwnProperty('rego')) {
                        data[i].rego = String.fromCharCode(...data[i].rego);
                    }
                }
                updateUserData(data);
            });
    }, []);

    const handleRefresh = (e) => {
        setDetails([]);
        fetch(common.api_href('/api/v1/getallpolicies/') + props.match.params.id)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].hasOwnProperty('rego')) {
                        data[i].rego = String.fromCharCode(...data[i].rego);
                    }
                }
                updateUserData(data);
            });
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/policy/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/policy/add',
            state: usersData[index]
        });
        setDetails([])
    }

    const handleDelete = (index) => {
        setDetails([])
        fetch(common.api_href('/api/v1/delpolicy/') + props.match.params.id + '/' + usersData[index].pid)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    // get error message from body or default to response status
                    alert(error);
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                // check for error response
                if (data["Result"] != "ok") {
                    alert(data["Result"])
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const toggleDetails = (index) => {
        const position = details.indexOf(index)
        let newDetails = details.slice()
        if (position !== -1) {
            newDetails.splice(position, 1)
        } else {
            newDetails = [...details, index]
        }
        setDetails(newDetails)
    }

    const showIcon = <CIcon name='cil-plus' className='text-dark'/>
    const hideIcon = <CIcon name='cil-minus' className='text-dark'/>

    return (
        <>
            <CRow>
                <CCol xs="12" lg="6">
                    <CCard className='border-primary shadow-lg'>
                        <CCardHeader className='bg-primary text-white'>
                            <strong>Policies</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{placeholder:'By policy ID, majver...',label:'Search: '}}
                                noItemsView={{noItems:'No policies exist '}}
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
                                    'delete':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip content='cil-delete' placement='bottom'>
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleDelete(index) }}
                                                        >
                                                            <CIcon name='cil-delete' className='text-dark' />
                                                        </CButton>
                                                    </CTooltip>    
                                                </td>
                                            )
                                        },
                                    'show_details':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip 
                                                        content={details.includes(index) ? 'Hide' : 'Details'}
                                                        placement='bottom'
                                                    >
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleDetails(index) }}
                                                        >
                                                            {details.includes(index) ? hideIcon : showIcon}
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'details':
                                        (item, index) => {
                                            return (
                                                <CCollapse show={details.includes(index)}>
                                                    <CCardBody>
                                                        <strong>Details: {'\n'}</strong>
                                                        <pre>
                                                            {item.rego}
                                                        </pre>
                                                    </CCardBody>
                                                </CCollapse>
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

export default withRouter(PolicyView)