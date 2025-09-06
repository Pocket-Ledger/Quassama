import { addDoc, collection, query, where, getDocs, or, updateDoc, doc, arrayUnion, getDoc, deleteDoc } from "firebase/firestore";
import { app, db } from "../../firebase";
import Notification from "models/notifications/notifications";
import User from '../auth/user';
import { getAuth } from "firebase/auth";

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

    /**
     * A function to check if the user has any groups
     * @return true or false
     */
    static async hasAnyGroups(){
        const user = getAuth();
        const currentUser = user.currentUser;
        if(!currentUser){
            throw new Error('User not authenticated');
        }
        const user_id = currentUser.uid;
        const groups = await this.getGroupsByUser(user_id);
        return groups.length > 0;
    }

    static async addMemberToGroup(groupId, member) {
        // Check if all current members have zero balance before adding new member
        const Expense = (await import('../expense/Expense')).default;
        const balances = await Expense.calculateGroupBalances(groupId);
        
        // Check if any member has non-zero balance
        const hasOutstandingBalances = Object.values(balances).some(
            balance => Math.abs(balance.balance) > 0.01 // Allow for small floating point differences
        );
        
        if (hasOutstandingBalances) {
            throw new Error('Cannot add new member while there are outstanding balances. Please settle up all expenses first.');
        }

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
        
        console.log(`Member ${memberId} added to group ${groupId} successfully`);
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
            
            // If updating members, check for outstanding balances first
            if (updates.members) {
                const Expense = (await import('../expense/Expense')).default;
                const balances = await Expense.calculateGroupBalances(groupId);
                
                // Check if any member has non-zero balance
                const hasOutstandingBalances = Object.values(balances).some(
                    balance => Math.abs(balance.balance) > 0.01 // Allow for small floating point differences
                );
                
                if (hasOutstandingBalances) {
                    throw new Error('Cannot update group members while there are outstanding balances. Please settle up all expenses first.');
                }

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

            // Import Expense class to delete associated expenses
            const Expense = (await import('../expense/Expense')).default;
            
            // Delete all expenses associated with this group
            const deletedExpensesCount = await Expense.deleteExpensesByGroup(groupId);
            console.log(`Deleted ${deletedExpensesCount} expenses for group ${groupId}`);

            // Actually delete the group document from Firestore
            await deleteDoc(groupRef);
            
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

    /**
     * Update a member's username across all groups they belong to
     * @param {string} userId - The ID of the user whose username changed
     * @param {string} newUsername - The new username
     * @returns {Promise<number>} - Number of groups updated
     */
    static async updateMemberUsernameInGroups(userId, newUsername) {
        try {
            if (!userId || !newUsername) {
                throw new Error('User ID and new username are required');
            }

            // Find all groups where this user is a member
            const GroupsCollection = collection(db, "groups");
            const q = query(
                GroupsCollection,
                or(
                    where("created_by", "==", userId),
                    where("memberIds", "array-contains", userId)
                )
            );
            
            const querySnapshot = await getDocs(q);
            let updatedGroupsCount = 0;

            // Update each group
            for (const groupDoc of querySnapshot.docs) {
                const groupData = groupDoc.data();
                const members = groupData.members || [];
                
                // Check if this user exists in the members array
                let memberUpdated = false;
                const updatedMembers = members.map(member => {
                    if (typeof member === 'object' && member.id === userId) {
                        memberUpdated = true;
                        return {
                            ...member,
                            name: newUsername,
                            initial: newUsername ? newUsername[0].toUpperCase() : 'U'
                        };
                    }
                    return member;
                });

                // Only update if we found and modified the member
                if (memberUpdated) {
                    const groupRef = doc(db, "groups", groupDoc.id);
                    await updateDoc(groupRef, {
                        members: updatedMembers,
                        updated_at: new Date().toISOString()
                    });
                    updatedGroupsCount++;
                    console.log(`Updated username in group ${groupDoc.id}`);
                }
            }

            console.log(`Updated username in ${updatedGroupsCount} groups`);
            return updatedGroupsCount;

        } catch (error) {
            console.error("Error updating member username in groups:", error);
            throw error;
        }
    }

    /**
     * Batch update multiple members' usernames in groups
     * @param {Array<{userId: string, newUsername: string}>} userUpdates - Array of user updates
     * @returns {Promise<number>} - Total number of groups updated
     */
    static async batchUpdateMemberUsernames(userUpdates) {
        try {
            if (!Array.isArray(userUpdates) || userUpdates.length === 0) {
                throw new Error('User updates array is required');
            }

            let totalUpdatedGroups = 0;
            
            for (const { userId, newUsername } of userUpdates) {
                if (userId && newUsername) {
                    const updatedCount = await this.updateMemberUsernameInGroups(userId, newUsername);
                    totalUpdatedGroups += updatedCount;
                }
            }

            console.log(`Batch update completed: ${totalUpdatedGroups} total group updates`);
            return totalUpdatedGroups;

        } catch (error) {
            console.error("Error in batch updating member usernames:", error);
            throw error;
        }
    }

    /**
     * Remove a member from a group
     * @param {string} groupId - The ID of the group
     * @param {string} memberIdToRemove - The ID of the member to remove
     * @param {string} currentUserId - The ID of the user performing the removal
     * @returns {Promise<void>}
     */
    static async removeMemberFromGroup(groupId, memberIdToRemove, currentUserId) {
        try {
            if (!groupId || !memberIdToRemove || !currentUserId) {
                throw new Error('Group ID, member ID to remove, and current user ID are required');
            }

            // Check if all members have zero balance before removing member
            const Expense = (await import('../expense/Expense')).default;
            const balances = await Expense.calculateGroupBalances(groupId);
            
            // Check if any member has non-zero balance
            const hasOutstandingBalances = Object.values(balances).some(
                balance => Math.abs(balance.balance) > 0.01 // Allow for small floating point differences
            );
            
            if (hasOutstandingBalances) {
                throw new Error('Cannot remove member while there are outstanding balances. Please settle up all expenses first.');
            }

            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);
            
            if (!groupSnap.exists()) {
                throw new Error('Group not found');
            }

            const groupData = groupSnap.data();
            
            // Check if current user is the admin (created_by) or the member themselves
            if (groupData.created_by !== currentUserId && memberIdToRemove !== currentUserId) {
                throw new Error('Only the group admin or the member themselves can remove a member from the group');
            }

            // Cannot remove the group creator
            if (memberIdToRemove === groupData.created_by) {
                throw new Error('Cannot remove the group creator. Transfer ownership first or delete the group.');
            }

            const members = groupData.members || [];
            const memberIds = groupData.memberIds || [];

            // Check if member exists in the group
            if (!memberIds.includes(memberIdToRemove)) {
                throw new Error('Member not found in the group');
            }

            // Remove member from both arrays
            const updatedMembers = members.filter(member => {
                const memberId = typeof member === 'string' ? member : member.id;
                return memberId !== memberIdToRemove;
            });

            const updatedMemberIds = memberIds.filter(id => id !== memberIdToRemove);

            // Update the group
            await updateDoc(groupRef, {
                members: updatedMembers,
                memberIds: updatedMemberIds,
                updated_at: new Date().toISOString()
            });

            console.log(`Member ${memberIdToRemove} removed from group ${groupId} successfully`);

        } catch (error) {
            console.error("Error removing member from group:", error);
            throw error;
        }
    }

    /**
     * Check if a group has outstanding balances that need to be settled
     * @param {string} groupId - The ID of the group to check
     * @returns {Promise<{hasOutstandingBalances: boolean, balances: Object}>}
     */
    static async checkOutstandingBalances(groupId) {
        try {
            if (!groupId) {
                throw new Error('Group ID is required');
            }

            const Expense = (await import('../expense/Expense')).default;
            const balances = await Expense.calculateGroupBalances(groupId);
            
            // Check if any member has non-zero balance
            const hasOutstandingBalances = Object.values(balances).some(
                balance => Math.abs(balance.balance) > 0.01 // Allow for small floating point differences
            );

            return {
                hasOutstandingBalances,
                balances
            };

        } catch (error) {
            console.error("Error checking outstanding balances:", error);
            throw error;
        }
    }

    /**
     * Get detailed balance information for a group
     * @param {string} groupId - The ID of the group
     * @returns {Promise<Object>} - Detailed balance information
     */
    static async getGroupBalanceDetails(groupId) {
        try {
            if (!groupId) {
                throw new Error('Group ID is required');
            }

            const Expense = (await import('../expense/Expense')).default;
            const balances = await Expense.calculateGroupBalances(groupId);
            
            // Separate users who owe money from users who are owed money
            const usersWhoOwe = {};
            const usersWhoAreOwed = {};
            let totalOutstanding = 0;

            for (const [userId, balance] of Object.entries(balances)) {
                if (balance.balance < -0.01) { // User owes money
                    usersWhoOwe[userId] = {
                        ...balance,
                        owesAmount: Math.abs(balance.balance)
                    };
                    totalOutstanding += Math.abs(balance.balance);
                } else if (balance.balance > 0.01) { // User is owed money
                    usersWhoAreOwed[userId] = {
                        ...balance,
                        owedAmount: balance.balance
                    };
                }
            }

            return {
                balances,
                usersWhoOwe,
                usersWhoAreOwed,
                totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
                hasOutstandingBalances: totalOutstanding > 0.01
            };

        } catch (error) {
            console.error("Error getting group balance details:", error);
            throw error;
        }
    }

    /**
     * Settle up all balances in a group before adding/removing members
     * @param {string} groupId - The ID of the group to settle up
     * @returns {Promise<Object>} - Settlement summary
     */
    static async settleUpGroupBeforeMemberChange(groupId) {
        try {
            if (!groupId) {
                throw new Error('Group ID is required');
            }

            const Expense = (await import('../expense/Expense')).default;
            
            // Check if settlement is needed
            const balanceCheck = await this.checkOutstandingBalances(groupId);
            
            if (!balanceCheck.hasOutstandingBalances) {
                return {
                    settled: false,
                    message: 'No outstanding balances to settle',
                    transactions: []
                };
            }

            // Perform settlement
            const settlementResult = await Expense.settleUpGroup(groupId);
            
            return {
                settled: true,
                message: 'Group settled up successfully',
                ...settlementResult
            };

        } catch (error) {
            console.error("Error settling up group:", error);
            throw error;
        }
    }

    /**
     * Add member to group with automatic settlement if needed
     * @param {string} groupId - The ID of the group
     * @param {string|Object} member - The member to add (user ID string or member object)
     * @param {boolean} autoSettle - Whether to automatically settle before adding (default: false)
     * @returns {Promise<Object>} - Result with settlement and addition info
     */
    static async addMemberWithSettlement(groupId, member, autoSettle = false) {
        try {
            let settlementResult = null;

            if (autoSettle) {
                // Automatically settle up first
                settlementResult = await this.settleUpGroupBeforeMemberChange(groupId);
            } else {
                // Just check if settlement is needed and throw error if so
                await this.addMemberToGroup(groupId, member);
                return {
                    memberAdded: true,
                    settlementPerformed: false,
                    message: 'Member added successfully'
                };
            }

            // Now add the member
            await this.addMemberToGroup(groupId, member);

            return {
                memberAdded: true,
                settlementPerformed: settlementResult?.settled || false,
                settlementDetails: settlementResult,
                message: settlementResult?.settled 
                    ? 'Group settled and member added successfully' 
                    : 'Member added successfully'
            };

        } catch (error) {
            console.error("Error adding member with settlement:", error);
            throw error;
        }
    }

    /**
     * Remove member from group with automatic settlement if needed
     * @param {string} groupId - The ID of the group
     * @param {string} memberIdToRemove - The ID of the member to remove
     * @param {string} currentUserId - The ID of the user performing the removal
     * @param {boolean} autoSettle - Whether to automatically settle before removing (default: false)
     * @returns {Promise<Object>} - Result with settlement and removal info
     */
    static async removeMemberWithSettlement(groupId, memberIdToRemove, currentUserId, autoSettle = false) {
        try {
            let settlementResult = null;

            if (autoSettle) {
                // Automatically settle up first
                settlementResult = await this.settleUpGroupBeforeMemberChange(groupId);
            } else {
                // Just check if settlement is needed and throw error if so
                await this.removeMemberFromGroup(groupId, memberIdToRemove, currentUserId);
                return {
                    memberRemoved: true,
                    settlementPerformed: false,
                    message: 'Member removed successfully'
                };
            }

            // Now remove the member
            await this.removeMemberFromGroup(groupId, memberIdToRemove, currentUserId);

            return {
                memberRemoved: true,
                settlementPerformed: settlementResult?.settled || false,
                settlementDetails: settlementResult,
                message: settlementResult?.settled 
                    ? 'Group settled and member removed successfully' 
                    : 'Member removed successfully'
            };

        } catch (error) {
            console.error("Error removing member with settlement:", error);
            throw error;
        }
    }

    /**
     * A function for search for groups by name or letter to give the best match
     * @param {string} userId - The ID of the user whose groups to search
     * @param {string} searchTerm - The search term to match against group names
     * @return {Promise<Array>} - Array of matched groups
     */
    static async searchGroupsByName(userId, searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                // If no search term, return all user's groups
                return await this.getGroupsByUser(userId);
            }
            
            const groups = await this.getGroupsByUser(userId);
            return groups.filter(group => 
                group.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
            );
        } catch (error) {
            console.error("Error searching groups:", error);
            throw error;
        }
    }
}

export default Group;