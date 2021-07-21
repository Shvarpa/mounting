import { list_disks,update_partition,toggle_mount_partition } from "./commands"
import { Disk } from "../types/Diskutil";
import { Actions } from "../types/Actions";
import { update_all } from "./commands";

export default function(state:[Disk[], React.Dispatch<React.SetStateAction<Disk[]>>]): [Actions,any]{
    const [disks,setDisks] = state;

    const startup = async () => {
        let updated_disks = await list_disks();
    
        // updated_disks = await Promise.all(updated_disks.map(update_disk));
        
        console.log("list :", updated_disks);
        
        updated_disks = await update_all(updated_disks)
        console.log("all :", updated_disks);
        
        setDisks(updated_disks)
    }

    const refresh = (i:number,j:number) =>{
        return async () => { 
            let new_disks:Disk[] = [...disks];
            new_disks[i] = await update_partition(new_disks[i],j)
            setDisks(new_disks)
            console.log(`refreshed ${new_disks[i].Disk}>${new_disks[i].partitions[j].Partition}`);
        }
    }

    const toggle_mount = (i:number,j:number) =>{
        return async () => { 
            let new_disks:Disk[] = [...disks];
            new_disks[i] = await toggle_mount_partition(new_disks[i],j)
            console.log(`tryed toggle mount of ${new_disks[i].Disk}>${new_disks[i].partitions[j].Partition}`);
            setDisks(new_disks)
            // ${new_disks[i].partitions[j].is_mounted?"Mounted " : "unMounted "}
            // console.log(`toggled ${new_disks[i].partitions[j].identifier}`);
        }
    }

    return [{refresh,toggle_mount},{startup}]
}