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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

const BACKEND_URL = 'https://meatdoctor-ucc-officialjwise-dev.apps.rm3.7wse.p1.openshiftapps.com';
const ITEMS_PER_PAGE = 9;

const PaymentMethodManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
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
          throw new Error(errorData.message || `Failed to fetch payment methods`);
        } else {
          throw new Error(`Failed to fetch payment methods`);
        }
      }

      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      toast.error('Failed to load payment methods.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setCurrentPaymentMethod(null);
  };

  const handleEdit = (paymentMethod) => {
    setCurrentPaymentMethod(paymentMethod);
    setFormData({ name: paymentMethod.name });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this payment method?');
    if (confirmed) {
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
            throw new Error(errorData.message || `Failed to delete payment method`);
          } else {
            throw new Error(`Failed to delete payment method`);
          }
        }

        toast.success('Payment method deleted successfully.');
        loadPaymentMethods();
      } catch (error) {
        toast.error('Failed to delete payment method.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const paymentMethodData = { name: formData.name };

      const url = currentPaymentMethod
        ? `${BACKEND_URL}/api/payment-methods/${currentPaymentMethod.id}`
        : `${BACKEND_URL}/api/payment-methods`;
      const method = currentPaymentMethod ? 'PUT' : 'POST';

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
          throw new Error(errorData.message || `Failed to ${currentPaymentMethod ? 'update' : 'add'} payment method`);
        } else {
          throw new Error(`Failed to ${currentPaymentMethod ? 'update' : 'add'} payment method`);
        }
      }

      toast.success(`Payment method ${currentPaymentMethod ? 'updated' : 'added'} successfully.`);
      loadPaymentMethods();
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      toast.error(`Failed to ${currentPaymentMethod ? 'update' : 'add'} payment method.`);
    }
  };

  const totalPages = Math.ceil(paymentMethods.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPaymentMethods = paymentMethods.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading payment methods...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Payment Methods</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Payment Method</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentPaymentMethod ? 'Edit' : 'Add'} Payment Method</DialogTitle>
              <DialogDescription>
                {currentPaymentMethod ? 'Update the' : 'Add a new'} payment method.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Payment Method Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentPaymentMethod ? 'Update' : 'Add'} Payment Method
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPaymentMethods.map((paymentMethod) => (
          <Card key={paymentMethod.id}>
            <CardHeader>
              <CardTitle>{paymentMethod.name}</CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(paymentMethod)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(paymentMethod.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {paymentMethods.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No payment methods added yet.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManagement;
