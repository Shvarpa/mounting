import React from "react"
import { Partition } from "../types/Diskutil"
import { Actions } from "../types/Actions"

export default function({Ltr,Label,Fs,disk_index,partition_index}: Partition&{disk_index:number;partition_index:number}) {

    const ifshow = (key:string, val:any) => {
        return val? `${key}: ${val}, ` : ""
    }
    let is_mounted = !!Ltr
    return (
        <div className="partition">
            <p>{Ltr?`${Ltr}:    `:""}{ifshow("Label",Label)}{ifshow("fs",Fs)}</p>
            <button className="button" >refresh</button>
            <button className="button" >{is_mounted?"unmount":"mount"}</button>
            {/* onClick={actions.refresh(disk_index,partition_index)} */}
            {/* onClick={actions.toggle_mount(disk_index,partition_index)} */}
        </div>
    )
}