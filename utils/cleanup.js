/**
 * One-time cleanup script to fix duplicate members in existing groups
 * Run this once to clean up your existing data
 */

import Group from '../models/group/group.js';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';

export const cleanupAllGroups = async () => {
    try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('No authenticated user found');
            return;
        }
        
        console.log('Starting cleanup of ALL groups in database...');
        
        // Get all groups from the database
        const groupsCollection = collection(db, "groups");
        const querySnapshot = await getDocs(groupsCollection);
        
        const allGroups = [];
        querySnapshot.forEach((doc) => {
            allGroups.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Found ${allGroups.length} groups to clean up`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Clean up each group
        for (const group of allGroups) {
            try {
                await Group.cleanupGroupMembers(group.id);
                console.log(`✅ Cleaned up group: ${group.name || 'Unnamed Group'} (ID: ${group.id})`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error cleaning up group ${group.name || 'Unnamed Group'} (ID: ${group.id}):`, error);
                errorCount++;
            }
        }
        
        console.log(`✅ Cleanup completed! Success: ${successCount}, Errors: ${errorCount}`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
};

export const cleanupAllUserGroups = async () => {
    try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('No authenticated user found');
            return;
        }
        
        console.log('Starting cleanup of user groups...');
        
        // Get all groups for the current user
        const groups = await Group.getGroupsByUser(currentUser.uid);
        
        console.log(`Found ${groups.length} groups to clean up`);
        
        // Clean up each group
        for (const group of groups) {
            try {
                await Group.cleanupGroupMembers(group.id);
                console.log(`✅ Cleaned up group: ${group.name}`);
            } catch (error) {
                console.error(`❌ Error cleaning up group ${group.name}:`, error);
            }
        }
        
        console.log('✅ Cleanup completed!');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
};

// You can call this function from your app to clean up existing data
// Example usage in a component:
// import { cleanupAllGroups, cleanupAllUserGroups } from './utils/cleanup';
// 
// const handleCleanupAll = async () => {
//     await cleanupAllGroups(); // Cleans ALL groups in database
//     // Refresh your data after cleanup
// };
//
// const handleCleanupUser = async () => {
//     await cleanupAllUserGroups(); // Cleans only current user's groups
//     // Refresh your data after cleanup
// };
