import React, { useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CCallout,
    CCard,
    CCardHeader,
    CCardBody,
    CCol,
    CCarousel,
    CCarouselCaption,
    CCarouselControl,
    CCarouselIndicators,
    CCarouselInner,
    CCarouselItem,
    CListGroup,
    CListGroupItem,
    CTabContent,
    CTabPane,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import './tenantviews.scss'

const Docs = () => {
    const [activeTab, setActiveTab] = useState("Getting Started")

    const slides = [
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23444%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22247.3203125%22%20y%3D%22218.3%22%3ESecond%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa21%20text%20%7B%20fill%3A%23333%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa21%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22277%22%20y%3D%22218.3%22%3EThird%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    ]
    return (
        <>
            <CRow>
                <CCol xs="8">
                    <CCard>
                        <CCarousel className="" animate autoSlide={3000}>
                            <CCarouselIndicators/>
                            <CCarouselInner>
                                <CCarouselItem>
                                    <img className="d-block w-100" src={slides[0]} alt="slide 1"/>
                                    <CCarouselCaption><h3>How To Do This</h3></CCarouselCaption>
                                </CCarouselItem>
                                <CCarouselItem>
                                    <img className="d-block w-100" src={slides[1]} alt="slide 2"/>
                                    <CCarouselCaption><h3>How To Do That</h3></CCarouselCaption>
                                </CCarouselItem>
                                <CCarouselItem>
                                    <img className="d-block w-100" src={slides[2]} alt="slide 3"/>
                                    <CCarouselCaption><h3>Demo</h3></CCarouselCaption>
                                </CCarouselItem>
                            </CCarouselInner>
                            <CCarouselControl direction="prev"/>
                            <CCarouselControl direction="next"/>
                        </CCarousel>
                    </CCard>
                </CCol>
                <CCol xs="4">
                    <CCard>
                        <CCardHeader>
                            FAQ
                        </CCardHeader>
                        <CCardBody>

                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            Documentation
                        </CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol xs="4">
                                    <CListGroup id="list-tab" role="tablist">
                                        <CListGroupItem onClick={() => setActiveTab("Getting Started")} action active={activeTab === "Getting Started"} >Getting Started</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Cluster Configuration")} action active={activeTab === "Cluster Configuration"} >Cluster Config</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Users")} action active={activeTab === "Users"} >Users</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Bundles")} action active={activeTab === "Bundles"} >Bundles</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Hosts")} action active={activeTab === "Hosts"} >Hosts</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Attributes")} action active={activeTab === "Attributes"} >Attributes</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Policies")} action active={activeTab === "Policies"} >Policies</CListGroupItem>
                                    </CListGroup>
                                </CCol>
                                <CCol xs="8">
                                    <CTabContent>
                                        <CTabPane active={activeTab === "Getting Started"} >
                                            <p>Velit aute mollit ipsum ad dolor consectetur nulla officia culpa adipisicing exercitation fugiat tempor. Voluptate deserunt sit sunt
                                            nisi aliqua fugiat proident ea ut. Mollit voluptate reprehenderit occaecat nisi ad non minim
                                            tempor sunt voluptate consectetur exercitation id ut nulla. Ea et fugiat aliquip nostrud sunt incididunt consectetur culpa aliquip
                                            eiusmod dolor. Anim ad Lorem aliqua in cupidatat nisi enim eu nostrud do aliquip veniam minim.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Cluster Configuration"}>
                                            <p>Cupidatat quis ad sint excepteur laborum in esse qui. Et excepteur consectetur ex nisi eu do cillum ad laborum. Mollit et eu officia
                                            dolore sunt Lorem culpa qui commodo velit ex amet id ex. Officia anim incididunt laboris deserunt
                                            anim aute dolor incididunt veniam aute dolore do exercitation. Dolor nisi culpa ex ad irure in elit eu dolore. Ad laboris ipsum
                                            reprehenderit irure non commodo enim culpa commodo veniam incididunt veniam ad.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Users"}>
                                            <p>Ut ut do pariatur aliquip aliqua aliquip exercitation do nostrud commodo reprehenderit aute ipsum voluptate. Irure Lorem et laboris
                                            nostrud amet cupidatat cupidatat anim do ut velit mollit consequat enim tempor. Consectetur
                                            est minim nostrud nostrud consectetur irure labore voluptate irure. Ipsum id Lorem sit sint voluptate est pariatur eu ad cupidatat et
                                            deserunt culpa sit eiusmod deserunt. Consectetur et fugiat anim do eiusmod aliquip nulla
                                            laborum elit adipisicing pariatur cillum.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Bundles"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Hosts"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Attributes"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Policies"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                    </CTabContent>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(Docs)