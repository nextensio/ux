import React, { useState, useEffect } from 'react'
import {
    CButton,
    CButtonClose,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CInput,
    CInputCheckbox,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInvalidFeedback,
    CListGroup,
    CListGroupItem,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './tenantviews.scss'

var common = require('../../common')

const HostEdit = (props) => {
    const initHostData = Object.freeze({
        host: "",
        name: "",
        routeattrs: [{ tag: "" }],
    });
    const [hostData, updateHostData] = useState(initHostData);
    const [attrData, updateAttrData] = useState(Object.freeze([]));
    const [selectedAttr, setSelectedAttr] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [errObj, updateErrObj] = useState({});

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        getAttrData();
    }, []);

    const getAttrData = (e) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                var fields = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Hosts') {
                        fields.push(data[i].name);
                    }
                }
                fields.sort()
                updateAttrData(fields);
            });
    }

    const searchResults = !searchInput
        ? attrData
        : attrData.filter(name =>
            name.toLowerCase().includes(searchInput.toLocaleLowerCase())
        );

    const handleSelect = (e) => {
        const selected = [...selectedAttr]
        if (e.target.checked) {
            selected.push(e.target.value)
        }
        if (!e.target.checked) {
            const i = selected.indexOf(e.target.value)
            if (i > -1) {
                selected.splice(i, 1)
            }
        }
        setSelectedAttr(selected)
    }

    const handleDeselect = (e) => {
        const selected = [...selectedAttr]
        const i = selected.indexOf(e.target.name)
        if (i > -1) {
            selected.splice(i, 1)
        }
        setSelectedAttr(selected)
    }

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value)
    }

    const handleChange = (e) => {
        updateHostData({
            ...hostData,
            [e.target.name]: e.target.value.trim()
        });
    };

    function validate() {
        let errs = {}
        // regex to check if IP Address/mask
        const reIP = /^(?=.*[^\.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}\/[0-9][0-9]?$/igm;
        // regex to check if URL
        const reURL = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        // special host name to indicate that all default internet traffic needs
        // to be sent to nextensio
        const nextensioURL = 'nextensio-default-internet'
        if (!(reIP.test(hostData.host) || reURL.test(String(hostData.host).toLowerCase()) || hostData.host == nextensioURL)) {
            errs.host = true
        }
        if (!/\S/.test(hostData.name)) {
            errs.name = true
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
        for (var i = 0; i < selectedAttr.length; i++) {
            hostData.routeattrs[0][selectedAttr[i]] = ''
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(hostData),
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
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Add a Host</strong>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="8">
                        <CForm>
                            <CFormGroup>
                                <CLabel>Host</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-link" />
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="host" placeholder="google.com" onChange={handleChange} invalid={errObj.host} />
                                    <CInvalidFeedback>Please enter a valid URL!</CInvalidFeedback>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel htmlFor="nf-email">Name</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-tag" />
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="name" placeholder="google" onChange={handleChange} invalid={errObj.name}/>
                                    <CInvalidFeedback>Please enter a value.</CInvalidFeedback>
                                </CInputGroup>
                            </CFormGroup>
                        </CForm>
                        <div className="title py-3">Attributes</div>
                        <CCol sm="6">
                            <CListGroup accent>
                                {selectedAttr.map(attr => {
                                    return (
                                        <CListGroupItem color="primary" accent="primary">
                                            {attr}<CButtonClose className="ml-1" buttonClass="text-white close" name={attr} onClick={(e) => handleDeselect(e)} />
                                        </CListGroupItem>
                                    )
                                })}
                            </CListGroup>
                        </CCol>
                        <div className="roboto-font mt-3"><FontAwesomeIcon icon="info-circle" className="text-info" /> Add an attribute from the checklist on the right.</div>
                    </CCol>

                    <CCol sm="4">
                        <div className="sticky-scroll p-3">
                            <div className="title mb-3">Attribute List</div>
                            <CInputGroup className="mb-3">
                                <CInputGroupPrepend>
                                    <CInputGroupText className="bg-primary text-white">
                                        <CIcon name="cil-magnifying-glass" />
                                    </CInputGroupText>
                                </CInputGroupPrepend>
                                <CInput
                                    type="text"
                                    placeholder="User Attribute"
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                />
                            </CInputGroup>
                            {searchResults.map(attr => {
                                return (
                                    <CFormGroup variant="checkbox" className="checkbox">
                                        <CInputCheckbox value={attr} onChange={(e) => { handleSelect(e) }} checked={selectedAttr.includes(attr)} />
                                        <CLabel variant="checkbox" className="form-check-label">{attr}</CLabel>
                                    </CFormGroup>
                                )
                            })}
                        </div>
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

export default withRouter(HostEdit)