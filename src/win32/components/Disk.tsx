import React, { useState } from 'react'
import { Disk } from "../types/Diskutil"
import Partition from "./Partition"
import { Actions } from '../types/Actions'
const Disk = ({Title,Disk,partitions,Size,Type,disk_index}:Disk&{disk_index:number}) => { 

    return (
        <div className="flex-item">
            <div className="box">
                <p className="has-text-centered">{Title?Title:Disk}<br/>{Size}<br/>{Type}</p>
                <div className="m-t-2">
                    {partitions.map((partition,partition_index)=>(<Partition key={partition.UUID?partition.UUID:partition.Partition} {...{...partition,disk_index,partition_index}}/>))}
                </div>
            </div>
        </div>
    )
}
  
export default Disk