import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const DEFAULT_COLORS = ['#2d6a4f', '#52796f', '#d4a373', '#b56576', '#6366f1', '#457b9d'];

export default function PieChartComponent({ data, colors = DEFAULT_COLORS, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const chartData = data.map((item, i) => ({
    name: (item.name || item.waste_type || `Item ${i + 1}`).slice(0, 12),
    population: Math.max(0, item.value ?? item.count ?? 0),
    color: colors[i % colors.length],
    legendFontColor: '#57534e',
    legendFontSize: 12,
  }));

  const hasData = chartData.some((d) => d.population > 0);
  if (!hasData) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  return (
    <PieChart
      data={chartData}
      width={screenWidth - 64}
      height={height}
      chartConfig={{
        color: () => '#2d6a4f',
      }}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="12"
      absolute
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#a8a29e',
    fontSize: 14,
  },
});
