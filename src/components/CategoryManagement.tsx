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
import { toast } from 'sonner';

const BACKEND_URL = 'http://localhost:4000';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`, {
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
          throw new Error(errorData.message || `Failed to fetch categories (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch categories (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to load categories.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setCurrentCategory(null);
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({ name: category.name });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (confirmed) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
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
            throw new Error(errorData.message || `Failed to delete category (Status: ${response.status})`);
          } else {
            throw new Error(`Failed to delete category (Status: ${response.status}) - Unexpected response format`);
          }
        }

        toast.success('Category deleted successfully.');
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.message || 'Failed to delete category.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const categoryData = { name: formData.name };

      const url = currentCategory
        ? `${BACKEND_URL}/api/categories/${currentCategory.id}`
        : `${BACKEND_URL}/api/categories`;
      const method = currentCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to ${currentCategory ? 'update' : 'add'} category (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to ${currentCategory ? 'update' : 'add'} category (Status: ${response.status}) - Unexpected response format`);
        }
      }

      toast.success(`Category ${currentCategory ? 'updated' : 'added'} successfully.`);
      loadCategories();
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || `Failed to ${currentCategory ? 'update' : 'add'} category.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Food Categories</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentCategory ? 'Edit' : 'Add'} Category</DialogTitle>
              <DialogDescription>
                {currentCategory ? 'Update the' : 'Add a new'} category for food items.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
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
                  {currentCategory ? 'Update' : 'Add'} Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No categories added yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;