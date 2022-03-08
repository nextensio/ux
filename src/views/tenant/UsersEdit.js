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
    CInputGroupAppend,
    CInputGroupPrepend,
    CInputGroupText,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter,
    CPopover,
    CSelect,
    CInvalidFeedback,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

var common = require('../../common')

const UsersEdit = (props) => {
    // Change maxCharLength to whatever you want for maximum length of input fields.
    const maxCharLength = 20
    const [selectedUsers, setSelectedUsers] = useState(Object.freeze([]))
    const [userData, updateUserData] = useState(Object.freeze({}))
    const [userAttrState, updateUserAttrState] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));
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

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            setSelectedUsers(props.location.state)
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/all'), hdrs)
            .then(response => response.json())
            .then(data => {
                var userAttrs = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        if (data[i].name[0] === "_") {
                            continue
                        }
                        else if (data[i].group === props.match.params.group) {
                            userAttrs.push(data[i])
                        }
                    }
                }
                updateAttrData(userAttrs);
            });
    }, []);

    useEffect(() => {
        if (selectedUsers.length === 1) {
            fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alluserattr'), hdrs)
                .then(response => response.json())
                .then(data => {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].uid == selectedUsers[0].uid) {
                            // remove email, gateway, pod from userAttrState
                            // ...rest is all the user attributes
                            var { uid, ...rest } = data[i]
                            updateUserAttrState({ uid, ...rest })
                        }
                    }
                })
            updateUserData({ uid: selectedUsers[0].uid, name: selectedUsers[0].__name })
        }
    }, [selectedUsers])

    const toAttributeEditor = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/attreditor')
    }


    const handleLengthCheck = (e) => {
        // length check to ensure bad guy does not send a massive string to DB
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
        updateUserAttrState({
            ...userAttrState,
            [e.target.name]: input
        })
    }

    const handleMultiStringAttrChange = (e) => {
        let input
        handleLengthCheck(e)
        // Check if input contains comma, if so separate the values
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => item.trim());
        } else {
            input = e.target.value.trim()
        }
        updateUserAttrState({
            ...userAttrState,
            [e.target.name]: [input]
        })
    }

    const handleSingleNumberAttrChange = (e) => {
        let input = parseInt(e.target.value)
        handleLengthCheck(e)
        updateUserAttrState({
            ...userAttrState,
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
        updateUserAttrState({
            ...userAttrState,
            [attrName]: [input]
        })
    }

    const handleBoolAttrChange = (e) => {
        let input
        if (e.target.value === "true") {
            input = true
        } else if (e.target.value === "false") {
            input = false
        }
        updateUserAttrState({
            ...userAttrState,
            [e.target.name]: input
        })
    }


    const handleSingleDateAttrChange = (e) => {
        let input
        // convert to Epoch GMT
        input = e.target.value
        updateUserAttrState({
            ...userAttrState,
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
        updateUserAttrState({
            ...userAttrState,
            [e.target.name]: [input]
        })
    }

    function validateOne() {
        let errs = {}
        if (!/\S/.test(userData.name)) {
            errs.name = true
        }
        attrData.forEach((item) => {
            if (userAttrState[item.name] != undefined) {
                if (item.isArray == "true" && JSON.stringify(userAttrState[item.name]).includes("ERR!")) {
                    errs[item.name] = true
                }
            }
        })
        updateErrObj(errs)
        return errs

    }

    function validateAll() {
        let errs = {}
        attrData.forEach((item) => {
            if (userAttrState[item.name] != undefined) {
                if (item.isArray == "true" && JSON.stringify(userAttrState[item.name]).includes("ERR!")) {
                    errs[item.name] = true
                }
            }
        })
        updateErrObj(errs)
        return errs
    }

    function fillEmptyInputs() {
        let attrState = { ...userAttrState }
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
        updateUserAttrState(attrState)
        return attrState
    }

    function fillEmptyInputsMultiple(selectedUser) {
        let attrState = { ...userAttrState }
        let merged = { ...selectedUser, ...attrState }
        delete merged.__name
        delete merged.__uid
        delete merged.uid
        attrData.forEach((item) => {
            if (!(item.name in merged)) {
                if (item.isArray == "true") {
                    if (item.type == "String" || item.type == "Date") {
                        merged[item.name] = [""]
                    }
                    if (item.type == "Number") {
                        merged[item.name] = [0]
                    }
                    if (item.type == "Boolean") {
                        merged[item.name] = [false]
                    }
                }
                if (item.isArray == "false") {
                    if (item.type == "String" || item.type == "Date") {
                        merged[item.name] = ""
                    }
                    if (item.type == "Number") {
                        merged[item.name] = 0
                    }
                    if (item.type == "Boolean") {
                        merged[item.name] = false
                    }
                }
            }
        })
        return merged
    }

    const handleInfoSubmit = (attrState) => {
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify(userData)
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/user'), requestOptions)
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
                    handleSubmit(userData.uid, attrState, true)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            })
    }


    // user attribute http post function
    const handleSubmit = (uid, attrState, last) => {
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify({ uid: uid, ...attrState }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/userattr/' + uid), requestOptions)
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
                if (last == true) {
                    props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/users')
                }

            })
            .catch(error => {
                alert('Error contacting server', error);
            })
    }

    const submitOne = (e) => {
        let errs = validateOne()
        if (Object.keys(errs).length != 0) {
            return
        } else {
            let attrState = fillEmptyInputs()
            handleInfoSubmit(attrState)
        }
    }

    const submitAll = (e) => {
        let errs = validateAll()
        if (Object.keys(errs).length != 0) {
            return
        } else {
            let attrState;
            let last = false
            for (let i = 0; i < selectedUsers.length; i++) {
                if (i == selectedUsers.length - 1) {
                    last = true
                }
                attrState = fillEmptyInputsMultiple(selectedUsers[i])
                handleSubmit(selectedUsers[i].uid, attrState, last)
            }
        }
    }

    function renderHeader() {
        if (selectedUsers.length == 1) {
            return (
                <strong>Edit Info for {selectedUsers[0].uid}</strong>
            )
        } else {
            return (
                <strong>Edit Attributes for {selectedUsers.length} Users</strong>)
        }
    }

    const handleUserChange = (e) => {
        updateUserData({
            ...userData,
            [e.target.name]: e.target.value
        })
    }

    function renderUserInfo() {
        if (selectedUsers.length == 1) {
            return (
                <CForm>
                    <CFormGroup>
                        <CLabel>User ID</CLabel>
                        <CInputGroup>
                            <CInputGroupPrepend>
                                <CInputGroupText className="bg-primary-light text-primary">
                                    <CIcon name="cil-user" />
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput name="uid" value={userData.uid} readOnly />
                            <CInputGroupAppend>
                                <CInputGroupText>
                                    <CIcon name="cil-lock-locked" />
                                </CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel>Name</CLabel>
                        <CInputGroup>
                            <CInputGroupPrepend>
                                <CInputGroupText className="bg-primary-light text-primary">
                                    <CIcon name="cil-tag" />
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput name="name" defaultValue={userData.name} onChange={handleUserChange} invalid={errObj.name} />
                            <CInvalidFeedback>Please enter a value.</CInvalidFeedback>
                        </CInputGroup>
                    </CFormGroup>
                </CForm>

            )
        }
    }

    console.log(attrData)

    return (
        <CCard className="roboto-font">
            <CCardHeader>
                {renderHeader()}
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="8">
                        {renderUserInfo()}
                        <div className="title py-3">Attributes</div>
                        {attrData.length === 0 &&
                            <div><FontAwesomeIcon icon="info-circle" className="text-info" />{' '}
                                You have no attributes for Users. <a className="text-primary" onClick={toAttributeEditor}>Click here</a> to add an attribute.
                            </div>
                        }
                        {attrData.map(attr => {
                            if (attr.name[0] != "_") {
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
                                                        <CInput type="text" name={attr.name} defaultValue={userAttrState[attr.name]} onChange={handleMultiStringAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name + "Length"]} />
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
                                                        <CInput type="text" name={attr.name} defaultValue={userAttrState[attr.name]} onChange={handleAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name + "Length"]} />
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
                                                        <CInput type="text" name={attr.name} defaultValue={userAttrState[attr.name]} onChange={handleMultiNumberAttrChange} invalid={errObj[attr.name]} />
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
                                                        <CInput type="number" name={attr.name} defaultValue={userAttrState[attr.name]} onChange={handleSingleNumberAttrChange} />
                                                        <CFormText>Enter attribute value.</CFormText>
                                                    </CFormGroup>
                                                }
                                            </>
                                        }
                                        {attr.type == "Boolean" &&
                                            <CFormGroup>
                                                <CLabel>{attr.name}</CLabel>
                                                <CSelect name={attr.name} value={userAttrState[attr.name]} custom onChange={handleBoolAttrChange}>
                                                    <option value={undefined}>Please select a boolean</option>
                                                    <option value={true}>True</option>
                                                    <option value={false}>False</option>
                                                </CSelect>
                                            </CFormGroup>
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
                                                        <CInput type="text" name={attr.name} defaultValue={userAttrState[attr.name]} onChange={handleMultiDateAttrChange} invalid={errObj[attr.name]} />
                                                        {errObj[attr.name] ?
                                                            <CInvalidFeedback>Please enter your format as YYYY-MM-DD. Do not leave hanging commas.</CInvalidFeedback> :
                                                            <CFormText>Enter attribute values. Use commas to delimit.</CFormText>
                                                        }
                                                    </CFormGroup>
                                                    :
                                                    <CFormGroup>
                                                        <CLabel>{attr.name}</CLabel>
                                                        <CInputGroup>
                                                            <CInput type="date" id="date-input" value={userAttrState[attr.name]} name={attr.name} onChange={handleSingleDateAttrChange} />
                                                        </CInputGroup>
                                                    </CFormGroup>
                                                }
                                            </>
                                        }
                                    </CForm>
                                )
                            }
                        })}
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline" onClick={selectedUsers.length == 1 ? submitOne : submitAll}>
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Confirm</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(UsersEdit)
