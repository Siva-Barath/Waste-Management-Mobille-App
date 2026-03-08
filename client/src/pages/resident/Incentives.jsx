import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { Home, Clock, Award, Star, Sparkles, Gift, TrendingUp, Leaf, Truck, BarChart3, Bell } from 'lucide-react';

const navItems = [
  { to: '/resident', label: 'Home', icon: <Home className="w-4 h-4" />, end: true },
  { to: '/resident/collections', label: 'Collection', icon: <Truck className="w-4 h-4" /> },
  { to: '/resident/history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { to: '/resident/stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
  { to: '/resident/incentives', label: 'Rewards', icon: <Award className="w-4 h-4" /> },
  { to: '/resident/notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
];

const rewardTiers = [
  { name: 'Seed', min: 0, max: 50, color: 'green' },
  { name: 'Sprout', min: 50, max: 150, color: 'emerald' },
  { name: 'Tree', min: 150, max: 300, color: 'teal' },
  { name: 'Forest', min: 300, max: 500, color: 'green' },
  { name: 'Planet Saver', min: 500, max: Infinity, color: 'blue' },
];

export default function ResidentIncentives() {
  const [incentives, setIncentives] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/garbage/incentives').then(res => {
      setIncentives(res.data.incentives);
      setTotalPoints(res.data.totalPoints);
    }).finally(() => setLoading(false));
  }, []);

  const currentTier = rewardTiers.find(t => totalPoints >= t.min && totalPoints < t.max) || rewardTiers[rewardTiers.length - 1];
  const nextTier = rewardTiers[rewardTiers.indexOf(currentTier) + 1];
  const progress = nextTier ? ((totalPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <Layout navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Rewards & Incentives</h1>
          <p className="text-stone-500 mt-1">Earn points for responsible waste management</p>
        </div>

        {/* Points Card */}
        <div className="bg-[#2d6a4f] rounded-xl p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-[#d8f3dc] text-sm mb-1">Total Green Points</p>
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <span className="text-5xl font-extrabold">{totalPoints}</span>
              </div>
            </div>
            <div className="flex-1 hidden sm:block" />
            <div className="text-center bg-white/15 rounded-xl p-5">
              <Leaf className="w-10 h-10 mx-auto mb-2" />
              <p className="font-bold text-lg">{currentTier.name}</p>
              <p className="text-[#d8f3dc] text-xs">Current Tier</p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-[#d8f3dc] mb-2">
                <span>{currentTier.name}</span>
                <span>{nextTier.name}</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-center text-xs text-[#d8f3dc] mt-2">
                {nextTier.min - totalPoints} points to {nextTier.name}
              </p>
            </div>
          )}
        </div>

        {/* How to Earn */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-[#2d6a4f]" />
            </div>
            <h3 className="font-bold text-stone-900">+5 Points</h3>
            <p className="text-sm text-stone-500 mt-1">Proper waste segregation</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-teal-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-bold text-stone-900">+2 Points</h3>
            <p className="text-sm text-stone-500 mt-1">Timely garbage collection</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-amber-100 flex items-center justify-center">
              <Gift className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-stone-900">Redeem</h3>
            <p className="text-sm text-stone-500 mt-1">Convert to rewards & discounts</p>
          </div>
        </div>

        {/* Points History */}
        <div className="card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-stone-900">Points History</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : incentives.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <Star className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No points earned yet. Start reporting to earn!</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {incentives.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{item.reason}</p>
                      <p className="text-xs text-stone-500">{item.date}</p>
                    </div>
                  </div>
                  <span className="text-[#2d6a4f] font-bold text-lg">+{item.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
