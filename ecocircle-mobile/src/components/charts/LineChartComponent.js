import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function LineChartComponent({ data, labels, height = 200, color = '#2d6a4f' }) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const chartData = {
    labels: labels || data.map((_, i) => `${i + 1}`),
    datasets: [{ data: data.map((d) => d.value ?? d.count ?? 0), color: () => color }],
  };

  return (
    <LineChart
      data={chartData}
      width={screenWidth - 64}
      height={height}
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
        labelColor: () => '#a8a29e',
        propsForBackgroundLines: { strokeDasharray: '3 3', stroke: '#e7e5e4' },
      }}
      bezier
      style={styles.chart}
    />
  );
}

const styles = StyleSheet.create({
  chart: {
    borderRadius: 8,
    marginLeft: -8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#a8a29e',
    fontSize: 14,
  },
});
