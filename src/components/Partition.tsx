import React from "react"
import { Partition } from "../types/Diskutil"

export default function({id,name,filesystem,identifier}: Partition) {

    const ifshow = (key:string, val:any) => {
        return val? `, ${key}: ${val}` : ""
    }

    return (
        <div className="partition">
            <p>id:{id}{ifshow("name",name)}{ifshow("fs",filesystem)}</p>
            <button className="button" onClick={()=>{console.log(identifier)}}>log</button>
        </div>
    )
}