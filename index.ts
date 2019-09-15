import fs = require("fs")
import cmd = require('child_process');

interface Disk {
    path: string;
    description: string;
    partitions: { [id: string]: Partition };
}

interface Partition {
    id: string;
    type: string;
    name: string;
    size: string;
    identifier: string;
    mounted?:boolean;
    mount_path?:string;
}


function parse_diskutil(stdout:string):Disk[]{
    let res = stdout.split(/\n\n/).slice(0,-1);
    let disks = res.map((entry)=>{
        let lines = entry.split(/\n/);
        const diskinfo = lines.splice(0,1)[0].match(/(.*)\s(\(.*)/)
        // console.log("disk info:", diskinfo);
        
        let disk: Disk = {
            path: diskinfo[1],
            description: diskinfo[2].slice(0,-1),
            partitions: {}
        }

        let deviders = []
        deviders.push(0);
        deviders.push(lines[0].search("#:")+2);
        deviders.push(lines[0].search("TYPE")+4);
        deviders.push(lines[0].search("SIZE")-1);
        deviders.push(lines[0].search("IDENTIFIER")-1);
        deviders.push(lines[0].length);
        
        let columns = ["id", "type", "name", "size", "identifier"]
        
        let last_partition = ""
        lines.slice(1).forEach((line)=>{
            let partition: Partition = { id: "", type: "", name: "", size: "", identifier: "" }
            columns.forEach((column,index)=>{
                partition[column] = line.slice(deviders[index],deviders[index+1]).trim()
            })            
            if(partition.id === "" && last_partition !==""){
                disk.partitions[last_partition].name = partition.name;
            }
            else{
                if(partition.id.endsWith(":")){
                    partition.id=partition.id.slice(0,partition.id.length-1);
                }
                last_partition = partition.id;
                disk.partitions[partition.id]=partition;
            }
        })
        return disk
    });

    return disks;
}

function update_mount_info(disks:Disk[]){
}

cmd.exec("diskutil list", (_,stdout,_stderr)=>{
    let disks = parse_diskutil(stdout);
    console.log(disks[4]);
    
})