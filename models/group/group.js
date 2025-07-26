import { addDoc, collection, query, where, getDocs, or, updateDoc, doc, arrayUnion, getDoc } from "firebase/firestore";
import { app, db } from "../../firebase";
import Notification from "models/notifications/notifications";
import User from '../auth/user';

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
    async creatGroup(name, created_by, currency, members = [], description) {
        // When creating a group, only add the creator as a member
        // Invited members will be added when they accept invitations
        const currentUserDetails = await User.getUserDetails();
        const creatorMember = {
            id: created_by,
            name: currentUserDetails.username,
            initial: currentUserDetails.username ? currentUserDetails.username[0].toUpperCase() : '',
            color: '#2979FF',
        };
        
        const finalMembers = [creatorMember];
        const memberIds = [created_by];

        const groupData = {
            name,
            created_by,
            currency,
            members: finalMembers,
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
        
        // If member is just a string (user ID), we need to construct a proper member object
        let memberObject;
        let memberId;
        
        if (typeof member === 'string') {
            // Fetch user details to create proper member object
            try {
                const username = await User.getUsernameById(member);
                memberObject = {
                    id: member,
                    name: username,
                    initial: username ? username[0].toUpperCase() : 'U',
                    color: '#2979FF'
                };
                memberId = member;
            } catch (error) {
                console.error('Error fetching user details for member:', error);
                // Fallback - create basic member object
                memberObject = {
                    id: member,
                    name: 'Unknown User',
                    initial: 'U',
                    color: '#2979FF'
                };
                memberId = member;
            }
        } else {
            // Member is already an object
            memberObject = member;
            memberId = member.id;
        }

        // Check if member already exists in the group
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
            const groupData = groupSnap.data();
            const existingMemberIds = (groupData.memberIds || []);
            
            // Don't add if member already exists
            if (existingMemberIds.includes(memberId)) {
                console.log(`Member ${memberId} already exists in group ${groupId}`);
                return;
            }
        }

        await updateDoc(groupRef, {
            members: arrayUnion(memberObject),
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

    /**
   * Return an array of members for a given group.
   * If members were stored as strings, treat them as IDs/names.
   */
    static async getMembersByGroup(groupId) {
        const { members = [] } = await this.getGroupById(groupId);
        // If members are objects with user_id, extract the IDs
        const memberIds = members.map(m => (typeof m === 'string' ? m : m.user_id || m.id || m));
        // Remove duplicate IDs
        const uniqueMemberIds = Array.from(new Set(memberIds));
        // Fetch user details for each unique member
        const userDetailsList = await Promise.all(
            uniqueMemberIds.map(async (userId) => {
            try {
                const usersCol = collection(db, 'users');
                const q = query(usersCol, where('user_id', '==', userId));
                const snap = await getDocs(q);
                if (!snap.empty) {
                const doc = snap.docs[0];
                return { id: doc.id, ...doc.data() };
                }
                return { id: userId, username: 'Unknown', email: '', user_id: userId };
            } catch (e) {
                return { id: userId, username: 'Unknown', email: '', user_id: userId };
            }
            })
        );
        return userDetailsList;
    }


    /**
     * Function to update the group details
     * @param {string} groupId - The ID of the group to update
     * @param {Object} updates - An object containing the fields to update
     * @returns {Promise<void>}
     */
    static async updateGroup(groupId, updates, currentUserId) {
        try {
            if (!groupId) {
            throw new Error('Group ID is required');
            }

            if (!currentUserId) {
            throw new Error('Current user ID is required');
            }

            if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
            throw new Error('Updates object is required and must contain at least one field to update');
            }

            const groupRef = doc(db, "groups", groupId);
            
            const groupSnap = await getDoc(groupRef);
            if (!groupSnap.exists()) {
            throw new Error('Group not found');
            }

            const groupData = groupSnap.data();
            
            // Check if current user is the admin (created_by)
            if (groupData.created_by !== currentUserId) {
            throw new Error('Only the group admin can update this group');
            }

            const updateData = { ...updates };
            
            if (updates.members) {
            updateData.memberIds = updates.members.map(m => 
                typeof m === 'string' ? m : m.id
            );
            }

            updateData.updated_at = new Date().toISOString();

            await updateDoc(groupRef, updateData);
            
            console.log(`Group ${groupId} updated successfully`);

        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    }

    /**
     * Function to delete a group
     * @param {string} groupId - The ID of the group to delete
     * @param {string} currentUserId - The ID of the user attempting to delete
     * @returns {Promise<void>}
     */
    static async deleteGroup(groupId, currentUserId){
        try {
            if(!groupId || !currentUserId){
                throw new Error('Group ID and current user ID are required');
            }
            // only the creator of the group can delete it
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);
            if (!groupSnap.exists()) {
                throw new Error('Group not found');
            }
            const groupData = groupSnap.data();
            if (groupData.created_by !== currentUserId) {
                throw new Error('Only the group admin can delete this group');
            }
            await updateDoc(groupRef, {
                members: [],
                memberIds: [],
            });
            console.log(`Group ${groupId} deleted successfully`);
        } catch (error) {
            console.error("Error deleting group:", error);
            throw error;
        }
    }

    /**
     * Clean up duplicate members in a group
     * This method removes duplicate member entries (both objects and strings)
     * @param {string} groupId - The ID of the group to clean up
     * @returns {Promise<void>}
     */
    static async cleanupGroupMembers(groupId) {
        try {
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);
            
            if (!groupSnap.exists()) {
                throw new Error('Group not found');
            }
            
            const groupData = groupSnap.data();
            const members = groupData.members || [];
            
            // Create a map to track unique members by ID
            const uniqueMembers = new Map();
            const uniqueMemberIds = new Set();
            
            for (const member of members) {
                let memberId, memberObject;
                
                if (typeof member === 'string') {
                    // String member ID - convert to object if not already exists
                    memberId = member;
                    if (!uniqueMembers.has(memberId)) {
                        try {
                            const username = await User.getUsernameById(memberId);
                            memberObject = {
                                id: memberId,
                                name: username,
                                initial: username ? username[0].toUpperCase() : 'U',
                                color: '#2979FF'
                            };
                        } catch (error) {
                            memberObject = {
                                id: memberId,
                                name: 'Unknown User',
                                initial: 'U',
                                color: '#2979FF'
                            };
                        }
                        uniqueMembers.set(memberId, memberObject);
                        uniqueMemberIds.add(memberId);
                    }
                } else if (member && typeof member === 'object' && member.id) {
                    // Object member
                    memberId = member.id;
                    if (!uniqueMembers.has(memberId)) {
                        uniqueMembers.set(memberId, member);
                        uniqueMemberIds.add(memberId);
                    }
                }
            }
            
            // Convert back to arrays
            const cleanMembers = Array.from(uniqueMembers.values());
            const cleanMemberIds = Array.from(uniqueMemberIds);
            
            // Update the group with clean data
            await updateDoc(groupRef, {
                members: cleanMembers,
                memberIds: cleanMemberIds,
            });
            
            console.log(`Cleaned up group ${groupId}: ${members.length} -> ${cleanMembers.length} members`);
            
        } catch (error) {
            console.error('Error cleaning up group members:', error);
            throw error;
        }
    }

    /**
     * Fetch user details and their groups in one call
     * @param {string} userId
     * @param {function} getUserDetails - function to get user details
     * @returns {Promise<{user: any, groups: any[]}>}
     */
    static async getUserAndGroups(userId, getUserDetails) {
        const user = await getUserDetails();
        const groups = await this.getGroupsByUser(userId);
        return { user, groups };
    }
}

export default Group;