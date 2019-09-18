import fs = require("fs")
import cmd = require('child_process');
import util = require("util")
import sudo = require("sudo-prompt")
const asyncExec = util.promisify(cmd.exec)
const asyncSudoExec = util.promisify(sudo.exec)
const asyncAccess = util.promisify(fs.access)
// process.title = "mounter"

import { Disk, Partition } from "../types/Diskutil"


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

function parse_diskutil_info(stdout):{
    'Device Identifier'?:string;
    'Device Node'?:string;
    'Whole'?:boolean;
    'Volume Name'?: string;
    'Mounted'?: boolean,
    'Mount Point'?: string,
    'Partition Type'?: string,
    'File System Personality'?: string,
    'Type (Bundle)'?: string,
    'Name (User Visible)'?: string,
    'Owners'?: string,
    'OS Can Be Installed'?: boolean,
    'Booter Disk'?: string,
    'Recovery Disk'?: string,
    'Media Type'?: string,
    'Protocol'?: string,
    'SMART Status'?: string,
    'Volume UUID'?: string,
    'Disk / Partition UUID'?: string,
    'Disk Size'?: string,
    'Device Block Size'?: string,
    'Volume Total Space'?: string,
    'Volume Used Space'?: string,
    'Volume Free Space'?: string,
    'Allocation Block Size'?: string,
    'Read-Only Media'?: boolean,
    'Read-Only Volume'?: boolean,
    'Device Location'?: string,
    'Removable Media'?: string
}{
    let parsed = {}
    stdout.split(/\n/).forEach(line => {
        let match = line.match(/(?<key>.*):(?<val>.*)/)
        if(match){
            let key = match.groups.key.trim()
            let val = match.groups.val.trim()            
            if(['Mounted','OS Can Be Installed','Read-Only Media','Read-Only Volume'].includes(key)){                               
                parsed[key] = ( val.search("Y|y")>=0 ? true : false)
            }
            else{
                parsed[key] = val;
            }
        }
    });        
    return parsed;
}

export async function update_partition(partition:Partition){
    let {stdout} = await asyncExec(`diskutil info ${partition.identifier}`);
    let parsed = parse_diskutil_info(stdout)
    
    if(parsed["Mounted"]!==undefined){            
        partition.mounted = parsed.Mounted;
        partition.mount_path = (partition.mounted ? parsed["Mount Point"] : undefined)
    }
    if(parsed['Type (Bundle)']!==undefined){
        partition.filesystem = parsed['Type (Bundle)'];
    }
    if(parsed['Device Node']!==undefined){
        partition.path = parsed['Device Node'];
    }
}

async function file_exists(path:string){
    return ((await asyncExec(`test -e ${path} && echo 1 || echo 0`)).stdout.trim() == '1')
}

export async function mount_partition(partition:Partition, mount_path=`/Users/pavel/Desktop/${partition.name}`){
    if (!partition.mounted){
        if (!await file_exists(mount_path)) {
            console.log("~~~~~creating dir~~~~~~");
            await asyncExec(`mkdir ${mount_path}`)
            console.log("~~~~~created dirrrrrrr~~~~");
        }
        console.log("~~~~~~~dirr_existsssssssss");
        
        let { stdout, stderr } = await asyncSudoExec(`mount -t ${partition.filesystem} ${partition.path} ${mount_path}`,{name:"mounter"})
        partition.self_created = true;
        partition.mounted = true;
        partition.mount_path = mount_path;
        if(stderr){
            console.log(stderr);
        }
        console.log(stdout);
    }
}

export async function list_disks(){
    let { stdout } = await asyncExec("diskutil list")
    return parse_diskutil(stdout);    
}

async function main(){
    let disks = await list_disks();
    await update_partition(disks[3].partitions["1"]);    
    await mount_partition(disks[3].partitions["1"])
    console.log(disks[3].partitions["1"]);
    await setTimeout(()=>{},1000)
    unmount_partition(disks[3].partitions["1"])
}

export async function unmount_partition(partition: Partition){
    if(partition.mounted){
        await asyncSudoExec(`diskutil umount ${partition.path}`,{name:"mounter"})
        console.log(`unmounted ${partition.path}`);
        if(await file_exists(partition.mount_path)){
            if(partition.self_created){
                console.log("removing path");
                asyncSudoExec(`rm -f ${partition.path}`,{name:"mounter"})
            }
        }
    }    
}

export default {
    list_disks,
    update_partition,
    mount_partition,
    unmount_partition
}

// main();