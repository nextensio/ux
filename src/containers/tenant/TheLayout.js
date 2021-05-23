import React, { useEffect } from 'react'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader
} from './index'

const TheLayout = (props) => {

  return (
    <div className="c-app c-default-layout">
      <TheSidebar {...props} />
      <div className="c-wrapper">
        <TheHeader {...props}/>
        <div className="c-body">
          <TheContent />
        </div>
        <TheFooter />
      </div>
    </div>
  )
}

export default TheLayout
