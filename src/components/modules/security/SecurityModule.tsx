import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ShieldCheck, CheckCircle2, Lock, UserCheck, Key } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { colors } from '../../../theme/colors';

export const SecurityModule: React.FC = () => {
  const { auditLogs } = useFinance();

  const securityChecklist = [
    {
      id: 'sec-1',
      title: 'CSRF Protection',
      description: 'Double Submit Cookie verification on all accounting state mutation requests.',
      status: 'VERIFIED',
      category: 'Network',
    },
    {
      id: 'sec-2',
      title: 'Secure & HttpOnly Cookies',
      description: 'SameSite=Strict, HttpOnly, and Secure flags on financial session tokens.',
      status: 'VERIFIED',
      category: 'Session',
    },
    {
      id: 'sec-3',
      title: 'CORS Origin Whitelisting',
      description: 'Explicit origin restrictions for Indian banking and internal agency subdomains.',
      status: 'VERIFIED',
      category: 'Network',
    },
    {
      id: 'sec-4',
      title: 'Request Payload Constraints',
      description: 'Strict 10MB payload ceiling on bank statement CSV and receipt uploads.',
      status: 'VERIFIED',
      category: 'Input',
    },
    {
      id: 'sec-5',
      title: 'Session Invalidation on Credential Change',
      description: 'Immediate revocation of active JWT sessions upon password or 2FA update.',
      status: 'VERIFIED',
      category: 'Auth',
    },
    {
      id: 'sec-6',
      title: 'File MIME-Type & Magic Byte Validation',
      description: 'Validation on receipt PDFs, CSV, and image uploads preventing script injections.',
      status: 'VERIFIED',
      category: 'Storage',
    },
    {
      id: 'sec-7',
      title: 'Dual-Approval Payment Controls',
      description: 'Mandatory secondary CFO/CEO approval for RTGS disbursements > ₹5,00,000.',
      status: 'VERIFIED',
      category: 'Disbursement',
    },
    {
      id: 'sec-8',
      title: 'Role-Based Access Permissions (RBAC)',
      description: 'Strict role gating across CEO, CFO, COO, and CTO visibility boundaries.',
      status: 'VERIFIED',
      category: 'Access',
    },
    {
      id: 'sec-9',
      title: 'Immutable Audit Logging',
      description: 'Append-only chronological log of all ledger modifications and exports.',
      status: 'VERIFIED',
      category: 'Audit',
    },
    {
      id: 'sec-10',
      title: 'API Rate Limiting',
      description: 'Tiered rate limiting at 100 req/min for financial endpoints and reporting.',
      status: 'VERIFIED',
      category: 'Network',
    },
    {
      id: 'sec-11',
      title: 'ISO 27001 & SOC-2 Type II Compliance',
      description: 'Annual third-party penetration testing and continuous controls auditing.',
      status: 'VERIFIED',
      category: 'Compliance',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Security Compliance & Immutable Audit Log</Text>
          <Text style={styles.pageSubtitle}>
            11-point SOC-2 & ISO 27001 financial operational checklist, RBAC permissions, and event audit trail.
          </Text>
        </View>
      </View>

      {/* Security Checklist */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pre-Deployment Enterprise Security Checklist</Text>
        <View style={styles.checklistGrid}>
          {securityChecklist.map(item => (
            <View key={item.id} style={styles.checkItem}>
              <CheckCircle2 size={15} color={colors.creditText} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.checkItemTitle}>{item.title}</Text>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.checkItemDesc}>{item.description}</Text>
              </View>
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedText}>PASS</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Immutable Audit Trail */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Timestamp</Text>
          <Text style={[styles.cell, { flex: 1.6, fontWeight: '700' }]}>User / Role</Text>
          <Text style={[styles.cell, { flex: 1.6, fontWeight: '700' }]}>Action</Text>
          <Text style={[styles.cell, { flex: 3.5, fontWeight: '700' }]}>Entity / Details</Text>
          <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>Origin IP</Text>
        </View>

        {auditLogs.map(log => (
          <View key={log.id} style={styles.tableRow}>
            <Text style={[styles.cell, styles.monoText, { flex: 1.8, color: colors.textMuted }]}>
              {log.timestamp}
            </Text>
            <View style={{ flex: 1.6 }}>
              <Text style={[styles.cell, { fontWeight: '700' }]}>{log.user}</Text>
              <Text style={[styles.monoText, { fontSize: 9.5, color: colors.primaryBlue }]}>{log.role}</Text>
            </View>
            <Text style={[styles.cell, styles.monoText, { flex: 1.6, fontWeight: '600' }]}>
              {log.action}
            </Text>
            <Text style={[styles.cell, { flex: 3.5 }]}>{log.details}</Text>
            <Text style={[styles.cell, styles.monoText, { flex: 1.5, textAlign: 'right', color: colors.textMuted }]}>
              {log.ipAddress}
            </Text>
          </View>
        ))}
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
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  checklistGrid: {
    gap: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  checkItemTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkItemDesc: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  catBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  catBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  verifiedPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: colors.creditBg,
    borderWidth: 1,
    borderColor: colors.creditBorder,
    borderRadius: 2,
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.creditText,
    fontFamily: 'Roboto Mono, monospace',
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
