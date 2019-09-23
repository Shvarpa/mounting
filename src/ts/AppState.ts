import { list_disks,update_partition,toggle_mount_partition } from "./commands"
import { Disk } from "../types/Diskutil";
import { Actions } from "../types/Actions";

export default function(state:[Disk[], React.Dispatch<React.SetStateAction<Disk[]>>]): [Actions,any]{
    const [disks,setDisks] = state;

    const startup = async () => {
        let updated_disks = await list_disks();
    
        // updated_disks = await Promise.all(updated_disks.map(update_disk));
        
        updated_disks = await Promise.all(updated_disks.map(async (disk):Promise<Disk>=>{
                let updated_partitions = await Promise.all(disk.partitions.map(async (partition)=>await update_partition(partition)))
                return {...disk, partitions: updated_partitions}
            }))
            
        setDisks(updated_disks)
    }

    const refresh = (i:number,j:number) =>{
        return async () => { 
            let new_disks:Disk[] = [...disks];
            new_disks[i].partitions[j] = await update_partition(new_disks[i].partitions[j])
            setDisks(new_disks)
            console.log(`refreshed ${new_disks[i].partitions[j].identifier}`);
        }
    }

    const toggle_mount = (i:number,j:number) =>{
        return async () => { 
            let new_disks:Disk[] = [...disks];
            new_disks[i].partitions[j] = await toggle_mount_partition(new_disks[i].partitions[j])
            setDisks(new_disks)
            // ${new_disks[i].partitions[j].is_mounted?"Mounted " : "unMounted "}
            // console.log(`toggled ${new_disks[i].partitions[j].identifier}`);
        }
    }

    return [{refresh,toggle_mount},{startup}]
}