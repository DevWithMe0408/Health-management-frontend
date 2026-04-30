import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getUserAccountDetails, updateUserAccountDetails } from '../services/user.service';
import type { UserAccountDetails, UpdateUserAccountDetailsPayload } from '../services/user.service';
import { useForm, Controller } from 'react-hook-form'; 
import type {SubmitHandler} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Import icons
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon, 
  IdentificationIcon, 
  ShieldCheckIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';
import InputField from '../components/common/InputField';

// Schema validation cho form chỉnh sửa - SỬA LẠI HOÀN TOÀN
const UpdateProfileSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  birthDate: z.date().nullable().optional(),
  gender: z.string(),
});

type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

const UserProfilePage: React.FC = () => {
  const { accessToken, user: authUser, login } = useAuth();
  const [profileData, setProfileData] = useState<UserAccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
    watch,
  } = useForm<UpdateProfileFormData>({
    defaultValues: {
      name: '',
      phoneNumber: '',
      birthDate: null,
      gender: '',
    },
    mode: 'onChange' // THÊM ĐỂ TRACK CHANGES NGAY LẬP TỨC
  });

  const watchedValues = watch();
  console.log('Form values:', watchedValues, 'isDirty:', isDirty, 'isEditing:', isEditing);

  const fetchProfile = async () => {
    if (!accessToken) {
      setLoadError("Không tìm thấy thông tin xác thực.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getUserAccountDetails(accessToken);
      setProfileData(data);

      if (!isEditing) {
        const formData = {
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          gender: data.gender || '',
        };
        reset(formData);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setLoadError(err.message || "Không thể tải thông tin tài khoản.");
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [accessToken]); // BỎ isEditing KHỎI DEPENDENCY

  const handleEditToggle = () => {
    if (isEditing && profileData) {
      const formData = {
        name: profileData.name || '',
        phoneNumber: profileData.phoneNumber || '',
        birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
        gender: profileData.gender || '',
      };
      reset(formData);
    }
    setIsEditing(!isEditing);
  };

  const onSubmit: SubmitHandler<UpdateProfileFormData> = async (formData) => {
    if (!accessToken) {
      toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    if (!isDirty) {
      toast.info("Không có thay đổi nào để lưu.");
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    const payload: UpdateUserAccountDetailsPayload = {};

    if (formData.name && formData.name.trim()) {
      payload.name = formData.name.trim();
    }

    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^(0|\+?84)?\d{9,10}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        toast.error("Số điện thoại không hợp lệ");
        setIsSaving(false);
        return;
      }
      payload.phoneNumber = formData.phoneNumber.trim();
    }

    if (formData.birthDate instanceof Date) {
      if (formData.birthDate > new Date()) {
        toast.error("Ngày sinh không thể là tương lai");
        setIsSaving(false);
        return;
      }
      payload.birthDate = formData.birthDate.toISOString().split('T')[0];
    }

    if (formData.gender && ["MALE", "FEMALE", "OTHER"].includes(formData.gender)) {
      payload.gender = formData.gender;
    }

    try {
      const updatedProfile = await updateUserAccountDetails(accessToken, payload);
      setProfileData(updatedProfile);
      toast.success("Cập nhật thông tin tài khoản thành công!");
      setIsEditing(false);
      reset({
        name: updatedProfile.name || '',
        phoneNumber: updatedProfile.phoneNumber || '',
        birthDate: updatedProfile.birthDate ? new Date(updatedProfile.birthDate) : null,
        gender: updatedProfile.gender || '',
      });
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  // ... existing loading states remain the same ...

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={fetchProfile}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const formatDate = (dateString: string | null | undefined): string | null => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatGender = (gender: string | null | undefined): string | null => {
    if (!gender) return null;
    switch (gender.toLowerCase()) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return gender;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 pb-1">
            Thông Tin Tài Khoản
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/20">
            {/* Header của thẻ */}
            <div className={`px-8 py-6 relative overflow-hidden ${isEditing ? 'bg-yellow-500' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700'}`}>
              <div className="relative z-10 flex flex-col md:flex-row items-center">
                <div className="relative mb-6 md:mb-0 md:mr-8">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    {isEditing ? "Chỉnh sửa thông tin" : (profileData.name || profileData.userName || 'Người dùng')}
                  </h2>
                  {!isEditing && <p className="text-green-100 mb-2">{profileData.email || 'Chưa có email'}</p>}
                </div>
              </div>
            </div>

            {/* Content của thẻ */}
            <div className="p-8">
              {/* FORM CHỈ HIỂN THỊ KHI ĐANG EDITING */}
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Thông tin cá nhân */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cá nhân</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Họ và tên
                          </label>
                          <input
                            id="name"
                            type="text"
                            {...register("name")}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3"
                            placeholder="Nhập họ và tên"
                          />
                        </div>

                        <div>
                          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày sinh
                          </label>
                          <Controller
                            name="birthDate"
                            control={control}
                            render={({ field }) => (
                              <input
                                id="birthDate"
                                type="date"
                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const dateValue = e.target.value ? new Date(e.target.value) : null;
                                  field.onChange(dateValue);
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3"
                              />
                            )}
                          />
                        </div>

                        <div>
                          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                            Giới tính
                          </label>
                          <select 
                            {...register("gender")} 
                            id="gender" 
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin liên hệ</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={profileData.email || ''}
                            disabled
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 py-2 px-3"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                        </div>

                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                          </label>
                          <input
                            id="phoneNumber"
                            type="tel"
                            {...register("phoneNumber")}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      disabled={isSaving}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                /* HIỂN THỊ THÔNG TIN KHI KHÔNG EDITING */
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Thông tin cá nhân */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cá nhân</h3>
                      <div className="space-y-4">
                        <InfoRow 
                          icon={<IdentificationIcon className="w-5 h-5 text-gray-500" />} 
                          label="Username" 
                          value={profileData.userName} 
                        />
                        <InfoRow 
                          icon={<UserIcon className="w-5 h-5 text-gray-500" />} 
                          label="Họ và tên" 
                          value={profileData.name} 
                        />
                        <InfoRow 
                          icon={<CalendarIcon className="w-5 h-5 text-gray-500" />} 
                          label="Ngày sinh" 
                          value={formatDate(profileData.birthDate)} 
                        />
                        <InfoRow 
                          icon={<UserIcon className="w-5 h-5 text-gray-500" />} 
                          label="Giới tính" 
                          value={formatGender(profileData.gender)} 
                        />
                      </div>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin liên hệ</h3>
                      <div className="space-y-4">
                        <InfoRow 
                          icon={<EnvelopeIcon className="w-5 h-5 text-gray-500" />} 
                          label="Email" 
                          value={profileData.email} 
                        />
                        <InfoRow 
                          icon={<PhoneIcon className="w-5 h-5 text-gray-500" />} 
                          label="Số điện thoại" 
                          value={profileData.phoneNumber} 
                        />
                        <InfoRow 
                          icon={<ShieldCheckIcon className="w-5 h-5 text-gray-500" />} 
                          label="ID người dùng" 
                          value={String(profileData.userId)} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút chỉnh sửa */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      <PencilIcon className="w-5 h-5 inline mr-2" />
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// InfoRow component
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <dt className="text-sm font-medium text-gray-600">{label}</dt>
          <dd className="text-base font-semibold text-gray-900 mt-1">
            {value || <span className="text-gray-400 italic">Chưa cập nhật</span>}
          </dd>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;