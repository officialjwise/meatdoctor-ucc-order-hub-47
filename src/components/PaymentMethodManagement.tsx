
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getPaymentModes, savePaymentMode, deletePaymentMode, PaymentMode } from '@/lib/storage';
import Sweetalert2 from 'sweetalert2';

const PaymentMethodManagement = () => {
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMode | null>(null);
  
  // New payment method form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  
  useEffect(() => {
    loadPaymentMethods();
  }, []);
  
  const loadPaymentMethods = () => {
    const methods = getPaymentModes();
    setPaymentModes(methods);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true
    });
    setCurrentMethod(null);
  };
  
  const handleEdit = (method: PaymentMode) => {
    setCurrentMethod(method);
    setFormData({
      name: method.name,
      description: method.description || '',
      active: method.active
    });
    setOpenDialog(true);
  };
  
  const handleDelete = async (id: number) => {
    const result = await Sweetalert2.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      const success = deletePaymentMode(id);
      if (success) {
        loadPaymentMethods();
        Sweetalert2.fire(
          'Deleted!',
          'Payment method has been deleted.',
          'success'
        );
      } else {
        Sweetalert2.fire(
          'Error',
          'Failed to delete payment method.',
          'error'
        );
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const paymentMethodData: PaymentMode = {
        id: currentMethod?.id || 0,
        name: formData.name,
        description: formData.description,
        active: formData.active
      };
      
      savePaymentMode(paymentMethodData);
      loadPaymentMethods();
      
      Sweetalert2.fire({
        title: 'Success!',
        text: `Payment method ${currentMethod ? 'updated' : 'added'} successfully.`,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
      Sweetalert2.fire(
        'Error',
        'Failed to save payment method.',
        'error'
      );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Available Payment Methods</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Payment Method</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentMethod ? 'Edit' : 'Add'} Payment Method</DialogTitle>
              <DialogDescription>
                {currentMethod ? 'Update the' : 'Add a new'} payment method for customers.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Method Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe how to use this payment method"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentMethod ? 'Update' : 'Add'} Method
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentModes.map((method) => (
          <Card key={method.id} className={method.active ? 'border-primary/30' : 'opacity-70'}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{method.name}</span>
                {method.active ? (
                  <span className="text-xs font-medium py-1 px-2 bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-100">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-medium py-1 px-2 bg-gray-100 text-gray-800 rounded-full dark:bg-gray-800 dark:text-gray-300">
                    Inactive
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {method.description || 'No description provided.'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(method)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(method.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {paymentModes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No payment methods added yet.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManagement;
