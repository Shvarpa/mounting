export interface Disk {
    path: string;
    description: string;
    partitions: Partition[];
}

export interface Partition {
    id: string;
    type: string;
    name?: string;
    size: string;
    identifier: string;
    mounted?:boolean;
    mount_path?:string;
    filesystem?:string;
    path?:string;
    self_created?:boolean;
}

export interface Partition_Info {
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
}