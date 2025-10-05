import { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    guardianPhone: '',
    gender: 'male' as 'male' | 'female',
    year: 'ثالثة ثانوي',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        guardianPhone: user.guardianPhone,
        gender: user.gender,
        year: user.year,
      });
    }
  }, [user]);

  const validatePhone = (value: string, field: string) => {
    if (!value) return `${field} مطلوب`;
    if (!/^\d{11}$/.test(value)) return `${field} يجب أن يتكون من 11 رقم`;
    return '';
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'الاسم الكامل مطلوب';
    
    const phoneError = validatePhone(formData.phone, 'رقم التليفون');
    if (phoneError) newErrors.phone = phoneError;

    const guardianError = validatePhone(formData.guardianPhone, 'رقم تليفون ولي الأمر');
    if (guardianError) newErrors.guardianPhone = guardianError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = 'كلمة المرور القديمة مطلوبة';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfile() || !user) return;

    setSaving(true);
    
    try {
      // Update user profile
      const response = await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
        guardianPhone: formData.guardianPhone,
        gender: formData.gender,
        year: formData.year,
      });
      
      // Update auth context
      login(response.data.data.user);
      
      toast.success('تم حفظ التغييرات بنجاح');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ التغييرات';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;

    setSaving(true);
    
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updatePasswordField = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div>جاري التحميل...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>

        {/* Profile Settings */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">البيانات الشخصية</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                className={errors.name ? 'border-danger' : ''}
              />
              {errors.name && <p className="text-sm text-danger mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="phone">رقم التليفون</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={e => updateField('phone', e.target.value)}
                maxLength={11}
                className={errors.phone ? 'border-danger' : ''}
              />
              {errors.phone && <p className="text-sm text-danger mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="guardianPhone">رقم تليفون ولي الأمر</Label>
              <Input
                id="guardianPhone"
                type="tel"
                value={formData.guardianPhone}
                onChange={e => updateField('guardianPhone', e.target.value)}
                maxLength={11}
                className={errors.guardianPhone ? 'border-danger' : ''}
              />
              {errors.guardianPhone && <p className="text-sm text-danger mt-1">{errors.guardianPhone}</p>}
            </div>

            <div>
              <Label htmlFor="year">السنة الدراسية</Label>
              <Select value={formData.year} onValueChange={value => updateField('year', value)}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="أولى ثانوي">أولى ثانوي</SelectItem>
                  <SelectItem value="ثانية ثانوي">ثانية ثانوي</SelectItem>
                  <SelectItem value="ثالثة ثانوي">ثالثة ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الجنس</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={value => updateField('gender', value)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="male" id="male-settings" />
                  <Label htmlFor="male-settings" className="cursor-pointer">ذكر</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="female" id="female-settings" />
                  <Label htmlFor="female-settings" className="cursor-pointer">أنثى</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleProfileSave} disabled={saving} className="w-full md:w-auto">
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </section>

        {/* Password Change */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">تغيير كلمة المرور</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">كلمة المرور القديمة</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={e => updatePasswordField('oldPassword', e.target.value)}
                className={errors.oldPassword ? 'border-danger' : ''}
              />
              {errors.oldPassword && <p className="text-sm text-danger mt-1">{errors.oldPassword}</p>}
            </div>

            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={e => updatePasswordField('newPassword', e.target.value)}
                placeholder="8 أحرف على الأقل"
                className={errors.newPassword ? 'border-danger' : ''}
              />
              {errors.newPassword && <p className="text-sm text-danger mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={e => updatePasswordField('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'border-danger' : ''}
              />
              {errors.confirmPassword && <p className="text-sm text-danger mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button onClick={handlePasswordChange} disabled={saving} variant="outline" className="w-full md:w-auto">
              {saving ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}