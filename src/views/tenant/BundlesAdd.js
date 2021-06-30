import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CFormText,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInputRadio,
    CInvalidFeedback,
    CRow,
    CPopover,
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
    const maxCharLength = 20
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
    const [errObj, updateErrObj] = useState({});

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

    const toAttributeEditor = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/attreditor')
    }

    const handleBundleChange = (e) => {
        updateBundleData({
            ...bundleData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleAttrChange = (e) => {
        let input
        let targetLen = e.target.value.length
        // if maxLength is reached trigger error Obj and message.
        if (targetLen === maxCharLength) {
            updateErrObj({
                ...errObj,
                [e.target.name]: true
            })
        } 
        if (targetLen < maxCharLength && errObj[e.target.name]) {
            delete errObj[e.target.name]
        }
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => item.trim());
            updateBundleAttrData({
                ...bundleAttrData,
                [e.target.name]: [input]
            });
        }
        else {
            input = e.target.value.trim().toString();
            updateBundleAttrData({
                ...bundleAttrData,
                [e.target.name]: input
            });
        }
        
    };

    function validate() {
        let errs = {}
        const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const podRe = /^[-+]?\d+$/
        if (!emailRe.test(String(bundleData.bid).toLowerCase())) {
            errs.bid = true
        }
        if (!/\S/.test(bundleData.name)) {
            errs.name = true
        }
        if (!podRe.test(String(bundleData.cpodrepl).trim())) {
            errs.cpodrepl = true
        }
        if (!/\S/.test(bundleData.services)) {
            errs.services = true
        }
        updateErrObj(errs)
        return errs
    }

    

    const handleSubmit = (e) => {
        e.preventDefault()
        let errs = validate()
        if (Object.keys(errs).length !== 0) {
            return
        }
        if (bundleData.bid in existingBidData && overwriteModal == false) {
            setOverwriteModal(true)
            setOverwriteBid(bundleData.bid)
            return
        }
        var cpodrepl = parseInt(bundleData.cpodrepl, 10)
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
                    <CButton onClick={() => console.log(attrData)}>ERR</CButton>
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
                                        <CInput name="bid" onChange={e => { handleBundleChange(e); handleAttrChange(e) }} invalid={errObj.bid} />
                                        <CInvalidFeedback >Please enter a valid email</CInvalidFeedback>
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
                                        <CInput name="name" onChange={handleBundleChange} invalid={errObj.name}/>
                                        <CInvalidFeedback>Please enter a value.</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>AppGroup Compute Pods</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-3d" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="cpodrepl" defaultValue="1" onChange={handleBundleChange} invalid={errObj.cpodrepl}/>
                                        <CInvalidFeedback >Please enter an integer.</CInvalidFeedback>
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
                                        <CInput name="services" placeholder={bundleData.services} onChange={handleBundleChange} invalid={errObj.services}/>
                                        <CInvalidFeedback>Please enter a value.</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                            </CForm>
                            <div className="title py-3">Attributes</div>
                            {attrData.length === 0 &&
                                <div><FontAwesomeIcon icon="info-circle" className="text-info"/>{' '}
                                You have no attributes for AppGroups. <a className="text-primary" onClick={toAttributeEditor}>Click here</a> to add an attribute.
                                </div>
                            }
                            {attrData.map(attr => {
                                return (
                                    <CForm>
                                        {attr.type == "String" &&
                                            <CFormGroup>
                                                <CPopover 
                                                    title="Popover title"
                                                    content="If attribute is expected to have multiple values, use commas to delimit."
                                                >
                                                    <FontAwesomeIcon icon="info-circle"/>
                                                </CPopover>
                                                {' '}<CLabel htmlFor="nf-password">{attr.name}</CLabel>

                                                <CInput name={attr.name} placeholder={attr.name} onChange={handleAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name]}/>
                                                {errObj[attr.name] ?
                                                    <CInvalidFeedback>Max character length reached.</CInvalidFeedback> :
                                                    <CFormText>Enter attribute value(s).</CFormText> 
                                                }
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
