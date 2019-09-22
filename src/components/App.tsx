import '../assets/css/App.scss'
import React, { useState, useEffect } from 'react'
import { list_disks, update_partition } from "./commands"
import Disk from "./Disk"

import url from "../assets/images/electron-react-webpack-boilerplate.png"
import { Disk as DiskInterface, Partition } from '../types/Diskutil'

const App = (props) => {
  let default_state: DiskInterface[] = []
  const [disks, setDisks] = useState(default_state)


  const startup = async () => {
    let new_disks = await list_disks();
    setDisks(new_disks)
    
    let updated_disks = await Promise.all(new_disks.map(async (disk):Promise<DiskInterface>=>{
      let updated_partitions = await Promise.all(disk.partitions.map(async (partition)=>await update_partition(partition)))
      return {...disk, partitions: updated_partitions}
    }))
    
    setDisks(updated_disks)
  }

  useEffect(()=>{startup()},[])

  return (
    <div className="section">
      <h1 className="title has-text-centered">Hello, Electron!</h1>
      <div className="columns is-multiline">
      { disks.map((disk)=><Disk key={disk.path} {...disk}/>) }
      </div>
    </div>
  )
}

export default App
