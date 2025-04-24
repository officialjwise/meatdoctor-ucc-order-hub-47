import React, { useState, useEffect, useRef } from 'react';
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
import Sweetalert2 from 'sweetalert2';

const BACKEND_URL = 'http://localhost:4000';

const PaymentMethodManagement = () => {
  const [paymentModes, setPaymentModes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(null);
  
  // New payment method form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true, // Reverted to is_active
  });

  // Ref for the trigger button to manage focus
  const triggerButtonRef = useRef(null);
  
  useEffect(() => {
    loadPaymentMethods();
  }, []);
  
  const loadPaymentMethods = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch payment methods (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch payment methods (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      setPaymentModes(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Sweetalert2.fire(
        'Error',
        error.message || 'Failed to load payment methods.',
        'error'
      );
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked) => {
    setFormData(prev => ({ ...prev, is_active: checked })); // Reverted to is_active
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true, // Reverted to is_active
    });
    setCurrentMethod(null);
  };
  
  const handleEdit = (method) => {
    setCurrentMethod(method);
    setFormData({
      name: method.name,
      description: method.description || '',
      is_active: method.is_active, // Reverted to is_active
    });
    setOpenDialog(true);
  };
  
  const handleDelete = async (id) => {
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
      try {
        const response = await fetch(`${BACKEND_URL}/api/payment-methods/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete payment method (Status: ${response.status})`);
          } else {
            throw new Error(`Failed to delete payment method (Status: ${response.status}) - Unexpected response format`);
          }
        }

        loadPaymentMethods();
        Sweetalert2.fire(
          'Deleted!',
          'Payment method has been deleted.',
          'success'
        );
      } catch (error) {
        console.error('Error deleting payment method:', error);
        Sweetalert2.fire(
          'Error',
          error.message || 'Failed to delete payment method.',
          'error'
        );
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const paymentMethodData = {
        name: formData.name,
        description: formData.description || null,
        is_active: formData.is_active, // Reverted to is_active
      };

      const url = currentMethod
        ? `${BACKEND_URL}/api/payment-methods/${currentMethod.id}`
        : `${BACKEND_URL}/api/payment-methods`;
      const method = currentMethod ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(paymentMethodData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to ${currentMethod ? 'update' : 'add'} payment method (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to ${currentMethod ? 'update' : 'add'} payment method (Status: ${response.status}) - Unexpected response format`);
        }
      }

      loadPaymentMethods();
      Sweetalert2.fire({
        title: 'Success!',
        text: `Payment method ${currentMethod ? 'updated' : 'added'} successfully.`,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
      Sweetalert2.fire(
        'Error',
        error.message || `Failed to ${currentMethod ? 'update' : 'add'} payment method.`,
        'error'
      );
    }
  };

  // Handle dialog close and restore focus
  const handleOpenChange = (open) => {
    setOpenDialog(open);
    if (!open) {
      // Restore focus to the trigger button when the dialog closes
      setTimeout(() => {
        triggerButtonRef.current?.focus();
      }, 0);
      resetForm();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Available Payment Methods</h2>
        <Dialog open={openDialog} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button ref={triggerButtonRef}>Add Payment Method</Button>
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
                  id="is_active" // Reverted to is_active
                  checked={formData.is_active} // Reverted to is_active
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active">Active</Label>
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
          <Card key={method.id} className={method.is_active ? 'border-primary/30' : 'opacity-70'}> {/* Updated to is_active */}
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{method.name}</span>
                {method.is_active ? ( // Updated to is_active
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