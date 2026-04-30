import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SubmitHealthDataSchema } from '../types/healthData.schemas';
import type { SubmitHealthDataFormData } from '../types/healthData.schemas';
import type { SubmitHealthApiRequest } from '../types/healthData.schemas';
import { submitHealthData, getLatestHealthData } from '../services/healthData.service';
import { useAuth } from '../contexts/AuthContext';
import InputField from '../components/common/InputField';

const spinnerClass = "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500";

const SubmitHealthDataPage: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingLatestData, setIsFetchingLatestData] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    reset, // Để reset form sau khi submit
    formState: { errors,isDirty },
  } = useForm<SubmitHealthDataFormData>({
    resolver: zodResolver(SubmitHealthDataSchema) as any, // Type assertion để bypass lỗi
    defaultValues: {
      height: null,
      weight: null,
      waist: null,
      hip: null,
      neck: null,
      bust: null,
      activityFactor: null,
      BMINew: null,
      BMRNew: null,
      TDEENew: null,
      PBFNew: null,
      WHRNew: null,
    },
  });
//Helper function để tạo form values đầy đủ
  const createEmptyFormValues = (): SubmitHealthDataFormData => ({
    height: null,
    weight: null,
    waist: null,
    hip: null,
    neck: null,
    bust: null,
    activityFactor: null,
    BMINew: null,
    BMRNew: null,
    TDEENew: null,
    PBFNew: null,
    WHRNew: null,
  });

  useEffect(() => {
    const fetchLatestData = async () => {
      if (user && accessToken) {
        setIsFetchingLatestData(true);
        try {
          const latestData = await getLatestHealthData(accessToken);
          const formValues: SubmitHealthDataFormData = createEmptyFormValues();
          if (latestData.baseMetrics) {
            formValues.height = latestData.baseMetrics["HEIGHT"] ?? undefined;
            formValues.weight = latestData.baseMetrics["WEIGHT"] ?? undefined;
            formValues.waist = latestData.baseMetrics["WAIST"] ?? undefined;
            formValues.hip = latestData.baseMetrics["HIP"] ?? undefined;
            formValues.neck = latestData.baseMetrics["NECK"] ?? undefined;
            formValues.bust = latestData.baseMetrics["BUST"] ?? undefined;
            formValues.activityFactor = latestData.baseMetrics["ACTIVITY_FACTOR"] ?? undefined;
          }
          reset(formValues);
        } catch (error: any) {
          console.error("Error fetching latest health data:", error);
          toast.error(`Không thể tải dữ liệu gần nhất: ${error.message}`);
          reset(createEmptyFormValues());
        } finally {
          setIsFetchingLatestData(false);
        }
      } else {
        setIsFetchingLatestData(false); // Nếu không có user/token, không fetch
         reset(createEmptyFormValues()); // Reset form rỗng
      }
    };

    fetchLatestData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken, reset]); // Thêm reset vào dependency array

