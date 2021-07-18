import React, { useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CCollapse,
    CRow,
    CDataTable,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './tenantviews.scss'


var common = require('../../common')

const fields = [
    {
        key: 'show_details',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: "bid",
        label: "Bundle ID",
        _classes: "data-head"
    },
    {
        key: "name",
        _classes: "data-field"
    },
    {
        key: "services",
        _classes: "data-field"
    },
    {
        key: "cpodrepl",
        label: "Compute Pods",
        _classes: "data-field"
    },
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
]


const BundlesView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [bundleData, updateBundleData] = useState(initTableData);
    const [bundleAttrData, updateBundleAttrData] = useState(initTableData);
    // Used to check if bid already exists in bundlesAdd page
    const [bidData, updateBidData] = useState("");
    const [zippedData, updateZippedData] = useState(initTableData);

    const [details, setDetails] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteBid, setDeleteBid] = useState("");

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundles'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundleattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    // The AttrHeader should not show up among attributes
                    if (data[i].hasOwnProperty('bid') && data[i].bid == 'AppAttr') {
                        data.splice(i, 1);
                        break;
                    }
                }
                updateBundleAttrData(data)
                console.log(bundleData)
            });
    }, []);

    useEffect(() => {
        const zipper = []
        const bidObj = {}
        for (let i = 0; i < bundleData.length; i++) {
            bidObj[bundleData[i].bid] = true;
            // Match bundleData object with bundleAttrData by bid and combine the two into one
            if (bundleAttrData.find((obj) => obj.bid === bundleData[i].bid)) {
                const zipObj = {
                    ...bundleData[i],
                    ...bundleAttrData.find((obj) => obj.bid === bundleData[i].bid)
                }
                const {connectid, cluster, gateway, pod, majver, minver, _gateway, _name, _pod, ...rest} = zipObj
                zipper.push(rest)
                console.log(rest)
            }
        }
        updateZippedData(zipper)
        updateBidData(bidObj)
    }, [bundleData, bundleAttrData])
    
    const toDocs = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/documentation',
            state: "Bundles"
        });
    }

    const toAttributeEditor = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/attreditor'
        })
    }
    
    const handleRefresh = (e) => {
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundles'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundleattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    // The AttrHeader should not show up among attributes
                    if (data[i].hasOwnProperty('bid') && data[i].bid == 'AppAttr') {
                        data.splice(i, 1);
                        break;
                    }
                }
                updateBundleAttrData(data)
            });
    }

    const handleAdd = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundles/add',
            state: bidData
        })
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundles/edit',
            state: zippedData[index]
        });
        setDetails([]);
    }

    const handleDelete = (bid) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/bundle/') + bid, hdrs)
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
                setDeleteModal(!deleteModal);
                handleRefresh()
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

    const toggleDelete = (item) => {
        setDeleteModal(!deleteModal);
        setDeleteBid(item.bid)
    }

    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary"/>

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className="shadow large">
                        <CCardHeader>
                            <strong>AppGroup</strong>
                            <CButton 
                                className="float-right" 
                                color="primary"
                                onClick={toDocs}
                            >
                                <CIcon className="mr-1" name="cil-info"/>
                                AppGroup Docs
                            </CButton>
                            <CButton onClick={() => console.log(zippedData)}>LOG</CButton>
                            <CButton onClick={() => console.log(bundleData)}>bundleData</CButton>
                            <CButton onClick={() => console.log(bundleAttrData)}>bundleAttrData</CButton>


                            <div className="text-muted small">Click on a row to see attributes</div>
                            
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={zippedData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{ placeholder: 'By AppGroup ID, name...', label: 'Search: ' }}
                                noItemsView={{ noItems: 'No AppGroup exists ' }}
                                sorter
                                pagination
                                clickableRows
                                onRowClick={(item, index) => {toggleDetails(index)}}
                                scopedSlots={{
                                    'show_details':
                                        (item, index) => {
                                            return (
                                                <td className="py-auto">
                                                    {details.includes(index) ? hidingIcon : showingIcon}
                                                </td>
                                            )
                                        },
                                    'details':
                                        (item, index) => {
                                            return (
                                                <CCollapse show={details.includes(index)}>
                                                    <CCardBody>
                                                        {Object.keys(item).length < 5 ?
                                                        <div className="roboto-font">No bundle attributes exist. <a onClick={toAttributeEditor} className="text-primary"><CIcon name="cil-code"/> Click here</a> to add a bundle attribute.</div> :
                                                        <table className="my-1 table table-outline d-sm-table">
                                                            <tr>
                                                                <th className="attributes header roboto-font">Attributes</th>
                                                                <td className="attributes header roboto-font"><strong>Values</strong></td>
                                                            </tr>
                                                            {Object.keys(item).filter(key => {
                                                                if (["bid", "name", "cpodrepl", "services"].includes(key)) {
                                                                    return false
                                                                }
                                                                else {
                                                                    return true
                                                                }
                                                            }).map(key => {
                                                                return(
                                                                    <tr>
                                                                        <th className="attributes roboto-font">{key}</th>
                                                                        <td className="roboto-font">
                                                                            <>
                                                                                {/**Check if attribute value equals false, 0, "",
                                                                                 * [false], 0, [""] which we have defined as default values.
                                                                                 */}
                                                                                {[false, 0, "",].indexOf(item[key]) > -1 || 
                                                                                (Array.isArray(item[key]) && item[key].length === 1 && [false, 0, ""].indexOf(item[key][0]) > -1)?
                                                                                    <div className="text-warning">
                                                                                        Default value assigned
                                                                                    </div>
                                                                                :
                                                                                    <div>
                                                                                        {Array.isArray(item[key]) 
                                                                                        ? <div>{item[key].join(' & ')}</div>
                                                                                        : <div>{item[key]}</div>
                                                                                        }
                                                                                    </div>
                                                                                }
                                                                            </>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </table>}
                                                       
                                                    </CCardBody>
                                                </CCollapse>
                                            )
                                        },
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content='Edit'
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleEdit(index) }}
                                                        >
                                                            <FontAwesomeIcon icon="pen" size="lg" className="icon-table-edit" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'delete':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content='Delete'
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='danger'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleDelete(item) }}
                                                        >
                                                            <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        }
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
                <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                    <CModalHeader className='bg-danger text-white py-n5' closeButton>
                        <strong>Confirm Deletion</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                        <strong>Are you sure you want to delete {deleteBid}?</strong>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="danger"
                            onClick={() => handleDelete(deleteBid)}
                        >Confirm</CButton>
                        <CButton
                            color="secondary"
                            onClick={() => setDeleteModal(!deleteModal)}
                        >Cancel</CButton>
                    </CModalFooter>
                </CModal>
            </CRow>
        </>
    )
}

export default withRouter(BundlesView)
