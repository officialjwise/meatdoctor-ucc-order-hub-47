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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = 'http://localhost:4000';

const AdditionalOptionsManagement = () => {
  const [options, setOptions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentOption, setCurrentOption] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: '', price: '' });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/additional-options`, {
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
          throw new Error(errorData.message || `Failed to fetch additional options (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch additional options (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      setOptions(data);
    } catch (error) {
      console.error('Error fetching additional options:', error);
      toast.error(error.message || 'Failed to load additional options.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', type: '', price: '' });
    setCurrentOption(null);
  };

  const handleEdit = (option) => {
    setCurrentOption(option);
    setFormData({ name: option.name, type: option.type, price: option.price?.toString() || '' });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this additional option?');
    if (confirmed) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/additional-options/${id}`, {
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
            throw new Error(errorData.message || `Failed to delete additional option (Status: ${response.status})`);
          } else {
            throw new Error(`Failed to delete additional option (Status: ${response.status}) - Unexpected response format`);
          }
        }

        toast.success('Additional option deleted successfully.');
        loadOptions();
      } catch (error) {
        console.error('Error deleting additional option:', error);
        toast.error(error.message || 'Failed to delete additional option.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const optionData = {
        name: formData.name,
        type: formData.type,
        price: parseFloat(formData.price) || 0, // Ensure price is a number
      };

      const url = currentOption
        ? `${BACKEND_URL}/api/additional-options/${currentOption.id}`
        : `${BACKEND_URL}/api/additional-options`;
      const method = currentOption ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(optionData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to ${currentOption ? 'update' : 'add'} additional option (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to ${currentOption ? 'update' : 'add'} additional option (Status: ${response.status}) - Unexpected response format`);
        }
      }

      toast.success(`Additional option ${currentOption ? 'updated' : 'added'} successfully.`);
      loadOptions();
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving additional option:', error);
      toast.error(error.message || `Failed to ${currentOption ? 'update' : 'add'} additional option.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Additional Options</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Option</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentOption ? 'Edit' : 'Add'} Additional Option</DialogTitle>
              <DialogDescription>
                {currentOption ? 'Update the' : 'Add a new'} additional option (e.g., drinks, water).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Option Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={handleTypeChange} value={formData.type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drink">Drink</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (GHS)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentOption ? 'Update' : 'Add'} Option
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <Card key={option.id}>
            <CardHeader>
              <CardTitle>{option.name}</CardTitle>
              <CardDescription>
                Type: {option.type} | Price: GHS {option.price?.toFixed(2) || '0.00'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(option)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(option.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {options.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No additional options added yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdditionalOptionsManagement;