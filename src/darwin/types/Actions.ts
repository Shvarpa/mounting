export interface Actions {
    refresh: (disk_index:number,partition_index:number)=>any,
    toggle_mount: (disk_index:number,partition_index:number)=>any
}