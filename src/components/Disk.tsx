import React, { useState } from 'react'
import { Disk } from "../types/Diskutil"

const Disk = ({path,description,partitions}:Disk) => {
    return (
        <>
        <text>path: {path}</text>
        <text>description: {description}</text>
        <br/>
        </>
    )
}
  
export default Disk