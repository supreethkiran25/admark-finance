import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Polygon, Circle, Text as SvgText, G } from '../common/SvgWrapper';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

interface CashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

const CASH_FLOW_DATA: CashFlowPoint[] = [
  { date: '01 Aug', inflow: 2450000, outflow: 92000, balance: 14882020 },
  { date: '03 Aug', inflow: 0, outflow: 8400, balance: 14873620 },
  { date: '05 Aug', inflow: 0, outflow: 21500, balance: 14852120 },
  { date: '07 Aug', inflow: 0, outflow: 65000, balance: 14787120 },
  { date: '08 Aug', inflow: 0, outflow: 8500, balance: 14778620 },
  { date: '09 Aug', inflow: 0, outflow: 24105, balance: 14754515 },
  { date: '10 Aug', inflow: 0, outflow: 45000, balance: 14709515 },
  { date: '11 Aug', inflow: 0, outflow: 92000, balance: 14617515 },
  { date: '12 Aug', inflow: 0, outflow: 378350, balance: 14239165 },
  { date: '13 Aug', inflow: 0, outflow: 18000, balance: 14221165 },
  { date: '14 Aug', inflow: 1100000, outflow: 32000, balance: 15289165 },
  { date: '15 Aug', inflow: 0, outflow: 1268000, balance: 14021165 },
  { date: '16 Aug', inflow: 0, outflow: 170270, balance: 14285500 },
];

export const CashFlowChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 620;
  const height = 160;
  const padding = { top: 15, right: 20, bottom: 25, left: 65 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minBal = 13500000; // ₹1.35 Cr
  const maxBal = 16000000; // ₹1.60 Cr

  const getY = (val: number) => {
    const ratio = (val - minBal) / (maxBal - minBal);
    return padding.top + chartH - ratio * chartH;
  };

  const getX = (index: number) => {
    return padding.left + (index / (CASH_FLOW_DATA.length - 1)) * chartW;
  };

  const points = CASH_FLOW_DATA.map((d, i) => `${getX(i)},${getY(d.balance)}`).join(' ');

  const hoveredData = hoveredIdx !== null ? CASH_FLOW_DATA[hoveredIdx] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Operating Cash Trajectory (INR - ₹)</Text>
          <Text style={styles.subtitle}>HDFC & ICICI Current Account Treasury Reserves (01 - 16 Aug 2026)</Text>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.primaryNavy }]} />
            <Text style={styles.legendText}>Operating Balance</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.creditText }]} />
            <Text style={styles.legendText}>Client Inflow</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.debitText }]} />
            <Text style={styles.legendText}>Payroll & OpEx</Text>
          </View>
        </View>
      </View>

      <View style={{ width: '100%', height: 160, overflow: 'hidden' }}>
        <Svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          {/* Y Axis Grid Lines in ₹ Crores */}
          {[14000000, 14500000, 15000000, 15500000, 16000000].map(val => {
            const y = getY(val);
            return (
              <G key={val}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={colors.borderSubtle}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <SvgText
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill={colors.textMuted}
                  fontFamily="Roboto Mono, monospace"
                >
                  ₹{(val / 10000000).toFixed(2)} Cr
                </SvgText>
              </G>
            );
          })}

          {/* Area Fill */}
          <Polygon
            points={`${getX(0)},${padding.top + chartH} ${points} ${getX(CASH_FLOW_DATA.length - 1)},${padding.top + chartH}`}
            fill="rgba(15, 23, 42, 0.04)"
          />

          {/* Trajectory Polyline */}
          <Polyline
            fill="none"
            stroke={colors.primaryNavy}
            strokeWidth="1.75"
            points={points}
          />

          {/* Data Points */}
          {CASH_FLOW_DATA.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.balance);
            const isHovered = hoveredIdx === i;

            return (
              <G key={i}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 4 : 2.5}
                  fill={isHovered ? colors.primaryBlue : colors.primaryNavy}
                  stroke="#fff"
                  strokeWidth="1.5"
                  onPress={() => setHoveredIdx(i)}
                />
                {(i % 2 === 0 || i === CASH_FLOW_DATA.length - 1) && (
                  <SvgText
                    x={cx}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill={colors.textMuted}
                    fontFamily="Roboto Mono, monospace"
                  >
                    {d.date}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>

      {hoveredData && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            Date: <Text style={{ fontWeight: '700' }}>{hoveredData.date}</Text> • Balance:{' '}
            <Text style={{ fontWeight: '700', fontFamily: 'Roboto Mono, monospace' }}>
              {formatCurrency(hoveredData.balance)}
            </Text>
            {hoveredData.inflow > 0 && ` • In: +${formatCurrency(hoveredData.inflow)}`}
            {hoveredData.outflow > 0 && ` • Out: -${formatCurrency(hoveredData.outflow)}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 4,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 7,
    height: 7,
  },
  legendText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  tooltip: {
    marginTop: 6,
    padding: 6,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  tooltipText: {
    fontSize: 11,
    color: colors.textPrimary,
  },
});
