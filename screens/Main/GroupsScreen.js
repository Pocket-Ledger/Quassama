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
import { useTranslation } from 'react-i18next';
import Logger from 'utils/looger';
import Expense from 'models/expense/Expense';
import Favorites from 'models/group/favorites';

// A little card just for one invitation
const InvitationCard = ({ invitation, onAccept, onDecline }) => {
  const { t } = useTranslation();
  const [inviterName, setInviterName] = useState('…');

  useEffect(() => {
    let mounted = true;
    User.getUsernameById(invitation.user_id)
      .then((name) => {
        if (mounted) setInviterName(name);
      })
      .catch(() => {
        if (mounted) setInviterName(t('invitations.unknown'));
      });
    return () => {
      mounted = false;
    };
  }, [invitation.user_id, t]);

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
            {t('invitations.join', { groupName: invitation.group_name })}
          </Text>
          <Text className="text-sm text-gray-500">
            {t('invitations.invitedBy', { name: inviterName })}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity className="flex-1 rounded-lg bg-primary py-3" onPress={onAccept}>
          <Text className="text-center font-semibold text-white">{t('invitations.accept')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-lg border border-gray-300 py-3"
          onPress={onDecline}>
          <Text className="text-center font-semibold text-gray-900">
            {t('invitations.decline')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const GroupsScreen = () => {
  const auth = getAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(t('group.tabs.all'));
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [groupTotal, setGroupTotal] = useState(0);
  const [favoriteGroupIds, setFavoriteGroupIds] = useState([]);

  const user = auth.currentUser.uid;

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await Favorites.getFavoritesByUser(user);
        setFavoriteGroupIds(favorites.map((fav) => fav.groupId));
      } catch (e) {
        console.error('Error fetching favorites:', e);
      }
    };
    fetchFavorites();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      const fetchGroups = async () => {
        console.log('Fetching groups...');
        setIsLoadingGroups(true);
        try {
          const groupsData = await Group.getGroupsByUser(user);
          setGroups(groupsData);
          Logger.info('Fetched groups:', groupsData);
        } catch (error) {
          console.error('Error fetching groups:', error);
        } finally {
          setIsLoadingGroups(false);
        }
      };
      fetchGroups();
    }, [user])
  );

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

  const tabs = [
    t('group.tabs.all'),
    t('group.tabs.youOwed'),
    t('group.tabs.youOw'),
    t('group.tabs.settled'),
  ];

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handleGroupPress = (group) => {
    console.log('Navigate to group:', group.name);
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const handleStarPress = async (groupId) => {
    try {
      if (!favoriteGroupIds.includes(groupId)) {
        await Favorites.addFavorite(groupId, user);
        setFavoriteGroupIds((prev) => [...prev, groupId]);
      } else {
        await Favorites.removeFavorite(groupId, user);
        setFavoriteGroupIds((prev) => prev.filter((id) => id !== groupId));
      }
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  const userId = getAuth().currentUser.uid;

  /* const handleAcceptInvitation = async (invId, groupId) => {
    try {
      const username = await User.getUsernameById(userId);
      const memberObj = {
        id: userId,
        name: username,
        initial: username ? username[0].toUpperCase() : '',
        color: '#2979FF',
      };

      await Group.addMemberToGroup(groupId, memberObj);

      await Invitation.accept(invId);

      
    } catch (err) {
      console.error('Accept failed', err);
    }
  }; */
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

      // 2) add to group
      await Group.addMemberToGroup(groupId, memberObj);

      // 3) mark invitation accepted
      await Invitation.accept(invId);

      // 4) AUTO UPDATE UI - Remove invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invId));

      // 5) AUTO UPDATE UI - Refresh groups to show the new group
      const groupsData = await Group.getGroupsByUser(user);
      setGroups(groupsData);
    } catch (err) {
      console.error('Accept failed', err);
    }
  };

  /* const handleDeclineInvitation = async (invId) => {
    try {
      await Invitation.decline(invId);
    } catch (err) {
      console.error('Decline failed', err);
    }
  }; */
  const handleDeclineInvitation = async (invId) => {
    try {
      await Invitation.decline(invId);

      // AUTO UPDATE UI - Remove invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invId));
    } catch (err) {
      console.error('Decline failed', err);
    }
  };

  useEffect(() => {
    if (!isLoadingGroups && groups.length > 0) {
      const fetchAmounts = async () => {
        const updatedGroups = await Promise.all(
          groups.map(async (g) => {
            const total = await Expense.getTotalExpensesByGroup(g.id);
            return { ...g, amount: `${total} ${t('common.currency')}` };
          })
        );
        setGroups(updatedGroups);
      };
      fetchAmounts();
    }
    // eslint-disable-next-line
  }, [isLoadingGroups]);

  // Sort groups: favorites first, then others
  const favoriteGroups = groups.filter((g) => favoriteGroupIds.includes(g.id));
  const nonFavoriteGroups = groups.filter((g) => !favoriteGroupIds.includes(g.id));
  const sortedGroups = [...favoriteGroups, ...nonFavoriteGroups];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        {/* Header */}
        <Header title={t('group.title')} showIcon={true} route="AddNewGroup" />

        {/* Tabs */}
        {/* <View className="px-4 mb-6">
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
        </View> */}

        {/* Groups List with Invitation */}
        <ScrollView
          className="flex-1 "
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 5 }}>
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
              groups={sortedGroups.map((g) => ({
                id: g.id,
                name: g.name,
                members: g.members || [],
                additionalMembers: g.additionalMembers || 0,
                amount: g.amount || `0 ${t('common.currency')}`,
                lastExpense: g.lastExpense || t('group.noExpensesYet'),
                time: g.time || '',
                isStarred: favoriteGroupIds.includes(g.id),
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
              <Text className="mb-2 font-dmsans-bold text-[24px] ">{t('group.noGroupsYet')}</Text>
              <Text className="mb-6 text-center text-gray-500">{t('group.startByCreating')}</Text>
              <TouchableOpacity
                className="rounded-lg bg-primary px-6 py-3"
                onPress={() => navigation.navigate('AddNewGroup')}>
                <Text className="font-semibold text-white">{t('group.createFirstGroup')}</Text>
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
