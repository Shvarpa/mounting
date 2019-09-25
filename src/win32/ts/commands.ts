import fs = require("fs")
import cmd = require('child_process');
import util = require("util")
import sudo from "sudo-prompt"
const asyncExec = util.promisify(cmd.exec);

// const _asyncSudoExec = util.promisify(sudo.exec)
const asyncSudoExec = async (command) => util.promisify(sudo.exec)(command,{name:"mounter"})
// process.title = "mounter"

import { Disk, Partition } from "../types/Diskutil"

// function parse_diskutil_list(stdout:string):Disk[]{
//     let res = stdout.split(/\n\n/).slice(0,-1);
//     let disks = res.map((entry)=>{
//         let lines = entry.split(/\n/);
//         const diskinfo = lines.splice(0,1)[0].match(/(.*)\s(\(.*)/)
//         // console.log("disk info:", diskinfo);
        
//         let disk: Disk = {
//             identifier: diskinfo[1],
//             description: diskinfo[2].slice(0,-1),
//             size: undefined,
//             name: undefined,
//             partitions: []
//         }

//         let deviders = []
//         deviders.push(0);
//         deviders.push(lines[0].search("#:")+2);
//         deviders.push(lines[0].search("TYPE")+4);
//         deviders.push(lines[0].search("SIZE")-1);
//         deviders.push(lines[0].search("IDENTIFIER")-1);
//         deviders.push(lines[0].length);
        
//         let columns = ["id", "type", "name", "size", "identifier"]
        
//         let last_partition_index;
//         lines.slice(1).forEach((line,_index)=>{
//             let partition: Partition = { id: "", type: "", name: "", size: "", identifier: "" }
//             columns.forEach((column,index)=>{
//                 partition[column] = line.slice(deviders[index],deviders[index+1]).trim()
//             })
//             Object.keys(partition).forEach(key => {
//                 if(partition[key]==="") delete partition[key]
//             });            
//             if(!partition.id && last_partition_index){
//                 disk.partitions[last_partition_index].name = partition.name;
//             }
//             else{
//                 if(partition.id.endsWith(":"))
//                     partition.id=partition.id.slice(0,partition.id.length-1);
//                 if(partition.identifier) 
//                     partition.identifier = "/dev/" + partition.identifier;
//                 last_partition_index = partition.id;
//                 disk.partitions[partition.id]=partition;
//             }
//         })
//         if(disk.partitions.length >= 1 && disk.partitions[0].id == "0"){            
//             let disk_partition = disk.partitions.splice(0,1)[0]
//             disk.size = disk_partition.size.replace(/^[*+-\\]/,"");
//             disk.name = disk_partition.name;
//         }
//         return disk
//     });

//     return disks;
// }

// function parse_diskutil_info(stdout):Diskutil_info{
//     let parsed = {}
//     stdout.split(/\n/).forEach(line => {
//         let match = line.match(/(?<key>.*):(?<val>.*)/)
//         if(match){
//             let key = match.groups.key.trim()
//             let val = match.groups.val.trim()            
//             if(['Mounted','OS Can Be Installed','Read-Only Media','Read-Only Volume'].includes(key)){                               
//                 parsed[key] = ( val.search("Y|y")>=0 ? true : false)
//             }
//             else{
//                 parsed[key] = val;
//             }
//         }
//     });        
//     return parsed;
// }

// export async function update_partition(partition:Partition){
//     let {stdout} = await asyncExec(`diskutil info ${partition.identifier}`);
//     let parsed = parse_diskutil_info(stdout)
    
    
//     let combined:Partition = {...partition}

//     const copy = (from:string, to:string, def=combined[to]) => {
//         combined[to] = parsed[from]!==undefined? parsed[from]: def;
//     }

//     if(!parsed["Volume Name"].match(/^[nN]ot/))
//         copy("Volume Name", "name");
//     copy("Mounted", "is_mounted")
//     copy("Mount Point", "mount_path")
//     copy("Type (Bundle)", "filesystem")
//     copy("Device Node", "identifier")
    
//     return combined
// }

// export async function update_disk(disk:Disk){
//     let {stdout} = await asyncExec(`diskutil info ${disk.identifier}`);
//     let parsed = parse_diskutil_info(stdout)
    
    
//     let combined:Disk = {...disk}

//     // const copy = (from:string, to:string, def=combined[to]) => {
//     //     let exist = parsed[from]!==undefined
//     //     combined[to] = exist? parsed[from]: def;
//     //     return exist;
//     // }

//     if(parsed["Disk Size"]!==undefined){
//         combined.size = parsed["Disk Size"].match(/(?<size>^.* [A-Z][Bb]) /).groups.size
//     }

//     return combined
// }

async function file_exists(path:string){
    return ((await asyncExec(`test -e ${path} && echo 1 || echo 0`)).stdout.trim() == '1')
}

function multiline_echo_command(multiline:string|string[], splitter=/\n/){
    return "(" + (multiline instanceof Array? multiline :multiline.split(splitter)).map((str)=>"echo " + str.trim()).join(" & echo. & ") + ")"
}

