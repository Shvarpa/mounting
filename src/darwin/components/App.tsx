import '../../assets/css/bulma.scss'
import React, { useState, useEffect } from 'react'
import Disk from "./Disk"

// import url from "../assets/images/electron-react-webpack-boilerplate.png"
import { Disk as DiskInterface, Partition } from '../types/Diskutil'
import Actions from "../ts/actions"
const App = (props) => {
  let default_state: DiskInterface[] = []
  const [disks, setDisks] = useState(default_state)
  const [actions, {startup}] = Actions([disks,setDisks])

  useEffect(()=>{startup()},[])

  return (
    <div className="section">
      <h1 className="title has-text-centered">Mounter</h1>
      <div className="container">
      { disks.map((disk,disk_index)=><Disk key={disk.identifier} {...{...disk,actions,disk_index}}/>) }
      </div>
    </div>
  )
}

export default module.exports = App