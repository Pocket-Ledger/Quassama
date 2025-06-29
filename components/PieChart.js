import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export const PieChart = ({ data, size = 80 }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>No Data</Text>
      </View>
    );
  }

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate cumulative percentages and create segments
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const dashLength = (item.percentage / 100) * circumference;
    const dashOffset = -(cumulativePercentage / 100) * circumference;
    
    cumulativePercentage += item.percentage;
    
    return {
      ...item,
      dashArray: `${dashLength} ${circumference}`,
      dashOffset: dashOffset,
    };
  });

  // Find the largest segment for the center text
  const largestSegment = data.reduce((max, current) => 
    current.percentage > max.percentage ? current : max, data[0]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'relative' }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Render each segment */}
          {segments.map((segment, index) => (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="butt"
            />
          ))}
        </Svg>
        
        {/* Center text showing the largest percentage */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: largestSegment.color,
            textAlign: 'center'
          }}>
            {largestSegment.percentage}%
          </Text>
          <Text style={{
            fontSize: 8,
            color: '#666',
            textAlign: 'center',
            marginTop: 1,
            maxWidth: size * 0.6
          }} numberOfLines={1}>
            {largestSegment.category}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PieChart;
