import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { evaluateBeneficiaryProfile } from '../services/recommendationEngine';

const ProfileContext = createContext();

const PROFILE_STORAGE_KEY = 'sahayak_beneficiary_profile';

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved beneficiary profile', e);
    }
    return null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileEditStep, setProfileEditStep] = useState(1);
  const [selectedSchemeForCalc, setSelectedSchemeForCalc] = useState(null);

  // Compute recommendations dynamically when profile changes
  const recommendations = useMemo(() => {
    if (!profile) return null;
    try {
      return evaluateBeneficiaryProfile(profile);
    } catch (err) {
      console.error('Recommendation engine error:', err);
      return {
        isValid: false,
        error: 'An unexpected error occurred while generating recommendations. Please try editing your profile.',
        evaluations: [],
        disclaimer: 'These recommendations are preliminary guidance based on the information provided and configured scheme rules. Final eligibility, documentation, loan terms, and approval are determined by the authorized institution.',
      };
    }
  }, [profile]);

  const saveProfile = useCallback((newProfileData) => {
    const updated = {
      ...newProfileData,
      updatedAt: new Date().toISOString(),
      profileId: newProfileData.profileId || `BEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setProfileState(updated);

    if (updated.consentSaved) {
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist profile to localStorage', e);
      }
    } else {
      try {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      } catch {}
    }

    return updated;
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {}
  }, []);

  const openProfileModal = useCallback((step = 1) => {
    setProfileEditStep(step);
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: Boolean(profile && profile.personal?.firstName),
        recommendations,
        saveProfile,
        clearProfile,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        profileEditStep,
        setProfileEditStep,
        selectedSchemeForCalc,
        setSelectedSchemeForCalc,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
