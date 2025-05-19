import { useState, useCallback, useMemo } from 'react';
import { Player } from '../types/player';

export type ViewMode = 'tabs' | 'expanded' | 'split' | 'dashboard';
export type TabType = 'übersicht' | 'fähigkeiten' | 'statistiken' | 'notizen';

const DEFAULT_VIEW_MODE: ViewMode = 'tabs';
const DEFAULT_TAB: TabType = 'übersicht';

export function usePlayerCard(player: Player) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const savedMode = localStorage.getItem(`player-${player.id}-view-mode`);
      return (savedMode as ViewMode) || DEFAULT_VIEW_MODE;
    } catch {
      return DEFAULT_VIEW_MODE;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const savedTab = localStorage.getItem(`player-${player.id}-active-tab`);
      return (savedTab as TabType) || DEFAULT_TAB;
    } catch {
      return DEFAULT_TAB;
    }
  });

  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  const averageRating = useMemo(() => {
    if (!player.skills.length) return 0;
    
    const totalWeight = player.skills.reduce((sum, skill) => sum + (skill.weight || 1), 0);
    const weightedSum = player.skills.reduce((sum, skill) => 
      sum + (skill.value * (skill.weight || 1)), 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }, [player.skills]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setAnnouncement(`Ansicht geändert zu ${mode}`);
    try {
      localStorage.setItem(`player-${player.id}-view-mode`, mode);
    } catch {
      // Ignore storage errors
    }
  }, [player.id]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setAnnouncement(`Tab gewechselt zu ${tab}`);
    try {
      localStorage.setItem(`player-${player.id}-active-tab`, tab);
    } catch {
      // Ignore storage errors
    }
  }, [player.id]);

  const toggleSkillsModal = useCallback(() => {
    setShowSkillsModal(prev => {
      const newState = !prev;
      setAnnouncement(newState ? 'Fähigkeiten-Dialog geöffnet' : 'Fähigkeiten-Dialog geschlossen');
      return newState;
    });
  }, []);

  return {
    viewMode,
    activeTab,
    showSkillsModal,
    averageRating,
    announcement,
    handleViewModeChange,
    handleTabChange,
    toggleSkillsModal
  };
}