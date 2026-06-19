import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';
import api from '../../services/api';

/**
 * ResidentDashboardScreen - Mobile dashboard for residents
 * 
 * Ported from client/src/pages/resident/Dashboard.jsx:
 * - Green theme greeting header with user initials and date
 * - Household identification and ward display
 * - Reporting state card to submit garbage availability (Yes/No)
 * - Segregation options list (biodegradable, recyclable, hazardous, mixed)
 * - Quick stats widgets (household ID, points, residents count, ward)
 * - Eco tips and complete waste segregation lists
 */

const WASTE_TYPES = [
  {
    value: 'biodegradable',
    label: 'Biodegradable',
    icon: 'leaf',
    desc: 'Food waste, garden waste',
    activeColor: '#2d6a4f',
    bgColor: '#e8f5e9',
  },
  {
    value: 'recyclable',
    label: 'Recyclable',
    icon: 'recycle',
    desc: 'Paper, plastic, metal',
    activeColor: '#1d4ed8',
    bgColor: '#eff6ff',
  },
  {
    value: 'hazardous',
    label: 'Hazardous',
    icon: 'alert-circle',
    desc: 'Batteries, chemicals',
    activeColor: '#d62828',
    bgColor: '#ffebee',
  },
  {
    value: 'mixed',
    label: 'Mixed',
    icon: 'trash-can-outline',
    desc: 'Unsorted waste',
    activeColor: '#b45309',
    bgColor: '#fef3c7',
  },
];

