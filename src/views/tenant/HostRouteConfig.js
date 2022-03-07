import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CForm,
    CInput,
    CInputGroup,
    CInvalidFeedback,
    CLabel,
    CCardHeader,
    CFormGroup,
    CFormText,
    CCardFooter,
    CPopover,
    CSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

var common = require('../../common')

const HostRouteConfig = (props) => {
    var initAttrNames = Object.freeze(
        []
    );
    const [hostState, updateHostState] = useState("");
    const [attrNames, setAttrNames] = useState(initAttrNames);

    // Route object ie {tag: '', hostattr1: '', hostattr2: '', ...}
    // is held in routeObj State
    const [routeObj, updateRouteObj] = useState("");

    // Route object index is held in configIndex since routeattrs property is in list form
    // [{tag: '', ...}, {tag: '', ...}, {tag: '', ...}]
    const [configIndex, setConfigIndex] = useState("");

    // attrData is different from attrNames in that the variable contains the name and type of 
    // the attributes, ie {name: "employeeLevel", type: "Number", appliesTo: "Hosts", ...}
    const [attrData, setAttrData] = useState(Object.freeze([]));
    const [errObj, updateErrObj] = useState({})

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
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
    // defines the host attributes the tenant assigned (attrNames)
    // calls this affect anytime props or hostState is modified
    useEffect(() => {
        if (hostState != "") {
            updateRouteObj(hostState.routeattrs[configIndex])
            const hostStateAttrs = []
            Object.keys(hostState.routeattrs[configIndex]).forEach((key, index) => {
                hostStateAttrs.push(key)
            })
            setAttrNames(hostStateAttrs)
        }
    }, [props, hostState]);

    // We call the attribute api and match the host attribute defined by tenant with the ones in our DB
    // Then we extract the type to create the attrData state. example {name: attr1, type: string}
    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/all'), hdrs)
            .then(response => response.json())
            .then(data => {
                const hostAttrs = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo === "Hosts") {
                        if (data[i].name[0] === "_") {
                            continue
                        }
                        else if (data[i].group === props.match.params.group) {
                            hostAttrs.push(data[i])
                        }
                    }
                }
                setAttrData(hostAttrs)
            });
    }, [props, attrNames]);

    const toAttributeEditor = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/attreditor')
    }

    const handleAttrChange = (e) => {
        let input
        input = e.target.value.trim()
        updateRouteObj({
            ...routeObj,
            [e.target.name]: input
        })
    }

    const handleMultiStringAttrChange = (e) => {
        let input
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => item.trim());
        } else {
            input = e.target.value.trim()
        }
        updateRouteObj({
            ...routeObj,
            [e.target.name]: [input]
        })
    };

    const handleSingleNumberAttrChange = (e) => {
        let input = parseInt(e.target.value)
        updateRouteObj({
            ...routeObj,
            [e.target.name]: input
        })
    }

    const handleMultiNumberAttrChange = (e) => {
        let input
        var intRegex = /^[-+]?\d+$/
        const attrName = e.target.name
        if (e.target.value.trim() === "") {
            input = 0
        }
        // Check if input contains comma, if so separate the values
        else if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => {
                if (intRegex.test(item.trim())) {
                    return parseInt(item.trim())
                } else {
                    // ERR! will be a keyword string used in the validation function
                    return "ERR!"
                }
            })
        } else {
            if (intRegex.test(e.target.value.trim())) {
                input = parseInt(e.target.value.trim())
            } else {
                // ERR! will be a keyword string used in the validation function
                input = "ERR!"
            }
        }
        updateRouteObj({
            ...routeObj,
            [attrName]: [input]
        })
    }

    const handleSingleBoolAttrChange = (e) => {
        let input
        if (e.target.value === "true") {
            input = true
        } else if (e.target.value === "false") {
            input = false
        }
        updateRouteObj({
            ...routeObj,
            [e.target.name]: input
        })
    }


    const handleMultiBoolAttrChange = (e) => {
        let input
        if (e.target.value.trim() === "") {
            input = false
            // Check if input contains comma, if so separate the values
        } else if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => {
                if (item.trim().toLowerCase() === "true") {
                    return true
                } else if (item.trim().toLowerCase() === "false") {
                    return false
                } else {
                    // ERR! will be a keyword string used in the validation function
                    return "ERR!"
                }
            })
        } else {
            if (e.target.value.trim().toLowerCase() === "true") {
                input = true
            } else if (e.target.value.trim().toLowerCase() === "false") {
                input = false
            } else {
                // ERR! will be a keyword string used in the validation function
                input = "ERR!"
            }
        }
        updateRouteObj({
            ...routeObj,
            [e.target.name]: [input]
        })
    }

    const handleSingleDateAttrChange = (e) => {
        updateRouteObj({
            ...routeObj,
            [e.target.name]: e.target.value
        })
    }
    const handleMultiDateAttrChange = (e) => {
        let input
        // Regex for YYYY-MM-DD format
        const dateRe = /^\d{4}-\d{2}-\d{2}$/;
        if (e.target.value.trim() === "") {
            input = ""
            // Check if input contains comma, if so separate the values
        } else if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => {
                // convert to Epoch GMT
                if (dateRe.test(item.trim())) {
                    return item.trim()
                } else {
                    // ERR! will be a keyword string used in the validation function
                    return "ERR!"
                }
            })
        } else {
            if (dateRe.test(e.target.value.trim())) {
                input = e.target.value.trim()
            } else {
                input = "ERR!"
            }
        }
        updateRouteObj({
            ...routeObj,
            [e.target.name]: [input]
        })
    }

    function fillEmptyInputs() {
        let attrState = { ...routeObj }
        attrData.forEach((item) => {
            if (!(item.name in attrState)) {
                if (item.isArray == "true") {
                    if (item.type == "String" || item.type == "Date") {
                        attrState[item.name] = [""]
                    }
                    if (item.type == "Number") {
                        attrState[item.name] = [0]
                    }
                    if (item.type == "Boolean") {
                        attrState[item.name] = [false]
                    }
                }
                if (item.isArray == "false") {
                    if (item.type == "String" || item.type == "Date") {
                        attrState[item.name] = ""
                    }
                    if (item.type == "Number") {
                        attrState[item.name] = 0
                    }
                    if (item.type == "Boolean") {
                        attrState[item.name] = false
                    }
                }
            }
        })
        updateRouteObj(attrState)
        return attrState
    }

    function validate(attrState) {
        let errs = {}
        const alphanumericRe = /^[a-z0-9]+$/i
        if (!alphanumericRe.test(String(routeObj.tag))) {
            errs.tag = true
        }
        attrData.forEach((item) => {
            if (item.isArray == "true" && JSON.stringify(attrState[item.name]).includes("ERR!")) {
                errs[item.name] = true
            }
        })
        updateErrObj(errs)
        return errs
    }

    const handleConfirm = (e) => {
        e.preventDefault()
        let attrState = fillEmptyInputs()
        let errs = validate(attrState)
        if (Object.keys(errs).length !== 0) {
            return
        }
        hostState.routeattrs[configIndex] = routeObj
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
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
                    props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/hosts')
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
                        {routeObj.tag != ""
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
                            <CInput name='tag' defaultValue={routeObj.tag} onChange={handleAttrChange} invalid={errObj.tag} />
                            <CInvalidFeedback>Routes can only have alphanumeric values.</CInvalidFeedback>
                        </CFormGroup>
                        <div className="title py-3">Attributes</div>
                        {attrData.length === 0 &&
                            <div><FontAwesomeIcon icon="info-circle" className="text-info" />{' '}
                                You have no attributes for Apps. <a className="text-primary" onClick={toAttributeEditor}>Click here</a> to add an attribute.
                            </div>
                        }
                        {attrData.map(attr => {
                            return (
                                <CForm>
                                    {attr.type == "String" &&
                                        <>
                                            {attr.isArray == "true" ?
                                                <CFormGroup>
                                                    <CPopover
                                                        title="Popover title"
                                                        content="This attribute has been defined as string type and accepts multiple values."
                                                    >
                                                        <FontAwesomeIcon icon="info-circle" />
                                                    </CPopover>
                                                    {' '}<CLabel>{attr.name}</CLabel>
                                                    <CInput type="text" name={attr.name} defaultValue={routeObj[attr.name]} onChange={handleMultiStringAttrChange} invalid={errObj[attr.name + "Length"]} />
                                                    {errObj[attr.name + "Length"] ?
                                                        <CInvalidFeedback>Max character length reached.</CInvalidFeedback> :
                                                        <CFormText>Enter attribute values. Use commas to delimit.</CFormText>
                                                    }
                                                </CFormGroup>
                                                :
                                                <CFormGroup>
                                                    <CPopover
                                                        title="Popover title"
                                                        content="This attribute has been defined as string type and accepts a single value."
                                                    >
                                                        <FontAwesomeIcon icon="info-circle" />
                                                    </CPopover>
                                                    {' '}<CLabel>{attr.name}</CLabel>
                                                    <CInput type="text" name={attr.name} defaultValue={routeObj[attr.name]} onChange={handleAttrChange} invalid={errObj[attr.name + "Length"]} />
                                                    {errObj[attr.name + "Length"] ?
                                                        <CInvalidFeedback>Max character length reached.</CInvalidFeedback> :
                                                        <CFormText>Enter attribute value.</CFormText>
                                                    }
                                                </CFormGroup>
                                            }
                                        </>
                                    }
                                    {attr.type == "Number" &&
                                        <>
                                            {attr.isArray == "true" ?
                                                <CFormGroup>
                                                    <CPopover
                                                        title="Popover title"
                                                        content="This attribute has been defined as number type and accepts multiple values."
                                                    >
                                                        <FontAwesomeIcon icon="info-circle" />
                                                    </CPopover>
                                                    {' '}<CLabel>{attr.name}</CLabel>
                                                    <CInput type="text" name={attr.name} defaultValue={routeObj[attr.name]} onChange={handleMultiNumberAttrChange} invalid={errObj[attr.name]} />
                                                    {errObj[attr.name] ?
                                                        <CInvalidFeedback>This attribute is designated for integers. Do not leave hanging commas.</CInvalidFeedback> :
                                                        <CFormText>Enter attribute values. Use commas to delimit.</CFormText>
                                                    }
                                                </CFormGroup>
                                                :
                                                <CFormGroup>
                                                    <CPopover
                                                        title="Popover title"
                                                        content="This attribute has been defined as number type and accepts a single value."
                                                    >
                                                        <FontAwesomeIcon icon="info-circle" />
                                                    </CPopover>
                                                    {' '}<CLabel>{attr.name}</CLabel>
                                                    <CInput type="number" name={attr.name} defaultValue={routeObj[attr.name]} onChange={handleSingleNumberAttrChange} />
                                                    <CFormText>Enter attribute value.</CFormText>
                                                </CFormGroup>
                                            }
                                        </>
                                    }
                                    {attr.type == "Boolean" &&
                                        <>
                                            {attr.isArray == "true" ?
                                                <CFormGroup>
                                                    <CPopover
                                                        title="Popover title"
                                                        content="This attribute has been defined as boolean type and accepts multiple values."
                                                    >
                                                        <FontAwesomeIcon icon="info-circle" />
                                                    </CPopover>
                                                    {' '}<CLabel>{attr.name}</CLabel>
                                                    <CInput type="text" name={attr.name} defaultValue={routeObj[attr.name]} onChange={handleMultiBoolAttrChange} invalid={errObj[attr.name]} />
                                                    {errObj[attr.name] ?
                                                        <CInvalidFeedback>This attribute is designated for booleans. Do not leave hanging commas.</CInvalidFeedback> :
                                                        <CFormText>Enter attribute values. Use commas to delimit.</CFormText>
                                                    }
                                                </CFormGroup>
                                                :
                                                <CFormGroup>
                                                    <CLabel>{attr.name}</CLabel>
                                                    <CSelect name={attr.name} value={routeObj[attr.name]} custom onChange={handleSingleBoolAttrChange}>
                                                        <option value={true}>True</option>
                                                        <option value={false}>False</option>
                                                    </CSelect>
                                                </CFormGroup>
                                            }
                                        </>
                                    }
                                    {attr.type == "Date" &&
                                        <>
                                            {attr.isArray == "true" ?
                                                <CFormGroup>
                                                    <CPopover
                                                        title="Popover title"
                                                        content="This attribute has been defined as date type and accepts multiple values."
                                                    >
                                                        <FontAwesomeIcon icon="info-circle" />
                                                    </CPopover>
                                                    {' '}<CLabel>{attr.name}</CLabel>
                                                    <CInput type="text" name={attr.name} defaultValue={routeObj[attr.name]} onChange={handleMultiDateAttrChange} invalid={errObj[attr.name]} />
                                                    {errObj[attr.name] ?
                                                        <CInvalidFeedback>Please enter your format as YYYY-MM-DD. Do not leave hanging commas.</CInvalidFeedback> :
                                                        <CFormText>Enter attribute values. Use commas to delimit.</CFormText>
                                                    }
                                                </CFormGroup>
                                                :
                                                <CFormGroup>
                                                    <CLabel>{attr.name}</CLabel>
                                                    <CInputGroup>
                                                        <CInput type="date" id="date-input" value={routeObj[attr.name]} name={attr.name} placeholder={attr.name} onChange={handleSingleDateAttrChange} />
                                                    </CInputGroup>
                                                </CFormGroup>
                                            }
                                        </>
                                    }
                                </CForm>
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