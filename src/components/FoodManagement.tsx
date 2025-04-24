import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from "@/components/ui/dialog";
import { 
  Trash2, 
  Edit, 
  Plus,
  Search,
  X,
  Image
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const BACKEND_URL = 'http://localhost:4000';

// Predefined categories (you can fetch these from the backend if managed in a separate table)
const FOOD_CATEGORIES = ['Main Course', 'Dessert', 'Appetizer', 'Beverage', 'Snack'];

const FoodManagement = () => {
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFood, setEditingFood] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);

  const [newFood, setNewFood] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image_urls: [],
    is_available: false,
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/foods`, {
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
          throw new Error(errorData.message || `Failed to fetch foods (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch foods (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      // Normalize image_urls: if image_url exists (old schema), convert to image_urls array
      const normalizedData = data.map(food => ({
        ...food,
        image_urls: food.image_urls || (food.image_url ? [food.image_url] : []),
      }));
      console.log('Fetched foods:', normalizedData);
      setFoods(normalizedData);
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error(error.message || 'Failed to load food items.');
    }
  };

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (food.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 3) {
      toast.error('You can upload a maximum of 3 images.');
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 2 * 1024 * 1024) {
      toast.error('Total image size should be less than 2MB');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const response = await fetch(`${BACKEND_URL}/api/foods/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to upload images (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to upload images (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      const imageUrls = data.imageUrls;
      console.log('Uploaded image URLs:', imageUrls);

      if (isEditing && editingFood) {
        setEditingFood({ ...editingFood, image_urls: imageUrls });
      } else {
        setNewFood({ ...newFood, image_urls: imageUrls });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images.');
    }
  };

  const removeImage = (index, isEditing) => {
    if (isEditing && editingFood) {
      const updatedUrls = editingFood.image_urls.filter((_, i) => i !== index);
      setEditingFood({ ...editingFood, image_urls: updatedUrls });
    } else {
      const updatedUrls = newFood.image_urls.filter((_, i) => i !== index);
      setNewFood({ ...newFood, image_urls: updatedUrls });
    }
  };

  const handleAddFood = async () => {
    if (!newFood.name.trim()) {
      toast.error('Food name is required');
      return;
    }

    const price = parseFloat(newFood.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          name: newFood.name,
          price: price,
          description: newFood.description || null,
          category: newFood.category || null,
          image_urls: newFood.image_urls,
          is_available: newFood.is_available,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to add food (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to add food (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const savedFood = await response.json();
      toast.success(`${savedFood.name} has been added successfully`);
      setNewFood({ name: '', price: '', description: '', category: '', image_urls: [], is_available: false });
      setIsAddDialogOpen(false);
      fetchFoods();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error(error.message || 'Failed to add food item.');
    }
  };

  const handleEditFood = (food) => {
    setEditingFood({
      ...food,
      price: food.price.toString(),
      image_urls: food.image_urls || [],
      is_available: food.is_available || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateFood = async () => {
    if (!editingFood) return;

    if (!editingFood.name.trim()) {
      toast.error('Food name is required');
      return;
    }

    const price = parseFloat(editingFood.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/foods/${editingFood.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          name: editingFood.name,
          price: price,
          description: editingFood.description || null,
          category: editingFood.category || null,
          image_urls: editingFood.image_urls,
          is_available: editingFood.is_available,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update food (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to update food (Status: ${response.status}) - Unexpected response format`);
        }
      }

      toast.success('Food item updated successfully');
      setIsEditDialogOpen(false);
      setEditingFood(null);
      fetchFoods();
    } catch (error) {
      console.error('Error updating food:', error);
      toast.error(error.message || 'Failed to update food item.');
    }
  };

  const confirmDelete = (id) => {
    setFoodToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFood = async () => {
    if (foodToDelete === null) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/foods/${foodToDelete}`, {
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
          throw new Error(errorData.message || `Failed to delete food (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to delete food (Status: ${response.status}) - Unexpected response format`);
        }
      }

      toast.success('Food item deleted successfully');
      setIsDeleteDialogOpen(false);
      setFoodToDelete(null);
      fetchFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
      toast.error(error.message || 'Failed to delete food item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Food Management</h2>
        <Button 
          variant="default" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Food
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Images</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <TableRow key={food.id}>
                  <TableCell>
                    {food.image_urls && food.image_urls.length > 0 ? (
                      <div className="flex space-x-2">
                        {food.image_urls.map((url, index) => (
                          <div key={index} className="relative h-12 w-12">
                            <img 
                              src={url} 
                              alt={`${food.name} ${index + 1}`} 
                              className="h-12 w-12 object-cover rounded"
                              onError={(e) => console.error(`Failed to load image: ${url}`)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{food.name}</TableCell>
                  <TableCell>{food.category || '—'}</TableCell>
                  <TableCell>GHS {food.price.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {food.description || '—'}
                  </TableCell>
                  <TableCell>{food.is_available ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditFood(food)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => confirmDelete(food.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No food items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Food</DialogTitle>
            <DialogDescription>
              Create a new food item to be available on the ordering page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="foodName" className="block text-sm font-medium mb-1">
                Food Name *
              </label>
              <Input
                id="foodName"
                placeholder="Enter food name"
                value={newFood.name}
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="foodCategory" className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                id="foodCategory"
                value={newFood.category}
                onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a category</option>
                {FOOD_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="foodPrice" className="block text-sm font-medium mb-1">
                Price (GHS) *
              </label>
              <Input
                id="foodPrice"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={newFood.price}
                onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="foodDescription" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="foodDescription"
                placeholder="Describe the food item"
                value={newFood.description}
                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Food Images (Max 3)
              </label>
              <Input
                id="foodImage"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, false)}
              />
              
              {newFood.image_urls && newFood.image_urls.length > 0 && (
                <div className="mt-2 flex space-x-2">
                  {newFood.image_urls.map((url, index) => (
                    <div key={index} className="relative h-16 w-16">
                      <img 
                        src={url} 
                        alt={`Food preview ${index + 1}`} 
                        className="h-16 w-16 object-cover rounded"
                        onError={(e) => console.error(`Failed to load image: ${url}`)}
                      />
                      <button 
                        type="button"
                        onClick={() => removeImage(index, false)}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Available
              </label>
              <Switch
                checked={newFood.is_available}
                onCheckedChange={(checked) => setNewFood({ ...newFood, is_available: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFood}>Add Food</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Food Item</DialogTitle>
            <DialogDescription>
              Make changes to the food item below.
            </DialogDescription>
          </DialogHeader>
          
          {editingFood && (
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="editFoodName" className="block text-sm font-medium mb-1">
                  Food Name *
                </label>
                <Input
                  id="editFoodName"
                  placeholder="Enter food name"
                  value={editingFood.name}
                  onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="editFoodCategory" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="editFoodCategory"
                  value={editingFood.category || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, category: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a category</option>
                  {FOOD_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="editFoodPrice" className="block text-sm font-medium mb-1">
                  Price (GHS) *
                </label>
                <Input
                  id="editFoodPrice"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={editingFood.price}
                  onChange={(e) => setEditingFood({ ...editingFood, price: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="editFoodDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="editFoodDescription"
                  placeholder="Describe the food item"
                  value={editingFood.description || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Food Images (Max 3)
                </label>
                <Input
                  id="editFoodImage"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, true)}
                />
                
                {editingFood.image_urls && editingFood.image_urls.length > 0 && (
                  <div className="mt-2 flex space-x-2">
                    {editingFood.image_urls.map((url, index) => (
                      <div key={index} className="relative h-16 w-16">
                        <img 
                          src={url} 
                          alt={`Food preview ${index + 1}`} 
                          className="h-16 w-16 object-cover rounded"
                          onError={(e) => console.error(`Failed to load image: ${url}`)}
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Available
                </label>
                <Switch
                  checked={editingFood.is_available}
                  onCheckedChange={(checked) => setEditingFood({ ...editingFood, is_available: checked })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFood}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this food item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFood}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodManagement;