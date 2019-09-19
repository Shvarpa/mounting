import React, { useState } from 'react'
import { Disk } from "../types/Diskutil"
import Partition from "./Partition"
const Disk = ({path,description,partitions}:Disk) => {
    return (
        <div>
            <p>{path}<br/>{description}</p>
            {partitions.map((partition)=>(<Partition key={partition.id} {...partition}/>))}
        </div>
    )
}
  
export default Disk