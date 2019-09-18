export interface Disk {
    path: string;
    description: string;
    partitions: { [id: string]: Partition };
}

export interface Partition {
    id: string;
    type: string;
    name: string;
    size: string;
    identifier: string;
    mounted?:boolean;
    mount_path?:string;
    filesystem?:string;
    path?:string;
    self_created?:boolean;
}