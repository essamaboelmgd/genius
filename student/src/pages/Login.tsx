import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { login, setAuthToken, setAuthUser } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validatePhone = (value: string) => {
    if (!value) return 'رقم الموبايل مطلوب';
    if (!/^\d{11}$/.test(value)) return 'رقم الموبايل يجب أن يتكون من 11 رقم';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneError = validatePhone(phone);
    if (phoneError || !password) {
      setErrors({
        phone: phoneError,
        password: !password ? 'كلمة المرور مطلوبة' : '',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await login({ phone, password });
      
      // Store token and user data in localStorage
      setAuthToken(result.token);
      setAuthUser(result.data.user);
      
      // Update AuthContext with user data
      authLogin(result.data.user);
      
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">genius</h1>
          <p className="text-sm text-muted-foreground">منصة تعليمية</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">تسجيل دخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">رقم الموبايل</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  setErrors(prev => ({ ...prev, phone: '' }));
                }}
                maxLength={11}
                className={errors.phone ? 'border-danger' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-danger mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
                className={errors.password ? 'border-danger' : ''}
              />
              {errors.password && (
                <p className="text-sm text-danger mt-1">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full hover:scale-105 transition-all duration-200" 
              disabled={loading}
            >
              {loading ? 'جاري التحميل...' : 'تسجيل دخول'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Button 
              type="button" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/80 hover:scale-105 transition-all duration-200" 
              onClick={() => navigate('/register')}
            >
              انشاء حساب جديد
            </Button>
            {/* <Link
              to="/register"
              className="block text-sm text-accent hover:underline"
            >
              انشاء حساب جديد
            </Link> */}
            <button className="text-sm text-muted-foreground hover:text-foreground">
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-2">
              <strong>للتجربة:</strong>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              الموبايل: 01012345678 | كلمة المرور: 12345678
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}