// import React, { useState } from 'react'
// import { Disk } from "../types/Diskutil"
// import Partition from "./Partition"
// import { Actions } from '../types/Actions'
// const Disk = ({identifier,description,partitions,name,size,disk_index,actions}:Disk&{actions:Actions,disk_index:number}) => { 

//     return (
//         <div className="flex-item">
//             <div className="box">
//                 <p className="has-text-centered">{name?name:identifier}<br/>{size}<br/>{description}</p>
//                 <div className="m-t-2">
//                     {partitions.map((partition,partition_index)=>(<Partition key={partition.id} {...{...partition,actions,disk_index,partition_index}}/>))}
//                 </div>
//             </div>
//         </div>
//     )
// }
  
// export default Disk