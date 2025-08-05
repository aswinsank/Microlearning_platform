import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface GameStats {
  points: number;
  level: number;
  badges: Badge[];
  completedLessons: string[];
  streak: number;
  rank: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface GameContextType {
  stats: GameStats;
  updateProgress: (lessonId: string, lessonType: string) => void;
  leaderboard: LeaderboardEntry[];
  refreshLeaderboard: () => void;
}

interface LeaderboardEntry {
  username: string;
  name: string;
  points: number;
  level: number;
  badges: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats>({
    points: 0,
    level: 1,
    badges: [],
    completedLessons: [],
    streak: 0,
    rank: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (user) {
      loadGameStats();
      refreshLeaderboard();
    }
  }, [user]);

  const loadGameStats = () => {
    const savedStats = localStorage.getItem(`gameStats_${user?.username}`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const saveGameStats = (newStats: GameStats) => {
    localStorage.setItem(`gameStats_${user?.username}`, JSON.stringify(newStats));
    setStats(newStats);
  };

  const updateProgress = (lessonId: string, lessonType: string) => {
    if (!user || stats.completedLessons.includes(lessonId)) return;

    const basePoints = lessonType === 'quiz' ? 50 : lessonType === 'video' ? 30 : 20;
    const newPoints = stats.points + basePoints;
    const newLevel = Math.floor(newPoints / 100) + 1;
    const newCompletedLessons = [...stats.completedLessons, lessonId];
    const newStreak = stats.streak + 1;

    const newBadges = [...stats.badges];
    
    // Award badges based on milestones
    if (newCompletedLessons.length === 1 && !stats.badges.find(b => b.id === 'first-lesson')) {
      newBadges.push({
        id: 'first-lesson',
        name: 'First Steps',
        description: 'Completed your first lesson',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
      });
    }
    
    if (newCompletedLessons.length === 10 && !stats.badges.find(b => b.id === 'dedicated-learner')) {
      newBadges.push({
        id: 'dedicated-learner',
        name: 'Dedicated Learner',
        description: 'Completed 10 lessons',
        icon: '📚',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (newStreak >= 5 && !stats.badges.find(b => b.id === 'streak-master')) {
      newBadges.push({
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Completed 5 lessons in a row',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
      });
    }

    const newStats: GameStats = {
      points: newPoints,
      level: newLevel,
      badges: newBadges,
      completedLessons: newCompletedLessons,
      streak: newStreak,
      rank: stats.rank,
    };

    saveGameStats(newStats);
  };

  const refreshLeaderboard = () => {
    // Simulate leaderboard data
    const mockLeaderboard: LeaderboardEntry[] = [
      { username: 'alice_learns', name: 'Alice Johnson', points: 1250, level: 13, badges: 8 },
      { username: 'bob_student', name: 'Bob Wilson', points: 980, level: 10, badges: 6 },
      { username: 'carol_study', name: 'Carol Brown', points: 820, level: 9, badges: 5 },
      { username: 'david_code', name: 'David Lee', points: 750, level: 8, badges: 4 },
      { username: 'eve_math', name: 'Eve Davis', points: 650, level: 7, badges: 3 },
    ];

    if (user && user.role === 'learner') {
      const userEntry = mockLeaderboard.find(entry => entry.username === user.username);
      if (!userEntry) {
        mockLeaderboard.push({
          username: user.username,
          name: user.name,
          points: stats.points,
          level: stats.level,
          badges: stats.badges.length,
        });
      }
    }

    mockLeaderboard.sort((a, b) => b.points - a.points);
    setLeaderboard(mockLeaderboard);
  };

  const value = {
    stats,
    updateProgress,
    leaderboard,
    refreshLeaderboard,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}