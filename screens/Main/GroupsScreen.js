import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from 'components/Header';
import GroupsList from 'components/GroupsList';
import Group from 'models/group/group';
import { getAuth } from 'firebase/auth';
import Invitation from 'models/invitation/invitation';
import User from 'models/auth/user';
import { Ionicons } from '@expo/vector-icons';

// A little card just for one invitation
const InvitationCard = ({ invitation, onAccept, onDecline }) => {
  const [inviterName, setInviterName] = useState('…');

  useEffect(() => {
    let mounted = true;
    User.getUsernameById(invitation.user_id)
      .then((name) => {
        if (mounted) setInviterName(name);
      })
      .catch(() => {
        if (mounted) setInviterName('Unknown');
      });
    return () => {
      mounted = false;
    };
  }, [invitation.user_id]);

  return (
    <View className="my-6 rounded-xl bg-blue-50 p-4">
      <View className="flex-row items-center">
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: '#E91E63' }}>
          <Text className="font-dmsans-bold text-lg text-white">
            {inviterName[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-dmsans-bold text-base text-black">
            Join &quot;{invitation.group_name}&quot;?
          </Text>
          {/* <-- here we use the looked-up name */}
          <Text className="text-sm text-gray-500">Invited By {inviterName}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity className="flex-1 rounded-lg bg-primary py-3" onPress={onAccept}>
          <Text className="text-center font-semibold text-white">Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-lg border border-gray-300 py-3"
          onPress={onDecline}>
          <Text className="text-center font-semibold text-gray-900">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const GroupsScreen = () => {
  const auth = getAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  const user = auth.currentUser.uid;

  /*  useEffect(() => {
    
    const fetchGroups = async () => {
      console.log('Fetching groups...');
      const groupsData = await Group.getGroupsByUser(user);
      setGroups(groupsData);
    };

    fetchGroups();
  }, []); */
  useFocusEffect(
    useCallback(() => {
      const fetchGroups = async () => {
        console.log('Fetching groups...');
        setIsLoadingGroups(true);
        try {
          const groupsData = await Group.getGroupsByUser(user);
          setGroups(groupsData);
        } catch (error) {
          console.error('Error fetching groups:', error);
        } finally {
          setIsLoadingGroups(false);
        }
      };
      fetchGroups();
    }, [user])
  );

  /* useFocusEffect(
    useCallback(() => {
      const fetchGroups = async () => {
        console.log('Fetching groups...');
        const groupsData = await Group.getGroupsByUser(user);
        setGroups(groupsData);
      };
      fetchGroups();
    }, [user])
  ); */

  console.log('Groups:', groups[0]);

  useFocusEffect(
    useCallback(() => {
      const fetchInvitations = async () => {
        console.log('Fetching invitations...');
        const invitationsData = await Invitation.getInvitationsByUser(user);
        setInvitations(invitationsData);
      };
      fetchInvitations();
    }, [user])
  );

  console.log('\n\n\n');
  console.log('Invitations:', invitations);

  const tabs = ['All', 'You Owed', 'You Ow', 'Settled'];

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handleGroupPress = (group) => {
    console.log('Navigate to group:', group.name);
    // navigation.navigate('GroupDetails', { groupId: group.id });
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const handleStarPress = (groupId) => {
    console.log('Toggle star for group:', groupId);
    // Update the groups data state here
  };

  const userId = getAuth().currentUser.uid;

  const handleAcceptInvitation = async (invId, groupId) => {
    try {
      // 1) build member object for the current user
      const username = await User.getUsernameById(userId);
      const memberObj = {
        id: userId,
        name: username,
        initial: username ? username[0].toUpperCase() : '',
        color: '#2979FF',
      };

      // add to group
      await Group.addMemberToGroup(groupId, memberObj);

      // 2) mark invitation accepted
      await Invitation.accept(invId);

      // 3) refresh both lists
      /*     refreshInvitations();
    refreshGroups(); */
    } catch (err) {
      console.error('Accept failed', err);
    }
  };

  const handleDeclineInvitation = async (invId) => {
    try {
      await Invitation.decline(invId);
      /*     refreshInvitations(); */
    } catch (err) {
      console.error('Decline failed', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        {/* Header */}
        <Header title="Groups" showIcon={true} route="AddNewGroup" />

        {/* Tabs */}
        <View className="mb-6 px-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                className={`mr-4 rounded-[3px] border border-gray-100 px-4 py-2 ${
                  activeTab === tab ? 'bg-primary' : 'bg-white'
                }`}
                onPress={() => handleTabPress(tab)}>
                <Text className={`text-sm ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Groups List with Invitation */}
        <ScrollView
          className="flex-1 "
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Groups List or Empty State */}
          {isLoadingGroups ? (
            // Loading skeleton
            <View className="px-4">
              {[1, 2, 3].map((item) => (
                <View key={item} className="mb-4 rounded-xl bg-gray-100 p-4">
                  <View className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                  <View className="h-3 w-1/2 rounded bg-gray-200" />
                </View>
              ))}
            </View>
          ) : groups.length > 0 ? (
            <GroupsList
              groups={groups.map((g) => ({
                id: g.id,
                name: g.name,
                members: g.members || [],
                additionalMembers: g.additionalMembers || 0,
                amount: g.amount || '0 MAD',
                lastExpense: g.lastExpense || 'No expenses yet',
                time: g.time || '',
                isStarred: g.isStarred || false,
              }))}
              onGroupPress={handleGroupPress}
              onStarPress={handleStarPress}
            />
          ) : (
            // Empty state
            <View className="items-center px-4 py-12">
              <View className="mb-4 items-center justify-center">
                <Ionicons name="people" size={70} color="#2979FF" />{' '}
              </View>
              <Text className="mb-2 font-dmsans-bold text-[24px] text-gray-900">No Groups Yet</Text>
              <Text className="mb-6 text-center text-gray-500">
                Start by creating a group for your trip, event, or shared expenses. It only takes a
                few seconds!
              </Text>
              <TouchableOpacity
                className="rounded-lg bg-primary px-6 py-3"
                onPress={() => navigation.navigate('AddNewGroup')}>
                <Text className="font-semibold text-white">Create Your First Group</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Invitation Card */}
          {invitations.map((inv) => (
            <InvitationCard
              key={inv.id}
              invitation={inv}
              onAccept={() => handleAcceptInvitation(inv.id, inv.group_id)}
              onDecline={() => handleDeclineInvitation(inv.id)}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default GroupsScreen;
