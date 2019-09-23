import React from "react"
import { Partition } from "../types/Diskutil"
import { Actions } from "../types/Actions"

export default function({id,name,filesystem,identifier,is_mounted,disk_index,partition_index,actions}: Partition&{actions:Actions;disk_index:number;partition_index:number}) {

    const ifshow = (key:string, val:any) => {
        return val? `, ${key}: ${val}` : ""
    }

    return (
        <div className="partition">
            <p>id:{id}{ifshow("name",name)}{ifshow("fs",filesystem)}</p>
            <button className="button" onClick={actions.refresh(disk_index,partition_index)}>refresh</button>
            <button className="button" onClick={actions.toggle_mount(disk_index,partition_index)}>{is_mounted?"unmount":"mount"}</button>
        </div>
    )
}