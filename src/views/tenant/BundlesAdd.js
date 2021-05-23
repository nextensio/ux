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
    CInvalidFeedback,
    CRow,
    CSelect,
    CLabel,
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
        gateway: "",
    });
    const initBundleAttrData = Object.freeze({
        bid: ""
    });
    const [bundleData, updateBundleData] = useState(initBundleData);
    const [bundleAttrData, updateBundleAttrData] = useState(initBundleAttrData);
    const [attrData, updateAttrData] = useState(Object.freeze([]));
    // gw data for the dropdown
    const [gatewayData, updateGatewayData] = useState(Object.freeze([]));
    const [invalidFormState, setInvalidFormState] = useState(false);

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
            .then(data => {
                var fields = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Bundles') {
                        fields.push(data[i].name);
                    }
                }
                fields.sort()
                updateAttrData(fields);
            });
    }, []);

    useEffect(() => {
        fetch(common.api_href('/api/v1/global/get/allgateways'), hdrs)
            .then(response => response.json())
            .then(data => {
                var gatewayNames = []
                for (var i = 0; i < data.length; i++) {
                    gatewayNames.push(data[i].name);
                }
                gatewayNames.sort()
                updateGatewayData(gatewayNames)
            });
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
                gateway: bundleData.gateway, services: services,
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
                                            <CIcon name="cil-notes"/>
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="bid" placeholder={bundleData.bid} onChange={e => {handleBundleChange(e); handleAttrChange(e)}}  invalid={invalidFormState}/>
                                    <CInvalidFeedback className="help-block">Please enter a valid email</CInvalidFeedback>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>AppGroup Name</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-tag"/>
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="name" placeholder={bundleData.name} onChange={handleBundleChange}/>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>Services, comma seperated</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-settings"/>
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="services" placeholder={bundleData.services} onChange={handleBundleChange} />
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>Gateway</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-sitemap"/>
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CSelect name="gateway" custom onChange={handleBundleChange}>
                                        <option value={undefined}>Please select a gateway</option>
                                        {gatewayData.map(gateway => {
                                            return (
                                                <option value={gateway}>{gateway}</option>
                                            )
                                        })}
                                    </CSelect>
                                </CInputGroup>
                            </CFormGroup>
                        </CForm>
                        <div className="title py-3">Attributes</div>
                        <CForm>
                            {attrData.map(attr => {
                                return (
                                    <CFormGroup>
                                        <CLabel>{attr}</CLabel>
                                        <CInputGroup>
                                            <CInput name={attr} placeholder={attr} onChange={handleAttrChange} />
                                        </CInputGroup>
                                        <CFormText>Use commas to delimit multiple values.</CFormText>
                                    </CFormGroup>
                                )
                            })}
                        </CForm>
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
    )
}

export default withRouter(BundlesAdd)