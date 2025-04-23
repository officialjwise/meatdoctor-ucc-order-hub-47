
import React, { useState, useEffect } from 'react';
import { PaymentMode, getPaymentModes, savePaymentMode, deletePaymentMode } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Trash2, 
  Edit, 
  Search,
  CreditCard,
  Plus
} from 'lucide-react';

const PaymentMethodManagement = () => {
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPaymentMode, setEditingPaymentMode] = useState<PaymentMode | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [paymentModeToDelete, setPaymentModeToDelete] = useState<number | null>(null);

  const [newPaymentMode, setNewPaymentMode] = useState<Omit<PaymentMode, 'id'>>({
    name: '',
    description: '',
    active: true,
  });

  // Load payment modes from localStorage
  useEffect(() => {
    setPaymentModes(getPaymentModes());
  }, []);

  const filteredPaymentModes = paymentModes.filter(paymentMode => 
    paymentMode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paymentMode.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPaymentMode = () => {
    // Validate inputs
    if (!newPaymentMode.name.trim()) {
      toast.error('Payment method name is required');
      return;
    }

    try {
      // Create a new payment mode without ID (will be generated in savePaymentMode)
      const savedPaymentMode = savePaymentMode(newPaymentMode as PaymentMode);
      
      // Update the payment modes list
      setPaymentModes(getPaymentModes());
      
      // Reset form
      setNewPaymentMode({
        name: '',
        description: '',
        active: true,
      });
      
      toast.success(`${savedPaymentMode.name} has been added successfully`);
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleEditPaymentMode = (paymentMode: PaymentMode) => {
    setEditingPaymentMode({ ...paymentMode });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePaymentMode = () => {
    if (!editingPaymentMode) return;

    // Validate inputs
    if (!editingPaymentMode.name.trim()) {
      toast.error('Payment method name is required');
      return;
    }

    try {
      // Update the payment mode
      savePaymentMode(editingPaymentMode);
      
      // Update the payment modes list
      setPaymentModes(getPaymentModes());
      
      // Close dialog and reset form
      setIsEditDialogOpen(false);
      setEditingPaymentMode(null);
      
      toast.success(`Payment method updated successfully`);
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
    }
  };

  const confirmDelete = (id: number) => {
    setPaymentModeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePaymentMode = () => {
    if (paymentModeToDelete === null) return;

    try {
      const result = deletePaymentMode(paymentModeToDelete);
      
      if (result) {
        // Update the payment modes list
        setPaymentModes(getPaymentModes());
        toast.success('Payment method deleted successfully');
      } else {
        toast.error('Failed to delete payment method');
      }
      
      // Close dialog and reset
      setIsDeleteDialogOpen(false);
      setPaymentModeToDelete(null);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const togglePaymentModeActive = (paymentMode: PaymentMode) => {
    const updatedPaymentMode = {
      ...paymentMode,
      active: !paymentMode.active
    };

    try {
      savePaymentMode(updatedPaymentMode);
      setPaymentModes(getPaymentModes());
      toast.success(`${paymentMode.name} is now ${!paymentMode.active ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error toggling payment method status:', error);
      toast.error('Failed to update payment method status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">
              <CreditCard className="mr-2 h-4 w-4" /> Add New Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Payment Method</DialogTitle>
              <DialogDescription>
                Create a new payment method to be available on the ordering page.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="paymentModeName" className="block text-sm font-medium mb-1">
                  Payment Method Name *
                </label>
                <Input
                  id="paymentModeName"
                  placeholder="Enter payment method name"
                  value={newPaymentMode.name}
                  onChange={(e) => setNewPaymentMode({ ...newPaymentMode, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="paymentModeDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="paymentModeDescription"
                  placeholder="Describe the payment method (optional)"
                  value={newPaymentMode.description || ''}
                  onChange={(e) => setNewPaymentMode({ ...newPaymentMode, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="paymentModeActive"
                  checked={newPaymentMode.active}
                  onCheckedChange={(checked) => setNewPaymentMode({ ...newPaymentMode, active: checked })}
                />
                <label htmlFor="paymentModeActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button">Cancel</Button>
              <Button onClick={handleAddPaymentMode}>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {filteredPaymentModes.length > 0 ? (
              filteredPaymentModes.map((paymentMode) => (
                <TableRow key={paymentMode.id}>
                  <TableCell className="font-medium">{paymentMode.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {paymentMode.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={paymentMode.active}
                      onCheckedChange={() => togglePaymentModeActive(paymentMode)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditPaymentMode(paymentMode)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => confirmDelete(paymentMode.id)}
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

      {/* Form moved to dialog */}

      {/* Edit Payment Mode Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Make changes to the payment method details below.
            </DialogDescription>
          </DialogHeader>
          
          {editingPaymentMode && (
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="editPaymentModeName" className="block text-sm font-medium mb-1">
                  Payment Method Name *
                </label>
                <Input
                  id="editPaymentModeName"
                  placeholder="Enter payment method name"
                  value={editingPaymentMode.name}
                  onChange={(e) => setEditingPaymentMode({ ...editingPaymentMode, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="editPaymentModeDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="editPaymentModeDescription"
                  placeholder="Describe the payment method (optional)"
                  value={editingPaymentMode.description || ''}
                  onChange={(e) => setEditingPaymentMode({ ...editingPaymentMode, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="editPaymentModeActive"
                  checked={editingPaymentMode.active}
                  onCheckedChange={(checked) => 
                    setEditingPaymentMode({ ...editingPaymentMode, active: checked })
                  }
                />
                <label htmlFor="editPaymentModeActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePaymentMode}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePaymentMode}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodManagement;
