import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CRow,
    CSelect,
    CLabel,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CFormGroup,
    CFormText,
    CCardFooter,
    CInvalidFeedback,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')

const ClusterConfig = (props) => {
    const initConfigData = Object.freeze({
        gateway: "",
        image: "",
        apodrepl: ""
    });
    const [configData, updateConfigData] = useState(initConfigData);
    // gateway data for the dropdown
    const [gatewayData, updateGatewayData] = useState(Object.freeze([]));
    const [errObj, updateErrObj] = useState({});
    const [requestModal, setRequestModal] = useState(false)

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allgateways'), hdrs)
            .then(response => response.json())
            .then(data => {
                var names = []
                for (var i = 0; i < data.length; i++) {
                    names.push(data[i].name);
                }
                names.sort()
                updateGatewayData(names)
            });
    }, []);

    const handleChange = (e) => {
        if (e.target.name == "gateway") {
	    var gateway = e.target.value.trim();
            fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenantcluster/' + gateway), hdrs)
                .then(response => response.json())
                .then(data => {
                    updateConfigData({
		        gateway: gateway,
                        apodrepl: data.TenantCl.apodrepl,
                        image: data.TenantCl.image,
                    });
                });
        } else if (e.target.name == "image") {
            updateConfigData({
	        ...configData,
                [e.target.name]: e.target.value.trim(),
            });
	} else if (e.target.name == "apods") {	
            var input = e.target.value.trim().toString()
            input = parseInt(input, 10)
            updateConfigData({
                ...configData,
                apodrepl: input
            });
	}
    };

    function validate() {
        let errs = {};
        const podRe = /^[-+]?\d+$/;
        if (configData.gateway == "") {
            errs.gateway = true
        }
        if (!/\S/.test(configData.image)) {
            errs.image = true
        }
        if (!podRe.test(String(configData.apodrepl))) {
            errs.apodrepl = true
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
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                gateway: configData.gateway, image: configData.image, apodrepl: configData.apodrepl,
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/tenantcluster'), requestOptions)
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
                    setRequestModal(true)
                    return
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };


    return (
        <>
            <CCard>
                <CCardHeader>
                    <strong>Gateway Configuration</strong>
                </CCardHeader>
                <CCardBody>
                    <CRow>
                        <CCol sm="8">
                            <CForm>
                                <CFormGroup>
                                    <CLabel>Gateway</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-sitemap" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CSelect name="gateway" custom onChange={handleChange} invalid={errObj.gateway}>
                                            <option value={undefined}>Please select a gateway</option>
                                            {gatewayData.map(gateway => {
                                                return (
                                                    <option key={gateway} value={gateway}>{gateway}</option>
                                                )
                                            })}
                                        </CSelect>
                                        <CInvalidFeedback>Please select a value.</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>Image (Current: {configData.image})</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-image" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="image" defaultValue={configData.image} onChange={handleChange} invalid={errObj.image} />
                                        <CInvalidFeedback>Please enter an image.</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>Ingress (user) compute pods. Current: {configData.apodrepl}</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-3d" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="apods" defaultValue={configData.apodrepl} onChange={handleChange} invalid={errObj.apodrepl} />
                                        <CInvalidFeedback>Please enter an integer value.</CInvalidFeedback>
                                    </CInputGroup>
                                    {!errObj.apodrepl && <CFormText>Update the compute pods.</CFormText>}
                                </CFormGroup>
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
            <CModal show={requestModal} onClose={() => setRequestModal(!requestModal)}>
                <CModalHeader className='bg-success text-white py-n5' closeButton>
                    <strong>Request succesful</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>Modified values can be seen on page reload.</strong>
                </CModalBody>
                <CModalFooter>
                    <CButton color="success" onClick={() => setRequestModal(!requestModal)}>OK</CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default withRouter(ClusterConfig)
