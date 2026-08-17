import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { MetricCard } from '../../common/MetricCard';
import { formatCurrency, formatPercent } from '../../../utils/currency';
import { colors } from '../../../theme/colors';

export const AnalyticsModule: React.FC = () => {
  const { cashBalance, monthSpend, totalMonthlyRevenue, vendors } = useFinance();

  // Scenario Simulator
  const [simSpend, setSimSpend] = useState(monthSpend);
  const [simRevChange, setSimRevChange] = useState(0); // % change

  const simulatedRevenue = totalMonthlyRevenue * (1 + simRevChange / 100);
  const simulatedNetBurn = simSpend - simulatedRevenue;
  const simulatedRunway = simulatedNetBurn > 0 ? (cashBalance / simulatedNetBurn) : 999;

  // Vendor Concentration Risk
  const topVendors = [...vendors]
    .sort((a, b) => b.totalYtdSpend - a.totalYtdSpend)
    .slice(0, 5);
  const totalVendorYtd = vendors.reduce((sum, v) => sum + v.totalYtdSpend, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Financial Analytics & Scenario Runway Simulator (₹)</Text>
          <Text style={styles.pageSubtitle}>
            OpEx vs CapEx ratio, vendor concentration risk, and interactive scenario forecasting in Indian Rupees.
          </Text>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <MetricCard
          label="OpEx vs CapEx Ratio"
          value="97.6% / 2.4%"
          subValue="CapEx: ₹3.50 L hardware"
          badgeText="Asset Mix"
          badgeType="neutral"
        />
        <MetricCard
          label="Gross Operating Margin"
          value="+38.6%"
          subValue="Revenue vs Direct Delivery"
          badgeText="Healthy"
          badgeType="credit"
        />
        <MetricCard
          label="Average Daily Burn Rate"
          value={formatCurrency(monthSpend / 16)}
          subValue="Per Operating Day"
          badgeText="Daily Burn"
          badgeType="debit"
        />
        <MetricCard
          label="Runway Headroom"
          value={`${simulatedRunway > 50 ? '50+' : simulatedRunway.toFixed(1)} Months`}
          subValue={`Reserves: ${formatCurrency(cashBalance, { compact: true })}`}
          badgeText="Solvent"
          badgeType="credit"
        />
      </View>

      {/* Interactive Runway Scenario Simulator */}
      <View style={styles.simulatorCard}>
        <View style={styles.simHeader}>
          <Text style={styles.simTitle}>Interactive Scenario Modeling & Runway Forecaster</Text>
          <Text style={styles.simSubtitle}>Simulate spend contraction or client revenue shocks</Text>
        </View>

        <View style={styles.simRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.simLabel}>Simulated Monthly Spend (₹): {formatCurrency(simSpend)}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setSimSpend(Math.max(500000, simSpend - 200000))}>
                <Text style={styles.stepBtnText}>-₹2 Lakhs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setSimSpend(monthSpend)}>
                <Text style={styles.stepBtnText}>Reset Actual</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setSimSpend(simSpend + 200000)}>
                <Text style={styles.stepBtnText}>+₹2 Lakhs</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.simLabel}>Client Revenue Variance: {simRevChange >= 0 ? `+${simRevChange}%` : `${simRevChange}%`}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setSimRevChange(prev => Math.max(-50, prev - 10))}>
                <Text style={styles.stepBtnText}>-10% Shock</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setSimRevChange(0)}>
                <Text style={styles.stepBtnText}>Baseline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setSimRevChange(prev => Math.min(50, prev + 10))}>
                <Text style={styles.stepBtnText}>+10% Growth</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.simResultBox}>
          <Text style={styles.simResultText}>
            Projected Monthly Cash Flow:{' '}
            <Text style={{ fontWeight: '800', fontFamily: 'Roboto Mono, monospace', color: (simulatedRevenue - simSpend) >= 0 ? colors.creditText : colors.debitText }}>
              {formatCurrency(simulatedRevenue - simSpend, { showSign: true })}
            </Text>
            {' • '}
            Runway Under Scenario:{' '}
            <Text style={{ fontWeight: '800', fontFamily: 'Roboto Mono, monospace' }}>
              {simulatedRunway > 50 ? '50+ Months (Self-Sustaining)' : `${simulatedRunway.toFixed(1)} Months`}
            </Text>
          </Text>
        </View>
      </View>

      {/* Vendor Concentration Risk Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 3.5, fontWeight: '700' }]}>Top Supplier / Vendor</Text>
          <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>Category</Text>
          <Text style={[styles.cell, { flex: 2, textAlign: 'right', fontWeight: '700' }]}>YTD Spend (₹)</Text>
          <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>% Concentration</Text>
        </View>
        {topVendors.map(v => {
          const concPct = totalVendorYtd > 0 ? (v.totalYtdSpend / totalVendorYtd) * 100 : 0;
          return (
            <View key={v.id} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 3.5, fontWeight: '700' }]}>{v.name}</Text>
              <Text style={[styles.cell, { flex: 2, color: colors.textSecondary }]}>{v.category}</Text>
              <Text style={[styles.cell, styles.monoText, { flex: 2, textAlign: 'right', fontWeight: '700' }]}>
                {formatCurrency(v.totalYtdSpend)}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.5, textAlign: 'right' }]}>
                {concPct.toFixed(1)}%
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  titleRibbon: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  pageSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  simulatorCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 10,
  },
  simHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 6,
  },
  simTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  simSubtitle: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  simRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  simLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 2,
  },
  stepBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  simResultBox: {
    padding: 8,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  simResultText: {
    fontSize: 11.5,
    color: colors.textPrimary,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    backgroundColor: colors.bgSurface,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tableHeader: {
    backgroundColor: colors.bgSurfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  cell: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  monoText: {
    fontFamily: 'Roboto Mono, monospace',
    fontVariant: ['tabular-nums'],
  },
});
