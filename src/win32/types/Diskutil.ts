export interface Detail {
    "Title"?: string,
}

export interface PartitionTable {
    "Volume"?: string,
    "Ltr"?: string,
    "Label"?: string,
    "Fs"?: string,
    "Type"?: string,
    "Size"?: string,
    "Status"?: string,
    "Info"?: string,
}

export interface PartitionDetail extends Detail{
    "Type"?: string,
    "Hidden"?: string,
    "Required"?: string,
    "Attrib"?: string,
    "Offset in Bytes"?: string,
}

export interface Partition {
    "Partition"?: string,
    "Type"?: string,
    "Size"?: string
    "Offset"?: string,
    "Name"?: string,
    "UUID"?: string,
    "Hidden"?: string,
    "Required"?: string,
    "Attrib"?: string,
    "Offset in Bytes"?: string,
    "Ltr"?: string,
    "Label"?: string,
    "Fs"?: string,
    "Status"?: string,
    "Info"?: string,
    "Mountable"?: boolean,
}

export interface DiskDetail extends Detail{
    "Disk ID"?: string,
    "Type"?: string,
    "Status"?: string,
    "Path"?: string,
    "Target"?: string,
    "LUN ID"?: string,
    "Location Path"?: string,
    "Current Read-only State"?: string,
    "Read-only"?: string,
    "Boot Disk"?: string,
    "Pagefile Disk"?: string,
    "Hibernation File Disk"?: string,
    "Crashdump Disk"?: string,
    "Clustered Disk"?: string,
}

export interface Disk extends DiskDetail{ 
    "Disk"?: string,
    "Status"?: string,
    "Size"?: string,
    "Free"?: string,
    "Dyn"?: string,
    "Gpt"?: string,
    "partitions"?: Partition[],
}

export interface Dict {
    [key: string]: string
}

export interface ParsedDetail {
    detail:Detail,
    table?:Dict[],
    _error?:string
}