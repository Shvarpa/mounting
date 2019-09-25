export interface Partition {
}

export interface Disk { 
    "Disk"?: string,
    "Status"?: string,
    "Size"?: string,
    "Free"?: string,
    "Dyn"?: string,
    "Gpt"?: string,
    "partitions"?: Partition[],
}