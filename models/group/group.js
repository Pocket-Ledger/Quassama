import { addDoc, collection, query, where, getDocs, or, updateDoc, doc, arrayUnion, getDoc } from "firebase/firestore";
import { app, db } from "../../firebase";
import Notification from "models/notifications/notifications";

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
        const memberIds = members.map(m => (typeof m === 'string' ? m : m.id));

        const groupData = {
            name,
            created_by,
            currency,
            members,
            memberIds,
            created_at: new Date().toISOString(),
            description,
        };

        const GroupsCollection = collection(db, "groups");
        const docRef = await addDoc(GroupsCollection, groupData);
        console.log("Group created with ID: ", docRef.id);
        // Notify the creator about the group creation
        const notification = new Notification(
            created_by,
            created_by,
            'group_created',
            `You have created a new group: ${name}`
        );
        await notification.save(); // Save the notification
        console.log("Notification sent for group creation");
        return docRef.id;
    }

    // function to get the group by the current user_id or members id
    static async getGroupsByUser(user_id) {
        console.log("Fetching groups for user:", user_id);
        const GroupsCollection = collection(db, "groups");
        // Query: user is creator OR is in members array
        const q = query(
            GroupsCollection,
            or(
                where("created_by", "==", user_id),
                where("memberIds", "array-contains", user_id)
            )
        );
        const querySnapshot = await getDocs(q);
        const groups = [];
        querySnapshot.forEach((doc) => {
            groups.push({ id: doc.id, ...doc.data() });
        });
        return groups;
    }

    static async addMemberToGroup(groupId, member) {
        const groupRef = doc(db, "groups", groupId);
        const memberId = typeof member === 'string' ? member : member.id;
        await updateDoc(groupRef, {
        members: arrayUnion(member),
        memberIds: arrayUnion(memberId),
        });
    }

    static async getGroupById(groupId) {
        const ref = doc(db, 'groups', groupId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            throw new Error('Group not found');
        }
        return { id: snap.id, ...snap.data() };
    }

    
}

export default Group;