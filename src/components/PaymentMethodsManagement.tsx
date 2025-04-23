
import React, { useState, useEffect } from 'react';
import { PaymentMode, getPaymentModes, savePaymentMode, deletePaymentMode } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Trash2, 
  Edit, 
  Search,
  CreditCard,
  Plus
} from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showConfirmationAlert } from '@/lib/alerts';

const PaymentMethodsManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPayment, setEditingPayment] = useState<PaymentMode | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  const [newPayment, setNewPayment] = useState<Omit<PaymentMode, 'id'>>({
    name: '',
    description: '',
    active: true,
  });

  // Load payment methods from localStorage
  useEffect(() => {
    setPaymentMethods(getPaymentModes());
  }, []);

  const filteredPaymentMethods = paymentMethods.filter(payment => 
    payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPayment = () => {
    // Validate inputs
    if (!newPayment.name.trim()) {
      showErrorAlert('Required Field Missing', 'Payment method name is required');
      return;
    }

    try {
      // Create a new payment method without ID (will be generated in savePaymentMode)
      const savedPayment = savePaymentMode(newPayment as PaymentMode);
      
      // Update the payment methods list
      setPaymentMethods(getPaymentModes());
      
      // Reset form
      setNewPayment({
        name: '',
        description: '',
        active: true,
      });
      
      // Close dialog
      setIsAddDialogOpen(false);
      
      // Show success message using SweetAlert
      showSuccessAlert('Success', `${savedPayment.name} has been added successfully`);
    } catch (error) {
      console.error('Error saving payment method:', error);
      showErrorAlert('Error', 'Failed to add payment method');
    }
  };

  const handleEditPayment = (payment: PaymentMode) => {
    setEditingPayment({ ...payment });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePayment = () => {
    if (!editingPayment) return;

    // Validate inputs
    if (!editingPayment.name.trim()) {
      showErrorAlert('Required Field Missing', 'Payment method name is required');
      return;
    }

    try {
      // Update the payment method
      savePaymentMode(editingPayment);
      
      // Update the payment methods list
      setPaymentMethods(getPaymentModes());
      
      // Close dialog and reset form
      setIsEditDialogOpen(false);
      setEditingPayment(null);
      
      // Show success message using SweetAlert
      showSuccessAlert('Success', 'Payment method updated successfully');
    } catch (error) {
      console.error('Error updating payment method:', error);
      showErrorAlert('Error', 'Failed to update payment method');
    }
  };

  const confirmDelete = async (id: number) => {
    setPaymentToDelete(id);
    
    const result = await showConfirmationAlert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method? This action cannot be undone.',
      'Yes, Delete',
      'Cancel'
    );
    
    if (result.isConfirmed) {
      handleDeletePayment();
    }
  };

  const handleDeletePayment = () => {
    if (paymentToDelete === null) return;

    try {
      const result = deletePaymentMode(paymentToDelete);
      
      if (result) {
        // Update the payment methods list
        setPaymentMethods(getPaymentModes());
        showSuccessAlert('Success', 'Payment method deleted successfully');
      } else {
        showErrorAlert('Error', 'Failed to delete payment method');
      }
      
      // Reset
      setPaymentToDelete(null);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      showErrorAlert('Error', 'Failed to delete payment method');
    }
  };

  const togglePaymentActive = async (payment: PaymentMode) => {
    const updatedPayment = {
      ...payment,
      active: !payment.active
    };

    try {
      savePaymentMode(updatedPayment);
      setPaymentMethods(getPaymentModes());
      showSuccessAlert('Status Updated', `${payment.name} is now ${!payment.active ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error toggling payment method status:', error);
      showErrorAlert('Error', 'Failed to update payment method status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Methods Management</h2>
        <Button 
          variant="default" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          <CreditCard className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment methods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPaymentMethods.length > 0 ? (
              filteredPaymentMethods.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {payment.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={payment.active}
                      onCheckedChange={() => togglePaymentActive(payment)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditPayment(payment)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => confirmDelete(payment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No payment methods found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Payment Method</DialogTitle>
            <DialogDescription>
              Create a new payment method to be available on the ordering page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="paymentName" className="block text-sm font-medium mb-1">
                Payment Method Name *
              </label>
              <Input
                id="paymentName"
                placeholder="Enter payment method name"
                value={newPayment.name}
                onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="paymentDescription" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="paymentDescription"
                placeholder="Describe the payment method (optional)"
                value={newPayment.description || ''}
                onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="paymentActive"
                checked={newPayment.active}
                onCheckedChange={(checked) => setNewPayment({ ...newPayment, active: checked })}
              />
              <label htmlFor="paymentActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Method Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Make changes to the payment method details below.
            </DialogDescription>
          </DialogHeader>
          
          {editingPayment && (
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="editPaymentName" className="block text-sm font-medium mb-1">
                  Payment Method Name *
                </label>
                <Input
                  id="editPaymentName"
                  placeholder="Enter payment method name"
                  value={editingPayment.name}
                  onChange={(e) => setEditingPayment({ ...editingPayment, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="editPaymentDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="editPaymentDescription"
                  placeholder="Describe the payment method (optional)"
                  value={editingPayment.description || ''}
                  onChange={(e) => setEditingPayment({ ...editingPayment, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="editPaymentActive"
                  checked={editingPayment.active}
                  onCheckedChange={(checked) => 
                    setEditingPayment({ ...editingPayment, active: checked })
                  }
                />
                <label htmlFor="editPaymentActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayment}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsManagement;