const onSubmit: SubmitHandler<SubmitHealthDataFormData> = async (formData) => {
  if (!user || !accessToken) {
    toast.error('Bạn cần đăng nhập để thực hiện hành động này.');
    return;
  }

  const hasValidData = Object.values(formData).some(val => val != null && val !== 0);
  if (!isDirty && !hasValidData) {
    toast.info('Không có dữ liệu mới nào được nhập để gửi.');
    return;
  }

  setIsLoading(true);

  try {
    const cleanedData: Partial<SubmitHealthDataFormData> = {};
    for (const key in formData) {
      const value = formData[key as keyof SubmitHealthDataFormData];
      if (value != null) {
        cleanedData[key as keyof SubmitHealthDataFormData] = value;
      }
    }

    const apiRequestData: SubmitHealthApiRequest = {
      ...(cleanedData as SubmitHealthDataFormData),
      userId: user.userId!,
    };

    const response = await submitHealthData(apiRequestData, accessToken);
    toast.success(response.message || 'Dữ liệu đã được gửi thành công!');

    setIsFetchingLatestData(true);
    try {
      const latestData = await getLatestHealthData(accessToken);
      const formValues: SubmitHealthDataFormData = createEmptyFormValues();
      if (latestData.baseMetrics) {
        formValues.height = latestData.baseMetrics["HEIGHT"] ?? null;
        formValues.weight = latestData.baseMetrics["WEIGHT"] ?? null;
        formValues.waist = latestData.baseMetrics["WAIST"] ?? null;
        formValues.hip = latestData.baseMetrics["HIP"] ?? null;
        formValues.neck = latestData.baseMetrics["NECK"] ?? null;
        formValues.bust = latestData.baseMetrics["BUST"] ?? null;
        formValues.activityFactor = latestData.baseMetrics["ACTIVITY_FACTOR"] ?? null;
      }
      reset(formValues);
    } catch (err) {
      console.error("Failed to refresh form with latest data after submit:", err);
      reset(createEmptyFormValues());
    } finally {
      setIsFetchingLatestData(false);
    }
  } catch (error: any) {
    toast.error(error.message || 'Gửi dữ liệu thất bại.');
  } finally {
    setIsLoading(false);
  }
};

  if (isFetchingLatestData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={spinnerClass}></div>
        <p className="ml-4 text-lg text-gray-600">Đang tải dữ liệu gần nhất...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Nhập/Cập nhật Chỉ Số Sức Khỏe</h2>
      {/* ... (phần hiển thị serverMessage và form JSX như trước, sử dụng Tailwind classes) ... */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ... (phần form fields với Tailwind) ... */}
        <p className="text-sm italic text-gray-500">
            Lưu ý: Chỉ nhập những chỉ số bạn muốn cập nhật. Các giá trị từ lần đo gần nhất đã được điền sẵn (nếu có). Để trống nếu không có thay đổi.
        </p>
       <div className="grid md:grid-cols-2 gap-6">
          <fieldset className="border border-gray-300 p-4 rounded-md">
            <legend className="text-lg font-semibold text-gray-700 px-2">
              Chỉ số cơ bản
            </legend>
            <div className="space-y-4 mt-2">
              <InputField 
                label="Chiều cao (cm)" 
                type="number" 
                step="0.1" 
                {...register("height")} 
                error={errors.height?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="Cân nặng (kg)" 
                type="number" 
                step="0.1" 
                {...register("weight")} 
                error={errors.weight?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="Vòng eo (cm)" 
                type="number" 
                step="0.1" 
                {...register("waist")} 
                error={errors.waist?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="Vòng hông (cm)" 
                type="number" 
                step="0.1" 
                {...register("hip")} 
                error={errors.hip?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="Vòng cổ (cm)" 
                type="number" 
                step="0.1" 
                {...register("neck")} 
                error={errors.neck?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="Vòng ngực (cm)" 
                type="number" 
                step="0.1" 
                {...register("bust")} 
                error={errors.bust?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="Hệ số vận động (1.2 - 1.9)" 
                type="number" 
                step="0.001" 
                {...register("activityFactor")} 
                error={errors.activityFactor?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </fieldset>
          
          <fieldset className="border border-gray-300 p-4 rounded-md">
            <legend className="text-lg font-semibold text-gray-700 px-2">
              Chỉ số tự đo (Nếu có)
            </legend>
            <div className="space-y-4 mt-2">
              <InputField 
                label="BMI (tự đo)" 
                type="number" 
                step="0.1" 
                {...register("BMINew")} 
                error={errors.BMINew?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="BMR (tự đo)" 
                type="number" 
                step="0.1" 
                {...register("BMRNew")} 
                error={errors.BMRNew?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="TDEE (tự đo)" 
                type="number" 
                step="0.1" 
                {...register("TDEENew")} 
                error={errors.TDEENew?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="PBF (tự đo)" 
                type="number" 
                step="0.1" 
                {...register("PBFNew")} 
                error={errors.PBFNew?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <InputField 
                label="WHR (tự đo)" 
                type="number" 
                step="0.001" 
                {...register("WHRNew")} 
                error={errors.WHRNew?.message} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </fieldset>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || isFetchingLatestData} 
          className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Đang gửi...' : (isFetchingLatestData ? 'Đang tải dữ liệu...' : 'Gửi Dữ Liệu')}
        </button>
      </form>
    </div>
  );
};

export default SubmitHealthDataPage;