async function exec_diskpart(command:string|string[]){
    const getRelevent = (stdout:string):string[] => {        
        let indexes:number[] = [];
        let lines = stdout.split(/\n/);
        lines.forEach((line,index)=>{
            if(line.match(/DISKPART>/)) indexes.push(indexes.length%2===0?index+1:index);
        })
        if(indexes.length%2!=0) throw "failed commands"
        let index_pairs:[number,number][] = []
        for(let i =0 ; i<indexes.length; i+=2){
            index_pairs.push([indexes[i],indexes[i+1]])
        }
        let sections = index_pairs.map((pair)=>lines.slice(...pair).join("\n"))
        return sections;
    }

    return getRelevent(await asyncSudoExec(`${multiline_echo_command(command)} | diskpart`))
}

export async function list_disks(){
    let disks:Disk[] = parse_table_section((await exec_diskpart(["list disk"]))[0])
    let script = disks.map(disk=>[`select ${disk.Disk}`,"list partition"]).reduce((prev,curr)=>[...prev,...curr],[]);
    let all_partitions:Partition[][] = (await exec_diskpart(script)).filter((_section,index)=>index%2!==0).map(section=>parse_table_section(section))
    all_partitions.forEach((partitions,index)=>{
        disks[index].partitions = partitions;
    })
    console.log(disks);

    // parse_detail((await exec_diskpart(["select disk 1","select partition 1","detail partition"]))[2])
}

function is_table(table_section:string){
    return table_section.split("\n")[1].match(/^[ -]*$/)!==null
}

function parse_table(section:string){
    if(is_table) { return parse_table_section(section)}
    else { return { fail: section } }
}

function parse_table_section(section:string){
    let lines = section.split("\n")
    let attributes = lines[0].match(/[A-Z][a-z]*/g)
    let deviders = attributes.map((col)=>lines[0].search(col))
    deviders.push(lines[0].length)
    lines.splice(0,2)
    let devider_pairs:[number,number][] = []
    for(let i=1; i<deviders.length; i++){
        devider_pairs.push([deviders[i-1],deviders[i]]);
    }
    if(devider_pairs.length !== attributes.length) throw "parse table section aint working"
    let table = lines.map((line)=>devider_pairs.map(([x,y])=>line.slice(x,y)))
    return table.map((row)=>{
        let obj = {};
        row.forEach((val,i)=>{
            if (val.trim()!=="")
                obj[attributes[i]]=val.trim()
        })
        return obj
    }).filter(item=>Object.keys(item).length!=0)
}

function parse_detail(section:string){
    let lines = section.split("\n");
    let empty_line_indexes = lines.reduce((prev,curr,index)=>curr.match(/^\s*$/)?[...prev,index]:prev,[])
    let [detail, table] = [lines.slice(0,empty_line_indexes[0]).join("\n"),lines.slice(empty_line_indexes[0]+1,empty_line_indexes[1]?empty_line_indexes[1]:lines.length).join("\n")]

}


// export async function mount_partition(partition:Partition, mount_path:string=undefined):Promise<Partition>{
//     if(mount_path===undefined){
//         if(partition.name){
//             mount_path=`/Users/pavel/Desktop/Volumes/${partition.name}`
//         }
//         else {
//             mount_path=`/Users/pavel/Desktop/Volumes/${partition.identifier.match(/^(\/dev\/|)(?<name>.*)/).groups.name}`
//         }
//     }
//     if (!partition.is_mounted){
//         if (!await file_exists(mount_path)) {
//             await asyncExec(`mkdir -p ${mount_path}`)
//             console.log(`created ${mount_path}`);
//         }        
//         try{
//             await asyncSudoExec(`mount -t ${partition.filesystem} ${partition.identifier} ${mount_path}`)
//             console.log(`mounted ${partition.identifier} in ${mount_path}`);
//         }
//         catch (err){
//             console.log(err);
//         }
//     }
//     return update_partition(partition)
// }

// export async function unmount_partition(partition: Partition){
//     if(partition.is_mounted){
//         try{
//             await asyncSudoExec(`diskutil umount ${partition.identifier}`)
//             console.log(`unmounted ${partition.identifier}`);
//             if(await file_exists(partition.mount_path)){
//                 if(partition.is_mount_path_self_created){
//                     console.log("removing path");
//                     await asyncSudoExec(`rm -f ${partition.identifier}`)
//                 }
//             }
//         }
//         catch(err){
//             console.log(err);
//         }
//         return await update_partition(partition);
//     }    
//     else
//         return partition;
// }

// export async function toggle_mount_partition(partition:Partition){
//     if(partition.is_mounted){
//         return await unmount_partition(partition)
//     }
//     else {
//         return await mount_partition(partition)
//     }
// }

export default {
    list_disks,
    // update_disk,
    // update_partition,
    // mount_partition,
    // unmount_partition,
    // toggle_mount_partition
}

// main();