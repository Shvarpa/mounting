import fs = require("fs")
import cmd = require('child_process');
import util = require("util")
import sudo from "sudo-prompt"
const asyncExec = util.promisify(cmd.exec);

// const _asyncSudoExec = util.promisify(sudo.exec)
const asyncSudoExec = async (command) => util.promisify(sudo.exec)(command,{name:"mounter"})
// process.title = "mounter"

import { Disk, Dict, Detail, PartitionDetail, PartitionTable, Partition, ParsedDetail } from "../types/Diskutil"


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

function is_table(table_section:string){
    let lines = table_section.split("\n")
    return lines.length>=2 && lines[1].match(/[ ]*-+[ ]*/)!==null
}

function parse_table_section(section:string):Dict[]{
    let lines = section.split("\n")
    let attributes = lines[0].match(/[A-Z][a-z]*/g)
    let deviders = attributes.map((col)=>lines[0].search(col))
    deviders.push(lines[1].length)
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

function parse_detail_section(section:string):Detail{
    let lines = section.split(/\n/)
    let Title = lines[0].trim();
    let obj = {};
    lines.map(line=>line.split(/[ ]*:[ ]*/)).filter(line=>!(line.length<2)).forEach(([key,val])=>obj[key]=val)
    return {Title,...obj}
}

function parse_detail(section:string):ParsedDetail{
    let lines = section.split("\n");
    let empty_line_indexes = lines.reduce((prev,curr,index)=>curr.match(/^\s*$/)?[...prev,index]:prev,[])
    let detail = lines.slice(0,empty_line_indexes[0]).join("\n")
    let table = lines.slice(empty_line_indexes[0]+1,empty_line_indexes[1]?empty_line_indexes[1]:lines.length).join("\n");
    return {detail:parse_detail_section(detail),...(is_table(table)?{table:parse_table_section(table)}:{_error:table})}
}

function detail_to_partition(parsed:ParsedDetail):Partition{
    let detail:PartitionDetail = parsed.detail
    let table:PartitionTable = parsed.table ? parsed.table[0] : undefined
    let res:Partition & { [key:string]:any } = {...detail}
    res.Mountable = !!table
    if(res.Type) {res.UUID = res.Type; delete res.Type}
    if(res.Title) { delete res.Title}
    if(table) {
        Object.keys(table).filter(key=>!["Volume","Type"].includes(key)).forEach(key=>res[key]=table[key])
    }
    return res;
}

function detail_to_disk(parsed:ParsedDetail):Disk{
    return parsed.detail;
}

export async function list_disks(){
    let disks:Disk[] = parse_table_section((await exec_diskpart(["list disk"]))[0])
    let script = disks.map(disk=>[`select ${disk.Disk}`,"list partition"]).reduce((prev,curr)=>[...prev,...curr],[]);
    let all_partitions:Partition[][] = (await exec_diskpart(script)).filter((_section,index)=>index%2!==0).map(section=>parse_table_section(section))
    all_partitions.forEach((partitions,index)=>{
        disks[index].partitions = partitions;
    })

    return disks;
}

function combine_array_reducer(prev,curr){return [...prev,...curr]}

export async function update_partition(disk:Disk,partition_index?:number){
    let script:string[]
    if(partition_index){
        script = [`select ${disk.Disk}`,`select ${disk.partitions[partition_index].Partition}`,`detail partition`]
    }
    else{
        script = disk.partitions.map(partition=>[`select ${disk.Disk}`,`select ${partition.Partition}`,`detail partition`]).reduce(combine_array_reducer,[])
    }
    let sections = (await exec_diskpart(script)).filter((_,index)=>index%3==2)    
    let partitions = sections.map(section=>detail_to_partition(parse_detail(section)))
    let copy:Disk = {...disk}
    if(partition_index){
        copy.partitions[partition_index] = {...copy.partitions[partition_index],...partitions[0]}
    } else {
        copy.partitions.forEach((partition,i)=>copy.partitions[i] = {...copy.partitions[i], ...partitions[i]})
    }
    return copy    
}

export async function update_all_partitions(disks:Disk[]){
    let script:string[] = disks.map(disk=>disk.partitions.map(partition=>[`select ${disk.Disk}`,`select ${partition.Partition}`,`detail partition`])).reduce(combine_array_reducer,[]).reduce(combine_array_reducer,[])
    let sections = (await exec_diskpart(script)).filter((_,index)=>index%3==2)    
    let partitions = sections.map(section=>detail_to_partition(parse_detail(section)))
    let partition_counts = disks.map(disk=>disk.partitions.length)
    let deviders:[number,number][] = [];
    let prev = 0
    partition_counts.forEach((number,index)=>{
        let next = prev + partition_counts[index]
        deviders.push([prev,next])
        prev = next
    })
    if(deviders.length !== disks.length) throw "update all partitions not working"
    let partitions_by_disk = deviders.map(([x,y])=>partitions.slice(x,y))
    let copy = [...disks]
    copy.forEach((disk,i)=>disk.partitions.forEach((partition,j)=>copy[i].partitions[j]={...partition,...partitions_by_disk[i][j]}))
    return copy    
}

export async function update_disk(disk:Disk){
    return {...disk,...detail_to_disk(parse_detail(await exec_diskpart([`select ${disk.Disk}`, "detail disk"])[1]))}
}

export async function update_all_disk(disks:Disk[]){
    let script:string[] = disks.map(disk=>[`select ${disk.Disk}`, "detail disk"]).reduce(combine_array_reducer,[])
    let sections = (await exec_diskpart(script)).filter((_,index)=>index%2==1)
    let parsed = sections.map(section=>detail_to_disk(parse_detail(section)))
    let copy = [...disks]
    if(parsed.length!==copy.length) throw "update all disks not working"
    copy.forEach((disk,index)=>copy[index]={...copy[index],...parsed[index]})
    return copy
}

export async function update_all(disks:Disk[]){
    let script_disks:string[] = disks.map(disk=>[`select ${disk.Disk}`, "detail disk"]).reduce(combine_array_reducer,[])
    let script_partitions:string[] = disks.map(disk=>disk.partitions.map(partition=>[`select ${disk.Disk}`,`select ${partition.Partition}`,`detail partition`])).reduce(combine_array_reducer,[]).reduce(combine_array_reducer,[])    
    let sections = await exec_diskpart([...script_disks,...script_partitions])
    let [disk_sections,partition_sections] = [sections.slice(0,script_disks.length).filter((_,index)=>index%2==1), sections.slice(script_disks.length).filter((_,index)=>index%3==2) ]
    let [parsed_disks,parsed_partitions] = [disk_sections.map(section=>detail_to_disk(parse_detail(section))), partition_sections.map(section=>detail_to_partition(parse_detail(section)))]
    let partition_counts = disks.map(disk=>disk.partitions.length)
    let deviders:[number,number][] = [];
    let prev = 0
    partition_counts.forEach((number,index)=>{
        let next = prev + partition_counts[index]
        deviders.push([prev,next])
        prev = next
    })    
    if(deviders.length !== disks.length) throw "update all partitions not working"
    let partitions_by_disk = deviders.map(([x,y])=>parsed_partitions.slice(x,y))
    let copy = [...disks]
    copy.forEach((disk,i)=>copy[i]={...copy[i],...parsed_disks[i]})
    copy.forEach((disk,i)=>disk.partitions.forEach((partition,j)=>copy[i].partitions[j]={...partition,...partitions_by_disk[i][j]}))
    console.log(copy);
    return copy    
}

export async function mount_partition(disk:Disk, partition_index:number, letter?:string) {
    let partition = disk.partitions[partition_index]
    if(partition.Mountable && !partition.Ltr){
        console.log((await exec_diskpart([`select ${disk.Disk}`, `select ${partition.Partition}`, `assign ${ letter ? `${letter}:` : ""}`]))[2].trim())
    }
    return update_partition(disk,partition_index)
}

export async function unmount_partition(disk:Disk, partition_index:number) {
    let partition = disk.partitions[partition_index]
    if(partition.Mountable && partition.Ltr){
        console.log((await exec_diskpart([`select ${disk.Disk}`, `select ${partition.Partition}`, `remove`])[2]));
    }
    return update_partition(disk,partition_index)
}

export async function toggle_mount_partition(disk:Disk, partition_index:number) {
    return disk.partitions[partition_index].Ltr ? unmount_partition(disk,partition_index) : mount_partition(disk, partition_index)
}


export default {
    list_disks,
    update_disk,
    update_all_disk,
    update_partition,
    update_all_partitions,
    update_all,
    mount_partition,
    unmount_partition,
    toggle_mount_partition
}

// main();