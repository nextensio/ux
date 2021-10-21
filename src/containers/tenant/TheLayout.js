import React, { useEffect } from 'react'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader
} from './index'
import { Providers } from './Context'

const TheLayout = (props) => {

  return (
    <div className="c-app c-default-layout">
      <TheSidebar {...props} />
      <div className="c-wrapper">
        <Providers>
          <TheHeader {...props} />
          <div className="c-body">
            <TheContent />
          </div>
          <TheFooter />
        </Providers>
      </div>
    </div>
  )
}

export default TheLayout
