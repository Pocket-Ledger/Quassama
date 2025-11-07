import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Pressable, Modal, Touchable, TouchableOpacity, ActivityIndicator } from 'react-native'
import { ArrowUp, CircleX, DollarSign, TrendingUp, Wallet } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import StatExpense from '../models/expense/statExpense'

const ThisMonth = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [monthlyData, setMonthlyData] = useState({
    totalSpending: 0,
    monthlyChange: 0,
    largestExpense: 0,
    largestExpenseCategory: 'No expenses',
    totalIncome: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      const data = await StatExpense.getMonthlyStatistics();
      setMonthlyData(data);
    } catch (error) {
      console.error('Error loading monthly data:', error);
      // Keep default values if error occurs
    } finally {
      setLoading(false);
    }
  };

  const palette = {
    spending: '#2563eb', // blue-600
    changePos: '#059669', // emerald-600
    changeNeg: '#dc2626', // red-600
    largest: '#f59e0b', // amber-500
    income: '#0d9488'
  }

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const changeColor = monthlyData.monthlyChange < 0 ? '#10b981' : '#ef4444';
  const changeText = monthlyData.monthlyChange < 0 
    ? "You're spending less this month than last month!"
    : "You're spending more this month than last month!";

  const StatCard = ({ title, icon, value, subtitle, valueColor, gradient = ['#ffffff', '#f1f5f9'] }) => (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardOuter}>
      <View style={styles.cardInner}>
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{title}</Text>
          {icon}
        </View>
        <Text className="mt-1 font-bold" style={[styles.valueText, valueColor && { color: valueColor }]}> {value} </Text>
        {!!subtitle && (
          <Text numberOfLines={2} className="mt-2 text-[11px] leading-4 text-slate-400">{subtitle}</Text>
        )}
        <View style={styles.accentBar} />
      </View>
    </LinearGradient>
  );

  return (
    <>
      <Pressable className="flex-1 p-6 pt-12 rounded-lg border border-slate-200" style={styles.container} onPress={() => setModalVisible(true)}>
        <Text className="text-2xl font-extrabold tracking-tight text-slate-800 mb-5">
          This Month
        </Text>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-2 text-sm text-slate-500">Loading monthly data...</Text>
          </View>
        ) : (
          <View className="gap-5">
            <View className="flex-row gap-5">
              <StatCard
                title="Total Spending"
                icon={<Wallet size={18} color={palette.spending} />}
                value={`${monthlyData.totalSpending} dh`}
                gradient={[ '#dbeafe', '#eff6ff' ]}
              />
              <StatCard
                title="Monthly Change"
                icon={<TrendingUp size={18} color={monthlyData.monthlyChange < 0 ? palette.changePos : palette.changeNeg} />}
                value={`${Math.abs(monthlyData.monthlyChange)}%`}
                valueColor={changeColor}
                subtitle={changeText}
                gradient={monthlyData.monthlyChange < 0 ? ['#ecfdf5', '#f0fdfa'] : ['#fef2f2', '#fff1f2']}
              />
            </View>

            <View className="flex-row gap-5">
              <StatCard
                title="Largest Expense"
                icon={<ArrowUp size={18} color={palette.largest} />}
                value={`${monthlyData.largestExpense} dh`}
                subtitle={monthlyData.largestExpenseCategory}
                gradient={[ '#fff7ed', '#fef3c7' ]}
              />
              <StatCard
                title="Total Income"
                icon={<DollarSign size={18} color={palette.income} />}
                value={`${monthlyData.totalIncome} dh`}
                gradient={[ '#ccfbf1', '#ecfeff' ]}
              />
            </View>
          </View>
        )}
      </Pressable>
    </>
  )
}

export default ThisMonth

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)', // slate-200/70
    backgroundColor: '#fff',
  },
  cardOuter: {
    flex: 1,
    borderRadius: 28,
    padding: 1,
  },
  cardInner: {
    flex: 1,
    borderRadius: 26,
    padding: 18,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.6)',
    overflow: 'hidden'
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(148,163,184,0.15)'
  },
  valueText: {
    fontSize: 20,
    lineHeight: 24,
    color: '#0f172a'
  }
})