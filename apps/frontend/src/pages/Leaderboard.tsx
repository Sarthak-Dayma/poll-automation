import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, TrendingUp, Clock, Target } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import GlassCard from '../components/GlassCard';

const Leaderboard = () => {
  const [viewMode, setViewMode] = useState<'global' | 'meeting'>('global');

  // Mock leaderboard data
  const globalLeaderboard = [
    {
      id: 1,
      name: 'Diana Prince',
      accuracy: 95.1,
      pollsAttempted: 127,
      avgTime: 1.8,
      points: 2847,
      streak: 23,
      rank: 1,
      change: 0
    },
    {
      id: 2,
      name: 'Alice Johnson',
      accuracy: 92.5,
      pollsAttempted: 134,
      avgTime: 2.1,
      points: 2634,
      streak: 18,
      rank: 2,
      change: 1
    },
    {
      id: 3,
      name: 'Bob Smith',
      accuracy: 89.7,
      pollsAttempted: 156,
      avgTime: 2.4,
      points: 2456,
      streak: 12,
      rank: 3,
      change: -1
    },
    {
      id: 4,
      name: 'Charlie Brown',
      accuracy: 87.3,
      pollsAttempted: 142,
      avgTime: 2.8,
      points: 2298,
      streak: 8,
      rank: 4,
      change: 2
    },
    {
      id: 5,
      name: 'Ethan Hunt',
      accuracy: 85.9,
      pollsAttempted: 119,
      avgTime: 2.6,
      points: 2187,
      streak: 15,
      rank: 5,
      change: -1
    }
  ];

  const meetingLeaderboard = [
    {
      id: 1,
      name: 'Alice Johnson',
      accuracy: 100,
      pollsAttempted: 8,
      avgTime: 1.9,
      points: 240,
      streak: 8,
      rank: 1,
      change: 0
    },
    {
      id: 2,
      name: 'Diana Prince',
      accuracy: 87.5,
      pollsAttempted: 8,
      avgTime: 1.6,
      points: 210,
      streak: 7,
      rank: 2,
      change: 1
    },
    {
      id: 3,
      name: 'Bob Smith',
      accuracy: 75,
      pollsAttempted: 8,
      avgTime: 2.8,
      points: 180,
      streak: 3,
      rank: 3,
      change: -1
    }
  ];

  const currentLeaderboard = viewMode === 'global' ? globalLeaderboard : meetingLeaderboard;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500 to-orange-500';
      case 2:
        return 'from-gray-400 to-gray-600';
      case 3:
        return 'from-orange-500 to-red-500';
      default:
        return 'from-primary-500 to-secondary-500';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (change < 0) {
      return <TrendingUp className="w-4 h-4 text-red-400 transform rotate-180" />;
    }
    return <div className="w-4 h-4" />;
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 overflow-x-hidden"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-gray-400">Top performing participants</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('global')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${viewMode === 'global'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Global
              </button>
              <button
                onClick={() => setViewMode('meeting')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${viewMode === 'meeting'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Current Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Top Performers</h3>
          <div className="flex flex-col md:flex-row items-end justify-center md:gap-12 gap-8">
            {/* Second Place */}
            {currentLeaderboard[1] && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center text-center order-1 md:order-2 w-full md:w-auto"
      >
        {/* ...existing code... */}
        <div className="relative mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold text-lg">
              {currentLeaderboard[1].name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="absolute -top-2 -right-2">
            <Medal className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-lg p-4 h-24 flex flex-col justify-end">
          <h4 className="font-bold text-white text-sm">{currentLeaderboard[1].name}</h4>
          <p className="text-gray-200 text-xs">{currentLeaderboard[1].accuracy}% accuracy</p>
          <p className="text-gray-200 text-xs">{currentLeaderboard[1].points} pts</p>
        </div>
      </motion.div>
    )}

            {/* First Place */}
            {currentLeaderboard[0] && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center text-center order-2 md:order-1 w-full md:w-auto"
      >
        {/* ...existing code... */}
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-glow">
            <span className="text-white font-bold text-xl">
              {currentLeaderboard[0].name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="absolute -top-3 -right-3">
            <Crown className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gradient-to-t from-orange-600 to-yellow-500 rounded-t-lg p-4 h-32 flex flex-col justify-end">
          <h4 className="font-bold text-white">{currentLeaderboard[0].name}</h4>
          <p className="text-yellow-100 text-sm">{currentLeaderboard[0].accuracy}% accuracy</p>
          <p className="text-yellow-100 text-sm">{currentLeaderboard[0].points} pts</p>
        </div>
      </motion.div>
    )}

            {/* Third Place */}
            {currentLeaderboard[2] && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center text-center order-3 md:order-3 w-full md:w-auto"
      >
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">
                      {currentLeaderboard[2].name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Award className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-t from-red-600 to-orange-500 rounded-t-lg p-4 h-20 flex flex-col justify-end">
                  <h4 className="font-bold text-white text-sm">{currentLeaderboard[2].name}</h4>
                  <p className="text-orange-100 text-xs">{currentLeaderboard[2].accuracy}% accuracy</p>
                  <p className="text-orange-100 text-xs">{currentLeaderboard[2].points} pts</p>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Full Leaderboard */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            {viewMode === 'global' ? 'Global Rankings' : 'Meeting Rankings'}
          </h3>
          <div className="space-y-4">
            {currentLeaderboard.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border ${participant.rank <= 3
                    ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20'
                    : 'bg-white/5 border-white/10'
                  } hover:border-white/20 transition-colors duration-200`}
              >
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(participant.rank)}
                    {getChangeIcon(participant.change)}
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${getRankColor(participant.rank)} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{participant.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{participant.accuracy}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{participant.avgTime}s</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-3 h-3" />
                        <span>{participant.streak} streak</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-4 md:mt-0">
                  <div className="text-center sm:text-right">
                    <p className="text-white font-bold">{participant.points}</p>
                    <p className="text-gray-400 text-sm">points</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-white font-medium">{participant.pollsAttempted}</p>
                    <p className="text-gray-400 text-sm">polls</p>
                  </div>
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${getRankColor(participant.rank)} rounded-full h-2`}
                      style={{ width: `${participant.accuracy}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Highest Accuracy</p>
                <p className="text-2xl font-bold text-white">
                  {Math.max(...currentLeaderboard.map(p => p.accuracy))}%
                </p>
                <p className="text-gray-400 text-sm">
                  {currentLeaderboard.find(p => p.accuracy === Math.max(...currentLeaderboard.map(p => p.accuracy)))?.name}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Fastest Response</p>
                <p className="text-2xl font-bold text-white">
                  {Math.min(...currentLeaderboard.map(p => p.avgTime))}s
                </p>
                <p className="text-gray-400 text-sm">
                  {currentLeaderboard.find(p => p.avgTime === Math.min(...currentLeaderboard.map(p => p.avgTime)))?.name}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Longest Streak</p>
                <p className="text-2xl font-bold text-white">
                  {Math.max(...currentLeaderboard.map(p => p.streak))}
                </p>
                <p className="text-gray-400 text-sm">
                  {currentLeaderboard.find(p => p.streak === Math.max(...currentLeaderboard.map(p => p.streak)))?.name}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Leaderboard;