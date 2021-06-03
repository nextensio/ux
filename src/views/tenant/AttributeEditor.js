import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardHeader,
    CCardBody,
    CCardFooter,
    CCol,
    CDataTable,
    CDropdown,
    CDropdownToggle,
    CDropdownItem,
    CDropdownMenu,
    CForm,
    CFormGroup,
    CInput,
    CInputGroup,
    CInputRadio,
    CLabel,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CModalFooter,
    CPopover,
    CRow,
    CInvalidFeedback,
    CSwitch,
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
        key: "name",
        _classes: "data-head"
    },
    {
        key: "appliesTo",
        _classes: "data-field"
    },
    {
        key: "type",
        _classes: "data-field"
    },
    {
        key: "edit",
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: "delete",
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]

const AttributeEditor = (props) => {
    var initAttrData = Object.freeze(
        []
    );
    const [inuseAttr, updateInuseAttr] = useState(initAttrData);
    const [attributeData, updateAttributeData] = useState({ name: '', appliesTo: '', type: 'Type' })
    const [resetWarning, setResetWarning] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(0);
    const [overwriteModal, setOverwriteModal] = useState(false);
    // This object will contain any error messages used when validating attribute. 
    const [errObj, updateErrObj] = useState({})

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => { updateInuseAttr(data); });
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => { updateInuseAttr(data); });
    }


    const handleChange = (e) => {
        updateAttributeData({
            ...attributeData,
            [e.target.name]: e.target.value
        });
    };

    const handleType = (e, type) => {
        updateAttributeData({
            ...attributeData, 
            type: type
        });
    }

    const rangeCheck = (e) => {
        if (!attributeData.rangeCheck) {
            updateAttributeData({
                ...attributeData,
                rangeCheck: 10
            })
        } else {
            updateAttributeData({
                ...attributeData,
                rangeCheck: undefined
            })
        }
    }


    const reset = (e) => {
        updateAttributeData({ name: '', appliesTo: '', type: 'Type'});
        setResetWarning(false);
    }

    // function used to validate that all input fields are filled correctly
    const validate = (e) => {
        if (attributeData.name.trim() == "" && attributeData.type == "Type") {
            updateErrObj({
                ...errObj,
                typeErr: true
            })
        } 
        if (attributeData.type == "String" && !attributeData.isArray) {
            updateErrObj({
                ...errObj,
                isArrayErr: true
            })
        }
        if (attributeData.type == "Number") {
            if (!attributeData.numType) {
                updateErrObj({
                    ...errObj,
                    numTypeErr: true
                })
            }
            if (!attributeData.singleMultipleOrRange) {
                updateErrObj({
                    ...errObj,
                    singleMultipleOrRangeErr: true
                })
            }
        }
        if (attributeData.type == "Date" && !attributeData.dateRange) {
            updateErrObj({
                ...errObj,
                dateRangeErr: true
            })
        } 
        
        return
    }

    const commitAttrs = (e) => {
        // Remove empty rows, also remove elements that already exist
        // /^[a-z0-9]+$/i
        for (var i = 0; i < inuseAttr.length; i++) {
            if (inuseAttr[i].name == attributeData.name &&
                inuseAttr[i].appliesTo == attributeData.appliesTo) {
                setOverwriteModal(true)
                return
            }
        }
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify([attributeData]),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/attrset'), requestOptions)
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
                    alert(data["Result"]);
                } else {
                    updateInuseAttr(inuseAttr.concat(attributeData));
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const toggleDelete = (index) => {
        setDeleteModal(!deleteModal);
        setDeleteIndex(index)
    }

    const handleDelete = (index) => {
        var delData = [];
        delData.push(inuseAttr[index]);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(delData),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/attrset'), requestOptions)
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
                } else {
                    inuseAttr.splice(index, 1);
                    updateInuseAttr(inuseAttr);
                }
                setDeleteModal(!deleteModal);
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    return (
        <>
            <CRow>
                <CCol sm="12" lg="6">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            Add New Attributes <CButton onClick={() => console.log(inuseAttr)}>LOG</CButton>
                            <div className="text-muted small">Define attribute set for users, bundles and hosts.</div>
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CFormGroup row>
                                    <CCol md="4">
                                        <CLabel>Attribute Applies To</CLabel>
                                    </CCol>
                                    <CCol md="8">
                                        <div>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio1" name="appliesTo" value="Users" onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio1"><CIcon name="cil-user" /> User</CLabel>
                                            </CFormGroup>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio2" name="appliesTo" value="Bundles" onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio2"><CIcon name="cil-notes" /> AppGroup</CLabel>
                                            </CFormGroup>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio3" name="appliesTo" value="Hosts" onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio3"><CIcon name="cil-input-power" /> Host</CLabel>
                                            </CFormGroup>
                                        </div>
                                    </CCol>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel htmlFor="nf-attribute">Attribute Name</CLabel>
                                    <CInputGroup>
                                        <CInput name="name" placeholder="Enter Attribute.." onChange={handleChange}/>
                                        <CDropdown className="input-group-append">
                                            <CDropdownToggle caret className="border-success bg-success-light text-success">
                                                {attributeData.type}
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem onClick={(e) => handleType(e, "String")}>String</CDropdownItem>
                                                <CDropdownItem onClick={(e) => handleType(e, "Boolean")}>Boolean</CDropdownItem>
                                                <CDropdownItem onClick={(e) => handleType(e, "Date")}>Date</CDropdownItem>
                                                <CDropdownItem onClick={(e) => handleType(e, "Number")}>Number</CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                        {' '}
                                        <CInvalidFeedback>Please use alphanumerics for your attribute Name!</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                                {attributeData.type == "String" &&
                                    <>
                                        <div className="mb-3"><strong>Checksums</strong></div>
                                        <CFormGroup row>
                                            <CCol md="6">
                                                <CPopover 
                                                    header="What is Single or Multi Value Type?"
                                                    content="If this attribute is expected to have more than one value, select Multi Value.
                                                    For example, a department attribute for a user might need multiple values. John might
                                                    be in the sales department & marketing department"
                                                >
                                                    <CLabel><FontAwesomeIcon icon="info-circle"/> Single or Multi Value Type</CLabel>
                                                </CPopover>
                                            </CCol>
                                            <CCol md="6">
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio4" name="isArray" value={false} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio4">Single Value</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio5" name="isArray" value={true} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio5">Multi Value</CLabel>
                                                </CFormGroup>
                                            </CCol>
                                        </CFormGroup>
                                        <CFormGroup row>
                                            <CCol md="6">
                                                <CPopover
                                                    header="What is Length Check?"
                                                    content="Description of length check"
                                                >
                                                    <CLabel><FontAwesomeIcon icon="info-circle"/> Length Check</CLabel>
                                                </CPopover>
                                            </CCol>
                                            <CCol md="6">
                                                <div>
                                                    <CSwitch className={'mx-1'} variant={'3d'} color={'primary'} onChange={rangeCheck}/>
                                                </div>
                                                {attributeData.rangeCheck &&
                                                    <CRow className="mt-3">
                                                        <CCol md="3">
                                                            <div>
                                                                <CInput name="rangeCheck" defaultValue={attributeData.rangeCheck} onChange={handleChange}/>
                                                            </div>
                                                        </CCol>
                                                    </CRow>
                                                }
                                            </CCol>
                                        </CFormGroup>
                                    </>
                                   
                                }
                                {attributeData.type == "Number" &&
                                    <>
                                        <div className="mb-3"><strong>Checksums</strong></div>
                                        <CFormGroup row>
                                            <CCol md="4">
                                                <CLabel>Integer or Float</CLabel>
                                            </CCol>
                                            <CCol md="8">
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio4" name="numType" value="int" onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio4">Integer</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio5" name="numType" value="float" onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio5">Float</CLabel>
                                                </CFormGroup>
                                            </CCol>
                                        </CFormGroup>
                                        <CFormGroup row>
                                            <CCol md="4">
                                                <CLabel>Single or Multi Value Type</CLabel>
                                            </CCol>
                                            <CCol md="8">
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio6" name="isArray" value={false} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio6">Single</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio7" name="isArray" value={true} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio7">Multiple</CLabel>
                                                </CFormGroup>
                                            </CCol>
                                        </CFormGroup>
                                        <CFormGroup row>
                                            <CCol md="4">
                                                <CLabel>Range Check</CLabel>
                                            </CCol>
                                            <CCol md="8">
                                                <div>
                                                    <CSwitch className={'mx-1'} variant={'3d'} color={'primary'} onChange={rangeCheck}/>
                                                </div>
                                                {attributeData.rangeCheck &&
                                                    <CRow className="mt-3">
                                                        <CCol md="3">
                                                            Min: <CInput defaultValue={attributeData.rangeCheck}/>
                                                        </CCol>
                                                        <CCol md="3">
                                                            Max: <CInput defaultValue={attributeData.rangeCheck}/>
                                                        </CCol>
                                                    </CRow>
                                                    
                                                }
                                            </CCol>
                                        </CFormGroup>
                                    </>
                                }
                                {attributeData.type == "Date" && 
                                    <>
                                        <div className="mb-3"><strong>Checksums</strong></div>
                                        <CFormGroup row>
                                            <CCol md="4">
                                                <CLabel>Single Date or Range of Dates</CLabel>
                                            </CCol>
                                            <CCol md="8">
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio4" name="dateRange" value={false} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio4">Single</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio5" name="dateRange" value={true} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio5">Range</CLabel>
                                                </CFormGroup>
                                            </CCol>
                                        </CFormGroup>
                                    </>
                                }
                            </CForm>
                        </CCardBody>
                        <CCardFooter>
                            <CButton className="button-footer-danger" variant="outline" color="danger" onClick={() => { setResetWarning(true) }}><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                            <CButton className="button-footer-success" variant="outline" color="success" onClick={(e) => commitAttrs(e)}><CIcon name="cil-scrubber" /> <strong>Add</strong></CButton>
                        </CCardFooter>
                    </CCard>
                    <CModal show={resetWarning} onClose={() => setResetWarning(false)} color="danger">
                        <CModalHeader closeButton>
                            <CModalTitle>Attention!</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            Are you sure you want to reset new attributes?
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="danger" onClick={reset}>Reset</CButton>
                            <CButton color="secondary" onClick={() => setResetWarning(false)}>Cancel</CButton>
                        </CModalFooter>
                    </CModal>
                </CCol>

                {/* Warning to be triggered if tenant attempts to delete an attribute. Confirms deletion or cancels */}
                <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                    <CModalHeader className='bg-danger text-white py-n5' closeButton>
                        <strong>Confirm Deletion</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                        <strong>Are you sure you want to delete this attribute?</strong>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="danger"
                            onClick={() => { handleDelete(deleteIndex) }}
                        >Confirm</CButton>
                        <CButton
                            color="secondary"
                            onClick={() => setDeleteModal(!deleteModal)}
                        >Cancel</CButton>
                    </CModalFooter>
                </CModal>
            </CRow>

            <CRow>
                <CCol sm="12">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            Existing Attributes
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                fields={fields}
                                items={inuseAttr}
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip content='Edit' className='bottom'>
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
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
                                                    <CTooltip content='Delete' className='bottom'>
                                                        <CButton
                                                            className="button-table"
                                                            color='danger'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleDelete(index) }}
                                                        >
                                                            <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                }}
                            >
                            </CDataTable>
                        </CCardBody>
                        <CCardFooter>
                            <CButton className="button-footer-primary" color="primary" variant="outline" onClick={handleRefresh}>
                                <CIcon name="cil-reload" />
                                <strong>{" "}Refresh</strong>
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(AttributeEditor)
