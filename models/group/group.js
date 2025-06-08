import { addDoc, collection } from "firebase/firestore";
import { app, db } from "../../firebase"; 

class Group{
    name;
    created_by;
    currency;
    members;
    created_at;
    description;

    constructor(name, created_by, currency, members, created_at, description) {
        this.name = name;
        this.created_by = created_by;
        this.currency = currency;
        this.members = members || [];
        this.created_at = created_at;
        this.description = description;
    }

    // function to create the group and save it to firebase collection groups
    async creatGroup(name, created_by, currency, members, description) {
        const groupData = {
            name,
            created_by,
            currency,
            members,
            created_at: new Date().toISOString(),
            description,
        };

        const GroupsCollection = collection(db, "groups");
        const docRef = await addDoc(GroupsCollection, groupData);
        console.log("Group created with ID: ", docRef.id);
        return docRef.id;
    }

    // function to get the group by the current user_id or members id
    

    
}

export default Group;