import '../assets/css/App.css'
import React, { useState, useEffect } from 'react'
import { list_disks } from "./commands"
import Disk from "./Disk"

import url from "../assets/images/electron-react-webpack-boilerplate.png"

const App = (props) => {
  const [disks, setDisks] = useState([{path:"",description:"",partitions:{}}])

  const update = async () => {
    let x = await list_disks();
    console.log(x);
    setDisks(x)
  }

  useEffect(()=>{update()},[])

  return (
    <div>
      <h1>Hello, Electron!</h1>
      { disks.map((disk)=><Disk {...disk}/>) }
    </div>
  )
}

export default App
