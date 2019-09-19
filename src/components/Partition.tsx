import React from "react"
import { Partition } from "../types/Diskutil"

export default function({id,name,filesystem}: Partition) {

    const ifshow = (key:string, val:any) => {
        return val? `, ${key}: ${val}` : ""
    }

    return (
        <div key={id}>
            <p>id:{id}{ifshow("name",name)}{ifshow("filesystem",filesystem)}</p>
        </div>
    )
}