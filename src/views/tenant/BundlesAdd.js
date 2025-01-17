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
    CSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select'
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
    const [easyMode, setEasyMode] = useState(true)
    const [appData, updateAppData] = useState(Object.freeze([]))
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
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => { setEasyMode(data.Tenant.easymode) });
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allhostattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                let apps = []
                for (let i = 0; i < data.length; i++) {
                    if (data[i].routeattrs.length != 0) {
                        for (let j = 0; j < data[i].routeattrs.length; j++) {
                            var routeApp = ""
                            if (data[i].routeattrs[j].tag != "") {
                                routeApp = data[i].routeattrs[j].tag + "." + data[i].host
                            } else {
                                routeApp = data[i].host
                            }
                            apps.push({ label: routeApp, value: routeApp })
                        }
                    } else {
                        apps.push({ label: data[i].host, value: data[i].host })
                    }
                }
                updateAppData(apps)
            })
    }, []);

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateExistingBidData(props.location.state)
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/all'), hdrs)
            .then(response => response.json())
            .then(data => {
                var bundleAttrs = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo === "Bundles") {
                        if (data[i].name[0] === "_") {
                            continue
                        }
                        else if (data[i].group === props.match.params.group) {
                            bundleAttrs.push(data[i])
                        }
                    }
                }
                updateAttrData(bundleAttrs);
            });
    }, []);

    const handleBundleChange = (e) => {
        updateBundleData({
            ...bundleData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleAppsChange = (e) => {
        updateBundleData({
            ...bundleData,
            services: e
        })
    }

    const handleLengthCheck = (e) => {
        let targetLen = e.target.value.length
        let attrName = e.target.name
        // if maxLength is reached trigger error Obj and message.
        if (targetLen === maxCharLength) {
            updateErrObj({
                ...errObj,
                [attrName + "Length"]: true
            })
        }
        if (targetLen < maxCharLength && errObj[attrName + "Length"]) {
            delete errObj[attrName + "Length"]
        }
    }

    const handleAttrChange = (e) => {
        let input
        handleLengthCheck(e)
        input = e.target.value.trim()
        updateBundleAttrData({
            ...bundleAttrData,
            [e.target.name]: input
        })
    }

    const handleMultiStringAttrChange = (e) => {
        let input
        handleLengthCheck(e)
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => item.trim());
        } else {
            input = e.target.value.trim()
        }
        updateBundleAttrData({
            ...bundleAttrData,
            [e.target.name]: [input]
        })
    };

    const handleSingleNumberAttrChange = (e) => {
        let input = parseInt(e.target.value)
        updateBundleAttrData({
            ...bundleAttrData,
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
        updateBundleAttrData({
            ...bundleAttrData,
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
        updateBundleAttrData({
            ...bundleAttrData,
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
        updateBundleAttrData({
            ...bundleAttrData,
            [e.target.name]: [input]
        })
    }

    const handleSingleDateAttrChange = (e) => {
        let input
        // convert to Epoch GMT
        input = new Date(e.target.value).getTime() / 1000
        updateBundleAttrData({
            ...bundleAttrData,
            [e.target.name]: input
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
                    return new Date(item.trim()).getTime() / 1000
                } else {
                    // ERR! will be a keyword string used in the validation function
                    return "ERR!"
                }
            })
        } else {
            if (dateRe.test(e.target.value.trim())) {
                input = new Date(e.target.value.trim()).getTime() / 1000
            } else {
                input = "ERR!"
            }
        }
        updateBundleAttrData({
            ...bundleAttrData,
            [e.target.name]: [input]
        })
    }

    function fillEmptyInputs() {
        let attrState = { ...bundleAttrData }
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
        updateBundleAttrData(attrState)
        return attrState
    }

    function validate(attrState) {
        let errs = {}
        const bundleRe = /^[a-z0-9]+$/;
        const podRe = /^[-+]?\d+$/
        if (!bundleRe.test(String(bundleData.bid).trim())) {
            errs.bid = true
        }
        if (!bundleData.name) {
            errs.name = true
        }
        if (!podRe.test(String(bundleData.cpodrepl).trim())) {
            errs.cpodrepl = true
        }
        if (bundleData.services.length == 0) {
            errs.services = true
        }
        attrData.forEach((item) => {
            if (item.isArray == "true" && JSON.stringify(attrState[item.name]).includes("ERR!")) {
                errs[item.name] = true
            }
        })
        updateErrObj(errs)
        return errs
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        let attrState = fillEmptyInputs()
        let errs = validate(attrState)
        if (Object.keys(errs).length !== 0) {
            return
        }
        if (bundleData.bid in existingBidData && overwriteModal == false) {
            setOverwriteModal(true)
            setOverwriteBid(bundleData.bid)
            return
        }
        var cpodrepl = parseInt(bundleData.cpodrepl)
        var services = bundleData.services.map(service => {
            return service.value;
        })
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
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
                    handleAttrSubmit(e, attrState)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    // user attribute http post function
    const handleAttrSubmit = (e, attrState) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify(attrState),
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
                    props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/bundles')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            })
    }

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
                                        <CInput name="bid" onChange={e => { handleBundleChange(e); handleAttrChange(e) }} invalid={errObj.bid} />
                                        <CInvalidFeedback >Valid bundle id is small letter alpha numeric word (no special characters)</CInvalidFeedback>
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
                                        <CInput name="name" onChange={handleBundleChange} invalid={errObj.name} />
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
                                        <CInput type="number" name="cpodrepl" defaultValue="1" onChange={handleBundleChange} invalid={errObj.cpodrepl} />
                                        <CInvalidFeedback >Please enter an integer.</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>Apps</CLabel>
                                    <Select
                                        options={appData}
                                        isSearchable
                                        isMulti
                                        onChange={e => handleAppsChange(e)}
                                        value={bundleData.services}
                                    />
                                    <div hidden={!errObj.services} className="invalid-form-text-no-margin">Please select at least one application.</div>
                                </CFormGroup>
                            </CForm>
                            {!easyMode &&
                                <>
                                    <div className="title py-3">Attributes</div>
                                    {attrData.length === 0 &&
                                        <div><FontAwesomeIcon icon="info-circle" className="text-info" />{' '}
                                            No attributes configured yet.
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
                                                                <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiStringAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name + "Length"]} />
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
                                                                <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name + "Length"]} />
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
                                                                <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiNumberAttrChange} invalid={errObj[attr.name]} />
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
                                                                <CInput type="number" name={attr.name} placeholder={attr.name} onChange={handleSingleNumberAttrChange} />
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
                                                                <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiBoolAttrChange} invalid={errObj[attr.name]} />
                                                                {errObj[attr.name] ?
                                                                    <CInvalidFeedback>This attribute is designated for booleans. Do not leave hanging commas.</CInvalidFeedback> :
                                                                    <CFormText>Enter attribute values. Use commas to delimit.</CFormText>
                                                                }
                                                            </CFormGroup>
                                                            :
                                                            <CFormGroup>
                                                                <CLabel>{attr.name}</CLabel>
                                                                <CSelect name={attr.name} custom onChange={handleSingleBoolAttrChange}>
                                                                    <option value={undefined}>Please select a boolean</option>
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
                                                                <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiDateAttrChange} invalid={errObj[attr.name]} />
                                                                {errObj[attr.name] ?
                                                                    <CInvalidFeedback>Please enter your format as YYYY-MM-DD. Do not leave hanging commas.</CInvalidFeedback> :
                                                                    <CFormText>Enter attribute values. Use commas to delimit.</CFormText>
                                                                }
                                                            </CFormGroup>
                                                            :
                                                            <CFormGroup>
                                                                <CLabel>{attr.name}</CLabel>
                                                                <CInputGroup>
                                                                    <CInput type="date" id="date-input" name={attr.name} placeholder={attr.name} onChange={handleSingleDateAttrChange} />
                                                                </CInputGroup>
                                                            </CFormGroup>
                                                        }
                                                    </>
                                                }
                                            </CForm>
                                        )
                                    })}
                                </>
                            }
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
