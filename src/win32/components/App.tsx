import '../../assets/css/bulma.scss'
import React, { useState, useEffect } from 'react'
import Disk from "./Disk"

// import url from "../assets/images/electron-react-webpack-boilerplate.png"
import { Disk as DiskInterface, Partition } from '../types/Diskutil'
// import AppState from "../ts/AppState"

import { list_disks, update_all_disk, update_all } from "../ts/commands"

const App = (props) => {
  let default_state: DiskInterface[] = []
  const [disks, setDisks] = useState(default_state)
  // const [actions, {startup}] = AppState([disks,setDisks])

  useEffect(()=>{
    list_disks().then(async (diskss)=>setDisks(await update_all(diskss)))
  },[])
  // useEffect(()=>{startup()},[])

  return (
    <div className="section">
      <h1 className="title has-text-centered">Mounter</h1>
      <div className="container">
      { disks.map((disk,disk_index)=><Disk key={disk.Disk} {...{...disk,disk_index}}/>) }
      </div>
    </div>
  )
}

export default module.exports = App