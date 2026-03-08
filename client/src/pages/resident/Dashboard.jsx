import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../api';
import { Home, Clock, Award, Trash2, Recycle, Leaf, CheckCircle, XCircle, TreePine, Droplets, AlertTriangle, Sparkles, Truck, BarChart3, Bell } from 'lucide-react';

const navItems = [
  { to: '/resident', label: 'Home', icon: <Home className="w-4 h-4" />, end: true },
  { to: '/resident/collections', label: 'Collection', icon: <Truck className="w-4 h-4" /> },
  { to: '/resident/history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { to: '/resident/stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
  { to: '/resident/incentives', label: 'Rewards', icon: <Award className="w-4 h-4" /> },
  { to: '/resident/notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
];

const wasteTypes = [
  { value: 'biodegradable', label: 'Biodegradable', icon: <Leaf className="w-6 h-6" />, desc: 'Food waste, garden waste', activeCls: 'border-green-600 bg-green-50' },
  { value: 'recyclable', label: 'Recyclable', icon: <Recycle className="w-6 h-6" />, desc: 'Paper, plastic, metal', activeCls: 'border-blue-600 bg-blue-50' },
  { value: 'hazardous', label: 'Hazardous', icon: <AlertTriangle className="w-6 h-6" />, desc: 'Batteries, chemicals', activeCls: 'border-red-600 bg-red-50' },
  { value: 'mixed', label: 'Mixed', icon: <Trash2 className="w-6 h-6" />, desc: 'Unsorted waste', activeCls: 'border-amber-600 bg-amber-50' },
];

export default function ResidentDashboard() {
  const { user, household } = useAuth();
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
    } catch { /* ignore */ }
  };

  const fetchPoints = async () => {
    try {
      const res = await api.get('/garbage/incentives');
      setTotalPoints(res.data.totalPoints);
    } catch { /* ignore */ }
  };

  const submitReport = async (available) => {
    setSubmitting(true);
    try {
      await api.post('/garbage/report', { available, wasteType: selectedType });
      setReported(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchToday();
      if (available && selectedType !== 'mixed') fetchPoints();
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Layout navItems={navItems}>
      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#2d6a4f] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 fade-in">
          <CheckCircle className="w-5 h-5" />
          Report submitted successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{greeting}, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-stone-500 mt-1">
              {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {household && (
            <div className="card rounded-lg px-4 py-2 text-sm text-stone-600">
              <span className="font-semibold text-[#2d6a4f]">{household.id}</span> · {household.ward}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
                <Home className="w-5 h-5 text-[#2d6a4f]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-900">{household?.id || '-'}</p>
            <p className="text-xs text-stone-500">Household ID</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-900">{totalPoints}</p>
            <p className="text-xs text-stone-500">Green Points</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-900">{household?.num_residents || '-'}</p>
            <p className="text-xs text-stone-500">Residents</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <TreePine className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-900">{household?.ward || '-'}</p>
            <p className="text-xs text-stone-500">Ward</p>
          </div>
        </div>

        {/* Main Action — Garbage Reporting */}
        <div className="card rounded-xl p-6 sm:p-8 border-2 border-[#d8f3dc]">
          {reported ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#d8f3dc] flex items-center justify-center">
                {todayReport?.available ? (
                  <CheckCircle className="w-10 h-10 text-[#2d6a4f]" />
                ) : (
                  <XCircle className="w-10 h-10 text-stone-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">
                {todayReport?.available ? "Garbage Reported" : "No Garbage Today"}
              </h2>
              <p className="text-stone-500 mb-4">
                {todayReport?.available
                  ? `Your ${todayReport.waste_type} waste will be collected tomorrow.`
                  : "You're all clear for today. Thank you!"}
              </p>
              {todayReport?.available && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-sm font-medium">
                  <Recycle className="w-4 h-4" />
                  Type: {todayReport.waste_type}
                </div>
              )}
              <div className="mt-6">
                <button onClick={() => { setReported(false); }} className="text-sm text-[#2d6a4f] hover:text-[#1b4332] font-medium">
                  Update Report
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <Trash2 className="w-10 h-10 mx-auto mb-3 text-stone-400" />
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Do you have garbage for collection?</h2>
                <p className="text-stone-500">Report your waste availability for tomorrow&apos;s collection</p>
              </div>

              {/* Waste Type Selection */}
              <div className="mb-8">
                <p className="text-sm font-medium text-stone-700 mb-3 text-center">Select waste type:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {wasteTypes.map(wt => (
                    <button
                      key={wt.value}
                      onClick={() => setSelectedType(wt.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        selectedType === wt.value
                          ? wt.activeCls
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-center mb-2 text-stone-600">{wt.icon}</div>
                      <p className="text-sm font-semibold text-stone-800">{wt.label}</p>
                      <p className="text-xs text-stone-500 mt-1">{wt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <button
                  onClick={() => submitReport(true)}
                  disabled={submitting}
                  className="flex-1 py-4 px-6 bg-[#2d6a4f] text-white font-bold text-lg rounded-xl hover:bg-[#1b4332] transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {submitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      YES — Have Garbage
                    </>
                  )}
                </button>
                <button
                  onClick={() => submitReport(false)}
                  disabled={submitting}
                  className="flex-1 py-4 px-6 bg-stone-100 text-stone-700 font-bold text-lg rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  <XCircle className="w-6 h-6" />
                  NO — Not Today
                </button>
              </div>
            </>
          )}
        </div>

        {/* Environmental Tips */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card rounded-xl p-5 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <h3 className="font-bold text-stone-900">Composting Tip</h3>
            </div>
            <p className="text-sm text-stone-600">Kitchen waste can be composted at home to create nutrient-rich soil for your garden.</p>
            <div className="mt-3 text-xs text-[#2d6a4f] font-medium">Reduces landfill by 30%</div>
          </div>
          <div className="card rounded-xl p-5 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-stone-900">Reduce & Reuse</h3>
            </div>
            <p className="text-sm text-stone-600">Before discarding, consider if items can be repaired, donated, or repurposed.</p>
            <div className="mt-3 text-xs text-blue-600 font-medium">Save money & resources</div>
          </div>
          <div className="card rounded-xl p-5 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-stone-900">Earn More Points</h3>
            </div>
            <p className="text-sm text-stone-600">Segregate your waste properly to earn 5 bonus green points per report!</p>
            <div className="mt-3 text-xs text-amber-600 font-medium">+5 pts for segregated waste</div>
          </div>
        </div>

        {/* Waste Segregation Guide */}
        <div className="card rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-[#2d6a4f]" />
            Waste Segregation Guide
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-green-700" />
                <h3 className="font-bold text-green-800">Biodegradable</h3>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Food scraps & peels</li>
                <li>• Garden leaves & flowers</li>
                <li>• Paper napkins</li>
                <li>• Tea bags & coffee grounds</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Recycle className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-blue-800">Recyclable</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Plastic bottles & bags</li>
                <li>• Newspapers & cardboard</li>
                <li>• Glass jars & bottles</li>
                <li>• Metal cans & foil</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-red-800">Hazardous</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Batteries & electronics</li>
                <li>• Paint & chemicals</li>
                <li>• Light bulbs & tubes</li>
                <li>• Medical waste</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-amber-800">Mixed / General</h3>
              </div>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Diapers & sanitary items</li>
                <li>• Broken ceramics</li>
                <li>• Styrofoam pieces</li>
                <li>• Composite packaging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
