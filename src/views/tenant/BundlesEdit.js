import React, { lazy, useState, useEffect } from 'react'
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
    CInputGroupAppend,
    CInputGroupPrepend,
    CInputGroupText,
    CRow,
    CSelect,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './tenantviews.scss'

var common = require('../../common')

const BundlesEdit = (props) => {
    const [bundleState, updateBundleState] = useState("");
    const [bundleAttrState, updateBundleAttrState] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateBundleState(props.location.state)
        }
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
    }, []);

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundleattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].bid == bundleState.bid) {
                        var { bid, _name, _pod, ...rest } = data[i]
                        updateBundleAttrState({ bid, ...rest })
                    }
                }
            })
    }, [props, bundleState]);

    const handleBundleChange = (e) => {
        updateBundleState({
            ...bundleState,
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
        updateBundleAttrState({
            ...bundleAttrState,
            [e.target.name]: input
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        var services = bundleState.services
        if (bundleState.services) {
            if (!Array.isArray(bundleState.services)) {
                services = bundleState.services.split(',').map(function (item) {
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
                bid: bundleState.bid, name: bundleState.name,
                services: services,
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
                    handleAttrSubmit(e);
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    const handleAttrSubmit = (e) => {
        Object.keys(bundleAttrState).forEach(key => {
            if (bundleAttrState[key].length == 0) {
                bundleAttrState[key] = null
            }
        })
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(bundleAttrState),
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
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Edit Details for {bundleState.bid}</strong>
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
                                    <CInput name="bid" value={bundleState.bid} readOnly />
                                    <CInputGroupAppend>
                                        <CInputGroupText>
                                            <CIcon name="cil-lock-locked" />
                                        </CInputGroupText>
                                    </CInputGroupAppend>
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
                                    <CInput name="name" defaultValue={bundleState.name} onChange={handleBundleChange} />
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
                                    <CInput name="services" defaultValue={bundleState.services} onChange={handleBundleChange} />
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
                                            <CInput name={attr} defaultValue={bundleAttrState[attr]} onChange={handleAttrChange} />
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
                    <strong>{" "}Confirm</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(BundlesEdit)