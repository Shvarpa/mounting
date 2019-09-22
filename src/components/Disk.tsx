import React, { useState } from 'react'
import { Disk } from "../types/Diskutil"
import Partition from "./Partition"
const Disk = ({path,description,partitions}:Disk) => {
    return (
        <div className="column is-one-third">
            <div className="box">
                <p className="has-text-centered">{path}
                <br/>
                {description}</p>
                <button className="button" onClick={()=>{console.log(path)}}>log</button>
                <div className="box m-t-2">
                    {partitions.map((partition)=>(<Partition key={partition.id} {...partition}/>))}
                </div>
            </div>
        </div>
    )
}
  
export default Disk