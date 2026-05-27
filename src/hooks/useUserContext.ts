import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { getConstitution } from '../services/constitution.service';
import { getLatestHealthData } from '../services/healthData.service';
import { getCurrentGoal } from '../services/userGoals.service';
import { useAuth } from '../contexts/AuthContext';
import type { ConstitutionCode, GoalCode } from '../types/meal.types';

export interface NutritionUserContextData {
  goalCode: GoalCode;
  tdee: number;
  weight: number;
  height: number;
  constitution: ConstitutionCode;
  bmi: number | null;
  warning: string | null;
}

interface UseUserContextResult {
  data: NutritionUserContextData | null;
  loading: boolean;
  error: string | null;
  emptyHealthData: boolean;
  reload: () => Promise<void>;
}

const getMetric = (metrics: Record<string, number | null>, key: string): number | null => {
  const value = metrics[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export const useUserContext = (): UseUserContextResult => {
  const { accessToken } = useAuth();
  const [data, setData] = useState<NutritionUserContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emptyHealthData, setEmptyHealthData] = useState(false);

  const loadUserContext = useCallback(async () => {
    if (!accessToken) {
      setData(null);
      setLoading(false);
      setEmptyHealthData(false);
      return;
    }

    setLoading(true);
    setError(null);
    setEmptyHealthData(false);

    try {
      const [latestHealthData, currentGoal, constitution] = await Promise.all([
        getLatestHealthData(accessToken),
        getCurrentGoal(),
        getConstitution(),
      ]);

      const tdee = getMetric(latestHealthData.baseMetrics, 'TDEE');
      const weight = getMetric(latestHealthData.baseMetrics, 'WEIGHT');
      const height = getMetric(latestHealthData.baseMetrics, 'HEIGHT');

      if (!tdee || !weight || !height) {
        setData(null);
        setEmptyHealthData(true);
        return;
      }

      if (!currentGoal) {
        setData(null);
        setError('Bạn cần thiết lập mục tiêu sức khỏe trước khi tạo thực đơn.');
        return;
      }

      setData({
        goalCode: currentGoal.goalCode as GoalCode,
        tdee,
        weight,
        height,
        constitution: constitution.constitution as ConstitutionCode,
        bmi: constitution.bmi,
        warning: constitution.warning,
      });
    } catch (loadError) {
      if (axios.isAxiosError(loadError) && loadError.response?.status === 404) {
        setData(null);
        setEmptyHealthData(true);
        return;
      }

      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu sức khỏe.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadUserContext();
  }, [loadUserContext]);

  return {
    data,
    loading,
    error,
    emptyHealthData,
    reload: loadUserContext,
  };
};