export default function ResidentDashboardScreen() {
  const { user, household } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [todayReport, setTodayReport] = useState(null);
  const [reported, setReported] = useState(false);
  const [selectedType, setSelectedType] = useState('biodegradable');
  const [submitting, setSubmitting] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchToday();
    fetchPoints();
  }, []);

  const fetchToday = async () => {
    try {
      const res = await api.get('/garbage/today');
      setReported(res.data.reported);
      setTodayReport(res.data.report);
    } catch (err) {
      console.log('Error fetching today garbage report:', err);
    }
  };

  const fetchPoints = async () => {
    try {
      const res = await api.get('/garbage/incentives');
      setTotalPoints(res.data.totalPoints);
    } catch (err) {
      console.log('Error fetching points:', err);
    }
  };

  const submitReport = async (available) => {
    setSubmitting(true);
    try {
      await api.post('/garbage/report', { available, wasteType: selectedType });
      setReported(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchToday();
      if (available && selectedType !== 'mixed') {
        fetchPoints();
      }
    } catch (err) {
      console.log('Error submitting report:', err);
    }
    setSubmitting(false);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout title="EcoCircle">
      <View style={styles.container}>
        
        {/* Success Alert Toast */}
        {showSuccess ? (
          <View style={styles.successToast}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#ffffff" />
            <Text style={styles.successToastText}>Report submitted successfully!</Text>
          </View>
        ) : null}

        {/* Greeting Header */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          {household && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                <Text style={styles.boldBadgeText}>{household.id}</Text> · {household.ward}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <View style={[styles.statsIconBox, { backgroundColor: '#d8f3dc' }]}>
              <MaterialCommunityIcons name="home-outline" size={20} color="#2d6a4f" />
            </View>
            <Text style={styles.statsValueText}>{household?.id || '-'}</Text>
            <Text style={styles.statsLabelText}>Household ID</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={[styles.statsIconBox, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="star-outline" size={20} color="#b45309" />
            </View>
            <Text style={styles.statsValueText}>{totalPoints}</Text>
            <Text style={styles.statsLabelText}>Green Points</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={[styles.statsIconBox, { backgroundColor: '#eff6ff' }]}>
              <MaterialCommunityIcons name="account-group-outline" size={20} color="#1d4ed8" />
            </View>
            <Text style={styles.statsValueText}>{household?.num_residents || '-'}</Text>
            <Text style={styles.statsLabelText}>Residents</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={[styles.statsIconBox, { backgroundColor: '#e2f1ec' }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#52796f" />
            </View>
            <Text style={styles.statsValueText}>{household?.ward || '-'}</Text>
            <Text style={styles.statsLabelText}>Ward</Text>
          </View>
        </View>

        {/* Main Garbage Reporting Card */}
        <View style={styles.reportingContainerCard}>
          {reported ? (
            <View style={styles.reportedOverlayContainer}>
              <View style={[styles.reportedIconBg, { backgroundColor: todayReport?.available ? '#d8f3dc' : '#f5f5f4' }]}>
                <MaterialCommunityIcons
                  name={todayReport?.available ? 'check-circle' : 'close-circle'}
                  size={48}
                  color={todayReport?.available ? '#2d6a4f' : '#78716c'}
                />
              </View>
              <Text style={styles.reportedTitle}>
                {todayReport?.available ? 'Garbage Reported' : 'No Garbage Today'}
              </Text>
              <Text style={styles.reportedSubtitle}>
                {todayReport?.available
                  ? `Your ${todayReport.waste_type} waste will be collected tomorrow.`
                  : "You're all clear for today. Thank you!"}
              </Text>
              
              {todayReport?.available && (
                <View style={styles.reportedTypeBadge}>
                  <MaterialCommunityIcons name="recycle" size={14} color="#2d6a4f" />
                  <Text style={styles.reportedTypeBadgeText}>Type: {todayReport.waste_type}</Text>
                </View>
              )}

              <TouchableOpacity onPress={() => setReported(false)} style={styles.updateReportButton}>
                <Text style={styles.updateReportButtonText}>Update Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.reportFormContent}>
              <View style={styles.reportHeader}>
                <MaterialCommunityIcons name="trash-can-outline" size={32} color="#a8a29e" />
                <Text style={styles.reportTitle}>Do you have garbage for collection?</Text>
                <Text style={styles.reportSubtitle}>Report your waste availability for tomorrow's collection</Text>
              </View>

              {/* Selector Waste Type buttons */}
              <View style={styles.selectorSection}>
                <Text style={styles.selectorSectionLabel}>Select waste type:</Text>
                <View style={styles.selectorGrid}>
                  {WASTE_TYPES.map((wt) => {
                    const isSelected = selectedType === wt.value;
                    return (
                      <TouchableOpacity
                        key={wt.value}
                        onPress={() => setSelectedType(wt.value)}
                        style={[
                          styles.selectorCard,
                          isSelected && { borderColor: wt.activeColor, backgroundColor: wt.bgColor },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={wt.icon}
                          size={24}
                          color={isSelected ? wt.activeColor : '#64748b'}
                        />
                        <Text style={styles.selectorLabel}>{wt.label}</Text>
                        <Text style={styles.selectorDesc} numberOfLines={2}>{wt.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action Submit Buttons */}
              <View style={[styles.actionButtonsRow, isTablet && styles.rowLayout]}>
                <TouchableOpacity
                  onPress={() => submitReport(true)}
                  disabled={submitting}
                  style={[styles.reportBtnYes, styles.actionButtonFlex]}
                  accessibilityRole="button"
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <View style={styles.btnContent}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" />
                      <Text style={styles.btnTextYes}>YES — Have Garbage</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => submitReport(false)}
                  disabled={submitting}
                  style={[styles.reportBtnNo, styles.actionButtonFlex]}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color="#44403c" />
                  <Text style={styles.btnTextNo}>NO — Not Today</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>

        {/* Environmental Tips Section */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipCard}>
            <View style={[styles.tipIconBg, { backgroundColor: '#d8f3dc' }]}>
              <MaterialCommunityIcons name="leaf" size={20} color="#2d6a4f" />
            </View>
            <Text style={styles.tipTitle}>Composting Tip</Text>
            <Text style={styles.tipDesc}>Kitchen waste can be composted at home to create nutrient-rich soil for your garden.</Text>
            <Text style={[styles.tipFooter, { color: '#2d6a4f' }]}>Reduces landfill by 30%</Text>
          </View>

          <View style={styles.tipCard}>
            <View style={[styles.tipIconBg, { backgroundColor: '#eff6ff' }]}>
              <MaterialCommunityIcons name="recycle" size={20} color="#1d4ed8" />
            </View>
            <Text style={styles.tipTitle}>Reduce & Reuse</Text>
            <Text style={styles.tipDesc}>Before discarding, consider if items can be repaired, donated, or repurposed.</Text>
            <Text style={[styles.tipFooter, { color: '#1d4ed8' }]}>Save money & resources</Text>
          </View>

          <View style={styles.tipCard}>
            <View style={[styles.tipIconBg, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="star" size={20} color="#b45309" />
            </View>
            <Text style={styles.tipTitle}>Earn More Points</Text>
            <Text style={styles.tipDesc}>Segregate your waste properly to earn 5 bonus green points per report!</Text>
            <Text style={[styles.tipFooter, { color: '#b45309' }]}>+5 pts for segregated waste</Text>
          </View>
        </View>

        {/* Waste Segregation Guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <MaterialCommunityIcons name="recycle" size={20} color="#2d6a4f" />
            <Text style={styles.guideTitle}>Waste Segregation Guide</Text>
          </View>

          <View style={styles.guideGrid}>
            {/* Green Category */}
            <View style={[styles.guideBox, { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' }]}>
              <View style={styles.guideBoxHeader}>
                <MaterialCommunityIcons name="leaf" size={16} color="#2e7d32" />
                <Text style={[styles.guideBoxTitle, { color: '#2e7d32' }]}>Biodegradable</Text>
              </View>
              <Text style={[styles.guideListText, { color: '#2e7d32' }]}>
                • Food scraps & peels{'\n'}• Garden leaves{'\n'}• Paper napkins{'\n'}• Tea/Coffee grounds
              </Text>
            </View>

            {/* Blue Category */}
            <View style={[styles.guideBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <View style={styles.guideBoxHeader}>
                <MaterialCommunityIcons name="recycle" size={16} color="#1d4ed8" />
                <Text style={[styles.guideBoxTitle, { color: '#1d4ed8' }]}>Recyclable</Text>
              </View>
              <Text style={[styles.guideListText, { color: '#1d4ed8' }]}>
                • Plastic bottles & bags{'\n'}• Paper & cardboard{'\n'}• Glass jars{'\n'}• Metal cans
              </Text>
            </View>

            {/* Red Category */}
            <View style={[styles.guideBox, { backgroundColor: '#ffebee', borderColor: '#ffcdd2' }]}>
              <View style={styles.guideBoxHeader}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#c62828" />
                <Text style={[styles.guideBoxTitle, { color: '#c62828' }]}>Hazardous</Text>
              </View>
              <Text style={[styles.guideListText, { color: '#c62828' }]}>
                • Batteries & electronics{'\n'}• Paints & chemicals{'\n'}• Light bulbs{'\n'}• Medical waste
              </Text>
            </View>

            {/* Orange Category */}
            <View style={[styles.guideBox, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
              <View style={styles.guideBoxHeader}>
                <MaterialCommunityIcons name="trash-can" size={16} color="#b45309" />
                <Text style={[styles.guideBoxTitle, { color: '#b45309' }]}>Mixed / General</Text>
              </View>
              <Text style={[styles.guideListText, { color: '#b45309' }]}>
                • Diapers & pads{'\n'}• Broken ceramics{'\n'}• Styrofoam pieces{'\n'}• Composite packs
              </Text>
            </View>
          </View>
        </View>

      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  successToast: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 99,
    backgroundColor: '#2d6a4f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  successToastText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
  },
  dateText: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 4,
  },
  headerBadge: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  headerBadgeText: {
    color: '#78716c',
    fontSize: 13,
  },
  boldBadgeText: {
    fontWeight: '700',
    color: '#2d6a4f',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    width: '48%',
    flexGrow: 1,
  },
  statsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsValueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
  },
  statsLabelText: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 2,
  },
  reportingContainerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d8f3dc',
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reportedOverlayContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  reportedIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  reportedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 8,
  },
  reportedSubtitle: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 280,
    lineHeight: 20,
  },
  reportedTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d8f3dc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  reportedTypeBadgeText: {
    color: '#2d6a4f',
    fontSize: 13,
    fontWeight: '600',
  },
  updateReportButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  updateReportButtonText: {
    color: '#2d6a4f',
    fontWeight: '600',
    fontSize: 14,
  },
  reportFormContent: {
    width: '100%',
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
  },
  selectorSection: {
    marginBottom: 28,
  },
  selectorSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44403c',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectorCard: {
    width: '48%',
    flexGrow: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e7e5e4',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292524',
    marginTop: 8,
    marginBottom: 2,
  },
  selectorDesc: {
    fontSize: 11,
    color: '#78716c',
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
  },
  actionButtonsRow: {
    flexDirection: 'column',
    gap: 12,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  actionButtonFlex: {
    flex: 1,
  },
  reportBtnYes: {
    height: 52,
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnTextYes: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  reportBtnNo: {
    height: 52,
    backgroundColor: '#f5f5f4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnTextNo: {
    color: '#44403c',
    fontWeight: '700',
    fontSize: 16,
  },
  tipsContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 20,
  },
  tipIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 6,
  },
  tipDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#57534e',
    marginBottom: 12,
  },
  tipFooter: {
    fontSize: 12,
    fontWeight: '600',
  },
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 20,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
  },
  guideGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  guideBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  guideBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  guideBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  guideListText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
