import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CForm,
    CInput,
    CInputRadio,
    CInputGroup,
    CLabel,
    CCardHeader,
    CFormGroup,
    CFormText,
    CCardFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../common')

const HostRouteConfig = (props) => {
    var initAttrData = Object.freeze(
        []
    );
    const [hostState, updateHostState] = useState("");
    const [attrsState, setAttrsState] = useState(initAttrData);
    
    // Route object ie {tag: '', hostattr1: '', hostattr2: '', ...}
    // is held in routeObj State
    const [routeObj, updateRouteObj] = useState("");
    
    // Route object index is held in configIndex since routeattrs property is in list form
    // [{tag: '', ...}, {tag: '', ...}, {tag: '', ...}]
    const [configIndex, setConfigIndex] = useState("");
    
    // attrs is different from attrsState in that the variable contains the name and type of 
    // the attributes, ie {name: "employeeLevel", type: "Number", appliesTo: "Hosts", ...}
    const [attrs, setAttrs] = useState(initAttrData);
    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    // updates hostState and configIndex from props
    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateHostState(props.location.state[0])
            setConfigIndex(props.location.state[1])
        }
    }, []);

    // defines the routeObject we are configuring and will be used in handleConfirm
    // defines the host attributes the tenant assigned (attrsState)
    // calls this affect anytime props or hostState is modified
    useEffect(() => {
        if (hostState != "") {
            updateRouteObj(hostState.routeattrs[configIndex])
            const hostStateAttrs = []
            Object.keys(hostState.routeattrs[configIndex]).forEach((key,index) => {
                hostStateAttrs.push(key)
            })
            setAttrsState(hostStateAttrs)
        }
    }, [props, hostState]);

    // We call the attribute api and match the host attribute defined by tenant with the ones in our DB
    // Then we extract the type to create the attrs state. example {name: attr1, type: string}
    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                const attrObjs = [];
                for (var i = 0; i < data.length; i++) {
                    if (attrsState.includes(data[i].name) && data[i].appliesTo == "Hosts") {
                        attrObjs.push(data[i]);
                    }
                }
                setAttrs(attrObjs)
            });
    }, [props, attrsState]);

    const handleChange = (e) => {
        let input
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',')
        }
        else {
            input = e.target.value.trim().toString()
        }
        updateRouteObj({
            ...routeObj,
            [e.target.name]: input
        });
        
    }

    const handleConfirm = (e) => {
        e.preventDefault()
        hostState.routeattrs[configIndex] = routeObj
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(hostState),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/hostattr'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/hosts')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    return (
        <>
            <CCard>
                <CCardHeader>
                    Modify Attributes for {hostState.host} 
                    <div className="subtitle">
                        {routeObj.tag!=""
                            ?
                           routeObj.tag + "." + hostState.host
                            :
                            <></>
                        }
                    </div>
                </CCardHeader>
                <CCardBody>
                    <CForm>
                        <CFormGroup>
                            <CLabel htmlFor="nf-email">Route</CLabel>
                            <CInput name='tag' defaultValue={routeObj.tag} onChange={handleChange}></CInput>
                        </CFormGroup>
                        {(attrs).map((attr, i) => {
                            const name = attr.name
                            return (
                                <>
                                    {attr.type == "String" && 
                                        <CFormGroup>
                                            <CLabel htmlFor="nf-password">{attr.name}</CLabel>
                                            <CInputGroup>
                                                <CInput name={attr.name} defaultValue={routeObj[name]} onChange={handleChange} />
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
                                                    <CInputRadio custom id="inline-radio1" name={attr.name} value={true} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio1">True</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio2" name={attr.name} value={false} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2">False</CLabel>
                                                </CFormGroup>
                                            </div>
                                        </>
                                    }
                                    {attr.type == "Number" &&
                                        <CFormGroup>
                                            <CLabel htmlFor="nf-password">{attr.name}</CLabel>
                                            <CInputGroup>
                                                <CInput name={attr.name} defaultValue={routeObj[name]} onChange={handleChange} />
                                            </CInputGroup>
                                            <CFormText>Use commas to delimit multiple values.</CFormText>
                                        </CFormGroup>
                                    }
                                    {attr.type == "Date" &&
                                        <CFormGroup>
                                            <CLabel>{attr.name}</CLabel>
                                            <CInputGroup>
                                                <CInput type="date" id="date-input" name={attr.name} defaultValue={routeObj[name]} onChange={handleChange} />
                                            </CInputGroup>
                                        </CFormGroup>
                                    }
                                </>
                            )
                        })}
                    </CForm>
                </CCardBody>
                <CCardFooter>
                    <CButton className="button-footer-success" color="success" variant="outline" onClick={handleConfirm}>
                        <CIcon name="cil-scrubber" />
                        <strong>{" "}Confirm</strong>
                    </CButton>
                </CCardFooter>
            </CCard>

        </>

    )
}

export default withRouter(HostRouteConfig)