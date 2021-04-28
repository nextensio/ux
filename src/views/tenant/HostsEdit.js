import React, { useState, useEffect } from 'react'
import {
    CButton,
    CButtonClose,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CInput,
    CInputCheckbox,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupAppend,
    CInputGroupText,
    CRow,
    CLabel,
    CListGroup,
    CListGroupItem,
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

const HostEdit = (props) => {
    
    const [hostState, updateHostState] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));
    const [selectedAttr, setSelectedAttr] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        getAttrData();
        if (typeof props.location.state != 'undefined') {
            updateHostState(props.location.state)
        }
    }, []);

    useEffect(() => {
        if (hostState != "") {
            const {route, ...configAttrs} = hostState.config[0];
            setSelectedAttr(Object.keys(configAttrs))
        }
    }, [props, hostState])

    const getAttrData = (e) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                var fields = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Users') {
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

    const handleDeselect= (e) => {
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
        updateHostState({
            ...hostState,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        // for each route config object...
        //    Generate a list that from the keys, then delete the index with value "route"... 
        //    Next iterate over the keys and delete any that are not found on selectedAttr...
        //    
        //    Finally, iterate over selectedAttr, if any attr already exist in our keys list, 
        //    skip the iteration, otherwise enter a new attr key with empty string as value
        for (var i = 0; i < hostState.config.length; i++) {
            const keys = Object.keys(hostState.config[i])
            const routeIdx = keys.indexOf("route")
            if (routeIdx > -1) {
                keys.splice(routeIdx, 1)
            }
            keys.forEach((key, index) => {
                if (!selectedAttr.includes(key)) {
                    delete hostState.config[i][key]
                }
            })
            for (var j = 0; j < selectedAttr.length; j++) {
                if (Object.keys(hostState.config[i]).includes(selectedAttr[j])) {
                    continue
                }
                else {
                    hostState.config[i][selectedAttr[j]] = ''
                }
            }
        }
        e.preventDefault()
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
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Edit Details for {hostState.host}</strong>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="8">
                        <CForm>
                            <CFormGroup>
                                <CLabel htmlFor="nf-password">Host</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-link"/>
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput disabled name="host" placeholder={hostState.host} onChange={handleChange} />
                                    <CInputGroupAppend>
                                        <CInputGroupText>
                                            <CIcon name="cil-lock-locked"/>
                                        </CInputGroupText>
                                    </CInputGroupAppend>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel htmlFor="nf-email">Name</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-tag"/>
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="name" placeholder={hostState.name} onChange={handleChange} />
                                </CInputGroup>
                            </CFormGroup>
                        </CForm>
                        <div className="title py-3">Attributes for {hostState.host}</div>
                        <CListGroup accent>
                            {selectedAttr.map(attr => {
                                return (
                                    <CListGroupItem color="primary" accent="primary">
                                        {attr}<CButtonClose className="ml-1" buttonClass="text-white close" name={attr} onClick={(e) => handleDeselect(e)}/>
                                    </CListGroupItem>
                                )
                            })}
                        </CListGroup>
                        <div className="help-text mt-3"><FontAwesomeIcon icon="info-circle" className="text-info" /> Modify attributes from the checklist on the right.</div>
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
                                        <CInputCheckbox value={attr} onChange={(e) => {handleSelect(e)}} checked={selectedAttr.includes(attr)}/>
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
                    <strong>{" "}Confirm</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(HostEdit)