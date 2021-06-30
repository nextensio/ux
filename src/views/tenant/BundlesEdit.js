import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CFormText,
    CInput,
    CInvalidFeedback,
    CInputGroup,
    CInputGroupAppend,
    CInputGroupPrepend,
    CInputGroupText,
    CInputRadio,
    CRow,
    CPopover,
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
    const maxCharLength = 20
    const [bundleState, updateBundleState] = useState("");
    const [bundleAttrState, updateBundleAttrState] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));
    const [errObj, updateErrObj] = useState({})

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
                        fields.push(data[i]);
                    }
                }
                fields.sort()
                updateAttrData(fields);
            });
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

    const toAttributeEditor = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/attreditor')
    }

    const handleBundleChange = (e) => {
        updateBundleState({
            ...bundleState,
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
            updateBundleAttrState({
                ...bundleAttrState,
                [e.target.name]: [input]
            })
        }
        else {
            input = e.target.value.trim().toString()
            updateBundleAttrState({
                ...bundleAttrState,
                [e.target.name]: input
            })
        }
    };

    function validate() {
        let errs = {}
        const podRe = /^[-+]?\d+$/

        if (!/\S/.test(bundleState.name)) {
            errs.name = true
        }
        if (!podRe.test(String(bundleState.cpodrepl).trim())) {
            errs.cpodrepl = true
        }
        if (!/\S/.test(bundleState.services)) {
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
        var cpodrepl = parseInt(bundleState.cpodrepl, 10)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                bid: bundleState.bid, name: bundleState.name,
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
                                    <CInput name="name" defaultValue={bundleState.name} onChange={handleBundleChange} invalid={errObj.name}/>
                                    <CInvalidFeedback>Please enter a value.</CInvalidFeedback>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>AppGroup Compute pods</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-3d" />
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="cpodrepl" defaultValue="1" onChange={handleBundleChange} invalid={errObj.cpodrepl}/>
                                    <CInvalidFeedback>Please enter an integer.</CInvalidFeedback>
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
                                    <CInput name="services" defaultValue={bundleState.services} onChange={handleBundleChange} invalid={errObj.services}/>
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
                                            {' '}<CLabel>{attr.name}</CLabel>
                                            <CInput name={attr.name} defaultValue={bundleAttrState[attr.name]} onChange={handleAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name]}/>
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
                                                    <CInputRadio custom id="inline-radio1" name={attr.name} value={true} checked={bundleState[attr.name] == "true"} onChange={handleAttrChange}/>
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio1">True</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio2" name={attr.name} value={false} checked={bundleState[attr.name] == "false"} onChange={handleAttrChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2">False</CLabel>
                                                </CFormGroup>
                                            </div>
                                        </>
                                    }
                                    {attr.type == "Date" &&
                                        <CFormGroup>
                                            <CLabel>{attr.name}</CLabel>
                                            <CInputGroup>
                                                <CInput type="date" id="date-input" name={attr.name} defaultValue={bundleState[attr.name]} onChange={handleAttrChange} />
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
                    <strong>{" "}Confirm</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(BundlesEdit)
