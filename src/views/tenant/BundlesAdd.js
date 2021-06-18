import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CFormText,
    CInput,
    CInputCheckbox,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInputRadio,
    CInvalidFeedback,
    CRow,
    CSelect,
    CLabel,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CCardHeader,
    CFormGroup,
    CCardFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './tenantviews.scss'

var common = require('../../common')

const BundlesAdd = (props) => {
    const initBundleData = Object.freeze({
        bid: "",
        name: "",
        services: "",
        cpodrepl: 1,
    });
    const initBundleAttrData = Object.freeze({
        bid: ""
    });
    const [bundleData, updateBundleData] = useState(initBundleData);
    const [bundleAttrData, updateBundleAttrData] = useState(initBundleAttrData);
    const [existingBidData, updateExistingBidData] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));
    // gw data for the dropdown
    const [invalidFormState, setInvalidFormState] = useState(false);

    const [overwriteModal, setOverwriteModal] = useState(false);
    const [overwriteBid, setOverwriteBid] = useState("");

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateExistingBidData(props.location.state)
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                var fields = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Bundles') {
                        fields.push(data[i]);
                    }
                }
                fields.sort()
                updateAttrData(fields);
            });
    }, []);

    useEffect(() => {
    }, []);

    const handleBundleChange = (e) => {
        updateBundleData({
            ...bundleData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleAttrChange = (e) => {
        let input
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',')
        }
        else {
            input = e.target.value.trim().toString()
        }
        updateBundleAttrData({
            ...bundleAttrData,
            [e.target.name]: input
        });
    };

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateEmail(bundleData.bid)) {
            setInvalidFormState(true)
            return
        }
        if (bundleData.bid in existingBidData && overwriteModal == false) {
            setOverwriteModal(true)
            setOverwriteBid(bundleData.bid)
            return
        }
        var services = bundleData.services
        if (bundleData.services) {
            if (!Array.isArray(bundleData.services)) {
                services = bundleData.services.split(',').map(function (item) {
                    return item.trim();
                })
            }
        } else {
            services = []
        }
        var cpodrepl = 1
        if (bundleData.cpodrepl) {
            cpodrepl = parseInt(bundleData.cpodrepl, 10)
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                bid: bundleData.bid, name: bundleData.name,
                services: services, cpodrepl: cpodrepl,
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/bundle'), requestOptions)
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
                    // bundle attribute http post must be run after bundle http post
                    handleAttrSubmit(e)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    // user attribute http post function
    const handleAttrSubmit = (e) => {
        if (Object.keys(bundleAttrData).length > 1) {
            e.preventDefault()
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: bearer },
                body: JSON.stringify(bundleAttrData),
            };
            fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/bundleattr'), requestOptions)
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
                    else {
                        props.history.push('/tenant/' + props.match.params.id + '/bundles')
                    }
                })
                .catch(error => {
                    alert('Error contacting server', error);
                })
        } else {
            props.history.push('/tenant/' + props.match.params.id + '/bundles')
        }

    };

    return (
        <>
            <CCard>
                <CCardHeader>
                    <strong>Add AppGroup</strong>
                </CCardHeader>
                <CCardBody>
                    <CRow>
                        <CCol sm="8">
                            <CForm>
                                <CFormGroup>
                                    <CLabel>AppGroup ID</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-notes" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="bid" placeholder={bundleData.bid} onChange={e => { handleBundleChange(e); handleAttrChange(e) }} invalid={invalidFormState} />
                                        <CInvalidFeedback className="help-block">Please enter a valid email</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>AppGroup Name</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-tag" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="name" placeholder={bundleData.name} onChange={handleBundleChange} />
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>AppGroup Compute pods</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-tag" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="cpodrepl" defaultValue="1" onChange={handleBundleChange} />
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>Services, comma seperated</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-settings" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="services" placeholder={bundleData.services} onChange={handleBundleChange} />
                                    </CInputGroup>
                                </CFormGroup>
                            </CForm>
                            <div className="title py-3">Attributes</div>
                            {attrData.map(attr => {
                                return (
                                    <CForm>
                                        {attr.type == "String" &&
                                            <CFormGroup>
                                                <CLabel htmlFor="nf-password">{attr.name}</CLabel>
                                                <CInputGroup>
                                                    <CInput name={attr.name} placeholder={attr.name} onChange={handleAttrChange} />
                                                </CInputGroup>
                                                <CFormText>Use commas to delimit multiple values.</CFormText>
                                            </CFormGroup>
                                        }
                                        {attr.type == "Boolean" &&
                                            <>
                                                <div>
                                                    <CLabel>{attr.name}</CLabel>
                                                </div>
                                                <div className="mb-3">
                                                    <CFormGroup variant="custom-radio" inline>
                                                        <CInputRadio custom id="inline-radio1" name={attr.name} value={true} onChange={handleAttrChange} />
                                                        <CLabel variant="custom-checkbox" htmlFor="inline-radio1">True</CLabel>
                                                    </CFormGroup>
                                                    <CFormGroup variant="custom-radio" inline>
                                                        <CInputRadio custom id="inline-radio2" name={attr.name} value={false} onChange={handleAttrChange} />
                                                        <CLabel variant="custom-checkbox" htmlFor="inline-radio2">False</CLabel>
                                                    </CFormGroup>
                                                </div>
                                            </>
                                        }
                                        {attr.type == "Number" &&
                                            <CFormGroup>
                                                <CLabel htmlFor="nf-password">{attr.name}</CLabel>
                                                <CInputGroup>
                                                    <CInput name={attr.name} placeholder={attr.name} onChange={handleAttrChange} />
                                                </CInputGroup>
                                                <CFormText>Use commas to delimit multiple values.</CFormText>
                                            </CFormGroup>
                                        }
                                        {attr.type == "Date" &&
                                            <CFormGroup>
                                                <CLabel>{attr.name}</CLabel>
                                                <CInputGroup>
                                                    <CInput type="date" id="date-input" name={attr.name} placeholder={attr.name} onChange={handleAttrChange} />
                                                </CInputGroup>
                                            </CFormGroup>
                                        }
                                    </CForm>
                                )
                            })}
                        </CCol>
                    </CRow>
                </CCardBody>
                <CCardFooter>
                    <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                        <CIcon name="cil-scrubber" />
                        <strong>{" "}Add</strong>
                    </CButton>
                </CCardFooter>
            </CCard>
            <CModal show={overwriteModal} onClose={() => setOverwriteModal(!overwriteModal)}>
                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                    <strong>Are you sure you want to overwrite?</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>{overwriteBid} already exists in your user collection. Submitting will overwrite the entry.
                        Do you wish to proceed?
                    </strong>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        onClick={handleSubmit}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setOverwriteModal(!overwriteModal)}
                    >Cancel</CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default withRouter(BundlesAdd)