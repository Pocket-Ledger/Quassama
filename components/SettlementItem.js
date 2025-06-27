import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Avatar from './Avatar';
import { extractHourMinutePeriod } from 'utils/time';
import { useTranslation } from 'react-i18next';

const SettlementItem = ({ settlement, showBorder = false }) => {
  const { t } = useTranslation();

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + extractHourMinutePeriod(date);
  };

  return (
    <View className={`flex-row items-center p-4 ${showBorder ? 'border-b border-gray-100' : ''}`}>
      {/* From User Avatar */}
      <Avatar
        initial={settlement.fromName?.charAt(0) || 'U'}
        name={settlement.fromName || 'Unknown'}
        size="small"
      />

      {/* Arrow */}
      <View className="mx-3">
        <Feather name="arrow-right" size={16} color="#6B7280" />
      </View>

      {/* To User Avatar */}
      <Avatar
        initial={settlement.toName?.charAt(0) || 'U'}
        name={settlement.toName || 'Unknown'}
        size="small"
      />

      {/* Settlement Details */}
      <View className="ml-4 flex-1">
        <Text className="text-sm font-medium text-gray-900">
          {settlement.fromName} → {settlement.toName}
        </Text>
        <Text className="text-xs text-gray-500">
          {formatDate(settlement.settledAt)}
        </Text>
      </View>

      {/* Amount */}
      <View className="items-end">
        <Text className="text-base font-semibold text-green-600">
          {t('common.currency')} {settlement.amount}
        </Text>
        <Text className="text-xs text-gray-500">
          {t('settlements.settled')}
        </Text>
      </View>
    </View>
  );
};

export default SettlementItem;
