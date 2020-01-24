/* eslint-disable react/prop-types */

import React from "react"

import PusherModal from "./components/pusher-modal"

export default {
  components: {
    PusherModal,
  },
  wrapComponents: {
    Topbar: (Ori) => props => {
      const PusherModal = props.getComponent("PusherModal")
      return <div>
        <Ori {...props} />
        {props.topbarSelectors.showModal("pusher") && <PusherModal 
          getComponent={props.getComponent}
          onClose={() => props.topbarActions.hideModal("pusher")}
          />}
      </div>
    }
  }
}