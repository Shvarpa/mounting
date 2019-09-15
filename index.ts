import fs = require("fs")
import cmd = require('child_process');

interface Disk {
    path: String;
    description: String;
}

interface Partition {
    ID: String;
    TYPE: String;
    NAME: String;
    SIZE: String;
    IDENTIFIER: String;
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
        
        let partitions:Array<Partition> = []
        lines.slice(1).forEach((line)=>{
            let partition: Partition = { ID: "", TYPE: "", NAME: "", SIZE: "", IDENTIFIER: "" }
            columns.forEach((column,index)=>{
                partition[column] = line.slice(deviders[index],deviders[index+1]).trim()
            })            
            if(partition.ID === ""){
                partitions[partitions.length-1].NAME = partition.NAME;
            }
            else{
                if(partition.ID.endsWith(":")){
                    partition.ID=partition.ID.slice(0,partition.ID.length-1);
                }
                partitions.push(partition);
            }
        })
        return {
            disk,
            partitions
        }
    });

    return disks;
}


cmd.exec("diskutil list", (_,stdout,_stderr)=>{
    let disks = parse_diskutil(stdout);
    console.log(disks[4]);
    
})