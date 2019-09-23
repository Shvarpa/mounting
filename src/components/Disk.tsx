import React, { useState } from 'react'
import { Disk } from "../types/Diskutil"
import Partition from "./Partition"
const Disk = ({identifier,description,partitions,name,size}:Disk) => {
    return (
        <div className="flex-item">
            <div className="box">
                <p className="has-text-centered">{name?name:identifier}<br/>{size}<br/>{description}</p>
                <div className="m-t-2">
                    {partitions.map((partition)=>(<Partition key={partition.id} {...partition}/>))}
                </div>
            </div>
        </div>
    )
}
  
export default Disk