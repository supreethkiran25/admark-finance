import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Polygon, Circle, Text as SvgText, G } from '../common/SvgWrapper';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

interface CashFlowPoint {
  date: string;
  outflow: number;
}

export const CashFlowChart: React.FC = () => {
  const { expenses } = useFinance();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dynamicData: CashFlowPoint[] = useMemo(() => {
    const points: CashFlowPoint[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

      const dayOutflow = expenses
        .filter(e => e.date === dateStr && e.status === 'Approved')
        .reduce((sum, e) => sum + e.amount, 0);

      points.push({
        date: label,
        outflow: dayOutflow,
      });
    }

    return points;
  }, [expenses]);

  const hasActivity = expenses.length > 0;

  const width = 620;
  const height = 160;
  const padding = { top: 15, right: 20, bottom: 25, left: 65 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const outflows = dynamicData.map(d => d.outflow);
  const maxOut = Math.max(10000, Math.max(...outflows) * 1.2);

  const getY = (val: number) => {
    const ratio = val / maxOut;
    return padding.top + chartH - ratio * chartH;
  };

  const getX = (index: number) => {
    return padding.left + (index / Math.max(1, dynamicData.length - 1)) * chartW;
  };

  const points = dynamicData.map((d, i) => `${getX(i)},${getY(d.outflow)}`).join(' ');
  const areaPoints = `${getX(0)},${padding.top + chartH} ${points} ${getX(dynamicData.length - 1)},${padding.top + chartH}`;

  const hoveredData = hoveredIdx !== null ? dynamicData[hoveredIdx] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Operating Spending (INR - ₹)</Text>
          <Text style={styles.subtitle}>7-Day Spend Trajectory</Text>
        </View>

        {hoveredData && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{hoveredData.date}: {formatCurrency(hoveredData.outflow)}</Text>
          </View>
        )}
      </View>

      {!hasActivity ? (
        <View style={styles.emptyChartState}>
          <Text style={styles.emptyChartTitle}>No Expense History Recorded</Text>
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <Svg width={width} height={height}>
            <Polygon points={areaPoints} fill="rgba(15, 23, 42, 0.04)" />
            <Polyline points={points} fill="none" stroke={colors.primaryNavy} strokeWidth="2" />
            {dynamicData.map((d, i) => (
              <G key={i}>
                <Circle cx={getX(i)} cy={getY(d.outflow)} r={hoveredIdx === i ? 4.5 : 2.5} fill={colors.primaryNavy} stroke="#fff" strokeWidth="1.5" />
                <SvgText x={getX(i)} y={height - 8} textAnchor="middle" fontSize="9.5" fill={colors.textMuted} fontFamily="Roboto Mono, monospace">
                  {d.date}
                </SvgText>
              </G>
            ))}
          </Svg>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
    color: colors.primaryNavy,
  },
  chartWrapper: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyChartState: {
    padding: 28,
    alignItems: 'center',
  },
  emptyChartTitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
