import React, { Component } from "react"
import PropTypes from "prop-types"
import Pusher from 'pusher-js'
import ajv from "ajv"

export default class PusherModal extends Component {
  constructor() {
    super()
    this.state = {
      error: null,
      status: "new",
      pusherClient : null,
      channel : null ,
      channelName : null ,
      binds: null
    }
    this._s = {
      apiKey : null,
      cluster : null,
      channelName : "channelName",
      eventName : "eventName",
    }
  }

  init = async (apiKey, cluster) => {
    const pusher = new Pusher(apiKey, {
      cluster: cluster
    })
    this.setState({ pusherClient: pusher })
    this.setState({ status: "initiated" })
  }


  listen = async (channelName) => {
    const channel = this.state.pusherClient.subscribe(channelName);
    this.setState({ channel: channel })
    this.setState({ channelName: channelName })
    this.setState({ status: "listening" })
  }

  bind = async () => {
    const b = this.state.channel.bind_global(function (eventName, data) {
      console.log({
        eventName, data
      });
    })
    this.setState({ binds: b })
  }

  unbind = async () => {
    this.state.channel.unbind()
    this.state.binds = null
  }

  unlisten = async (channelName) => {
    this.state.channel.unsubscribe(channelName)
    this.setState({ binds: null })
    this.setState({ channel: null })
    this.setState({ channelName: null })
    this.setState({ status: "initiated" })
  }
  uninit = async () => {
    if(this.state.channel && this.state.channelName) {
      this.state.channel.unsubscribe(this.state.channelName)
    }
    this.setState({ binds: null })
    this.setState({ channel: null })
    this.setState({ channelName: null })
    this.setState({ pusherClient: null })
    this.setState({ status: "new" })
  }



  handleChange(event, _s) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    _s[name] = value
  }



  render() {
    const { onClose, getComponent } = this.props

    if(this.state.status === "new") {
      return <PusherModalStepNew
        onClose={onClose}
        onInit={(apiKey, cluster) => this.init(apiKey, cluster)}
        getComponent={getComponent}
        _s = {this._s}
        handleChange = {this.handleChange}
        />
    }

    if (this.state.status === "initiated") {
      return <PusherModalStepInitiated
        onClose={onClose} 
        onListen={(channelName) => this.listen(channelName)} 
        getComponent={getComponent}
        _s = {this._s}
        handleChange = {this.handleChange}
      />
    }

    if (this.state.status === "listening") {
      return <PusherModalStepListening
        onClose={onClose}
        onBind={(eventName) => this.bind(eventName)}
        onUnbind={(eventName) => this.unbind(eventName)}
        onUnlisten={(channelName) => this.unlisten(channelName)}
        onUninit = {() => this.uninit()}
        getComponent={getComponent}
        _s = {this._s}
        handleChange = {this.handleChange}
      />
    }

 


    return null
  }
}

PusherModal.propTypes = {
  getComponent: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

const PusherModalStepNew = ({ getComponent, onClose, onInit, _s, handleChange }) => {
  const Modal = getComponent("TopbarModal")
  
  
  return <Modal className="modal" styleName="modal-dialog-sm" onCloseClick={onClose}>
    <form name="ff1" id="form-ff1" >
      <div className="container modal-message">
      <h3>Init pusher</h3>
    <p>
    <input 
      name="apiKey"
      autoComplete="username"
      label="Api key :"
          type="text" 
          //value={_s.apiKey} 
          onChange={(e) => handleChange(e, _s)} 
          placeholder="Api key" />
    </p>
    <p>
    <input 
      name="cluster"
      autoComplete="current-password"
      label="Cluster :"
          type="text" 
          //value={_s.cluster} 
          onChange={(e) => handleChange(e, _s)} 
          placeholder="cluster" />
    </p>
    </div>
    <div className="right">
    <button className="btn cancel" onSubmit={(ev) => {ev.preventDefault(); ev.stopPropagation()}}>SaveAutocompletion</button>
      <button className="btn cancel" onClick={onClose}>Cancel</button>
      <button type="button" className="btn" onClick={(ev) =>onInit(_s.apiKey, _s.cluster)}>Init</button>

    </div>
    </form>
  </Modal>
}

PusherModalStepNew.propTypes = {
  getComponent: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onInit: PropTypes.func.isRequired,
}

const PusherModalStepInitiated = ({ getComponent, onClose, onListen , _s, handleChange }) => {
  const Modal = getComponent("TopbarModal")

  return <Modal className="modal" styleName="modal-dialog-sm" onCloseClick={onClose}>
    <div className="container modal-message">
      <h2>Client created.</h2>
      <p>
    <input 
      name="channelName"
      label="Channel name :"
          type="text" 
          onChange={(e) => handleChange(e, _s)} 
          placeholder="channel" />
    </p>
    
    </div>
    <div className="right">
      <button className="btn cancel" onClick={onClose}>Cancel</button>
      <button className="btn" onClick={() => onListen(_s.channelName)}>Listen</button>
    </div>
  </Modal>
}

PusherModalStepInitiated.propTypes = {
  getComponent: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onListen: PropTypes.func.isRequired,
}
/*

*/
const PusherModalStepListening = ({ getComponent, onClose, onBind, onUnbind, onUnlisten, onUninit, _s }) => {
  const Modal = getComponent("TopbarModal")

  return <Modal className="modal" styleName="modal-dialog-sm" onCloseClick={onClose}>
    <div className="container modal-message">
      <h2>Bind</h2>
      <p>
        {_s.bind && <div>
          <p>Binded. Data will be printed in the dev console</p>
          <button className="btn" onClick={() => onUnbind(_s)}>Un bind</button>
          </div>
      }
      {!_s.bind && <div>
          <button className="btn" onClick={() => onBind(_s)}>Bind</button>
          </div>
      }

      
      
      </p>
    </div>
    <div className="right">
      <button className="btn" onClick={onClose}>Close</button>
      <button className="btn" onClick={() => onUnlisten(_s.channelName)}>Change channel</button>
      <button className="btn" onClick={onUninit}>Reset</button>
    </div>
  </Modal>
}


PusherModalStepListening.propTypes = {
  getComponent: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onBind: PropTypes.func.isRequired,
  onUnbind: PropTypes.func.isRequired,
  onUnlisten: PropTypes.func.isRequired,
  onUninit: PropTypes.func.isRequired,
}
 