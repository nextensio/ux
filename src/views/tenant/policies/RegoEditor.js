import React, { useState, useEffect } from 'react'
import AceEditor from "react-ace";


import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"
import {
    CCard,
    CCardBody,
    CCol,
    CEmbed,
    CCardHeader,
    CRow
} from '@coreui/react'

var common = require('../../../common')
require(`ace-builds/src-noconflict/theme-tomorrow`)
require(`ace-builds/src-noconflict/mode-markdown`)

const RegoEditor = (props) => {
    const initPolicyData = Object.freeze({
        pid: "",
        tenant: props.match.params.id,
        rego: ""
    });

    const [policyData, updatePolicyData] = useState(initPolicyData);

    function handleRegoChange(newValue) {
        updatePolicyData({
            ...policyData,
            rego: newValue
        })
    }

    return (
        <CRow>
            <CCol sm="12">
                <CCard>
                    <CCardHeader>OPA Policy</CCardHeader>
                    <CCardBody>
                        <CEmbed>
                            <div className="editor-wrapper">
                                <AceEditor
                                    className="editor"
                                    name="rego"
                                    mode="markdown"
                                    theme="tomorrow"
                                    onChange={handleRegoChange}
                                    fontSize={18}
                                    value={policyData.rego}
                                    showPrintMargin={true}
                                    showGutter={true}
                                    highlightActiveLine={true}
                                    setOptions={{
                                        enableBasicAutocompletion: true,
                                        enableLiveAutocompletion: true,
                                        minLines: 30,
                                        maxLines: 1000,
                                        scrollPastEnd: true,
                                        autoScrollEditorIntoView: true,
                                        enableSnippets: true,
                                        tabSize: 2,
                                    }}
                                />
                            </div>
                        </CEmbed>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default RegoEditor
