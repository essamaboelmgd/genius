import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getSubscriptions, updateSubscriptionStatus } from '@/services/subscriptionsService';

interface Subscription {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  courseId: {
    _id: string;
    title: string;
    educationalLevel: {
      nameAr: string;
    };
  };
  status: 'active' | 'pending' | 'rejected';
  paymentMethod: 'center' | 'vodafone' | 'code';
  vodafoneReceipt: string;
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions(statusFilter);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('حدث خطأ أثناء تحميل الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (subscriptionId: string, status: 'active' | 'rejected') => {
    try {
      const updatedSubscription = await updateSubscriptionStatus(subscriptionId, status);
      toast.success('تم تحديث حالة الاشتراك بنجاح');
      
      // Update the subscription in the state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub._id === subscriptionId ? updatedSubscription : sub
        )
      );
    } catch (error) {
      console.error('Error updating subscription status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الاشتراك');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">مفعل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'center':
        return 'المركز';
      case 'vodafone':
        return 'فودافون كاش';
      case 'code':
        return 'كود';
      default:
        return method;
    }
  };

  if (loading) {
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">إدارة الاشتراكات</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="active">مفعل</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadSubscriptions}>تحديث</Button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد اشتراكات متاحة
          </div>
        ) : (
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>الكورس</TableHead>
                  <TableHead>المستوى الدراسي</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الاشتراك</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.userId.name}</div>
                        <div className="text-sm text-muted-foreground">{subscription.userId.email}</div>
                        <div className="text-sm text-muted-foreground">{subscription.userId.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{subscription.courseId.title}</TableCell>
                    <TableCell>{subscription.courseId.educationalLevel.nameAr}</TableCell>
                    <TableCell>{getPaymentMethodText(subscription.paymentMethod)}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>{new Date(subscription.subscribedAt).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {subscription.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(subscription._id, 'active')}
                            >
                              تفعيل
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleUpdateStatus(subscription._id, 'rejected')}
                            >
                              رفض
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}