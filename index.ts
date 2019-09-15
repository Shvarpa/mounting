import fs = require("fs")
import cmd = require('child_process');

interface Disk {
    path: string;
    description: string;
}

interface Partition {
    ID: string;
    TYPE: string;
    NAME: string;
    SIZE: string;
    IDENTIFIER: string;
}


function parse_diskutil(stdout:string){
    let res = stdout.split(/\n\n/).slice(0,-1);
    let disks = res.map((entry)=>{
        let lines = entry.split(/\n/);
        const diskinfo = lines.splice(0,1)[0].match(/(.*)\s(\(.*)/)
        // console.log("disk info:", diskinfo);
        
        let disk: Disk = {
            path: diskinfo[1],
            description: diskinfo[2].slice(0,-1)
        }

        let deviders = []
        deviders.push(0);
        deviders.push(lines[0].search("#:")+2);
        deviders.push(lines[0].search("TYPE")+4);
        deviders.push(lines[0].search("SIZE")-1);
        deviders.push(lines[0].search("IDENTIFIER")-1);
        deviders.push(lines[0].length);
        
        let columns = ["ID", "TYPE", "NAME", "SIZE", "IDENTIFIER"]
        
        let partitions:{[id:string]:Partition} = {}
        let last_partition = ""
        lines.slice(1).forEach((line)=>{
            let partition: Partition = { ID: "", TYPE: "", NAME: "", SIZE: "", IDENTIFIER: "" }
            columns.forEach((column,index)=>{
                partition[column] = line.slice(deviders[index],deviders[index+1]).trim()
            })            
            if(partition.ID === "" && last_partition !==""){
                partitions[last_partition].NAME = partition.NAME;
            }
            else{
                if(partition.ID.endsWith(":")){
                    partition.ID=partition.ID.slice(0,partition.ID.length-1);
                }
                last_partition = partition.ID;
                partitions[partition.ID]=partition;
            }
        })
        return {
            disk,
            partitions
        }
    });

    return disks;
}

function update_mount_info(){
    
}

cmd.exec("diskutil list", (_,stdout,_stderr)=>{
    let disks = parse_diskutil(stdout);
    console.log(disks[4]);
    
})