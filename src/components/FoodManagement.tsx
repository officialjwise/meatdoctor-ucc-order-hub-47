
import React, { useState, useEffect } from 'react';
import { Food, getFoods, saveFood, deleteFood } from '@/lib/storage';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Trash2, 
  Edit, 
  Plus,
  Search,
  X,
  Image
} from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showConfirmationAlert } from '@/lib/alerts';

const FoodManagement = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<number | null>(null);

  const [newFood, setNewFood] = useState<Omit<Food, 'id'>>({
    name: '',
    price: 0,
    description: '',
    images: []
  });

  // Load foods from localStorage
  useEffect(() => {
    setFoods(getFoods());
  }, []);

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = () => {
    // Validate inputs
    if (!newFood.name.trim()) {
      showErrorAlert('Required Field Missing', 'Food name is required');
      return;
    }

    if (newFood.price <= 0) {
      showErrorAlert('Invalid Price', 'Price must be greater than 0');
      return;
    }

    try {
      // Create a new food item without ID (will be generated in saveFood)
      const savedFood = saveFood(newFood as Food);
      
      // Update the food list
      setFoods(getFoods());
      
      // Reset form
      setNewFood({
        name: '',
        price: 0,
        description: '',
        images: []
      });
      
      // Close the dialog
      setIsAddDialogOpen(false);
      
      // Show success message
      showSuccessAlert('Success', `${savedFood.name} has been added successfully`);
    } catch (error) {
      console.error('Error saving food:', error);
      showErrorAlert('Error', 'Failed to add food item');
    }
  };

  const handleEditFood = (food: Food) => {
    setEditingFood({ 
      ...food,
      // Ensure images is an array (backward compatibility)
      images: food.images || (food.imageUrl ? [food.imageUrl] : [])
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateFood = () => {
    if (!editingFood) return;

    // Validate inputs
    if (!editingFood.name.trim()) {
      showErrorAlert('Required Field Missing', 'Food name is required');
      return;
    }

    if (editingFood.price <= 0) {
      showErrorAlert('Invalid Price', 'Price must be greater than 0');
      return;
    }

    try {
      // For backward compatibility, set imageUrl to the first image
      if (editingFood.images && editingFood.images.length > 0) {
        editingFood.imageUrl = editingFood.images[0];
      }
      
      // Update the food item
      saveFood(editingFood);
      
      // Update the food list
      setFoods(getFoods());
      
      // Close dialog
      setIsEditDialogOpen(false);
      setEditingFood(null);
      
      // Show success message
      showSuccessAlert('Success', 'Food item updated successfully');
    } catch (error) {
      console.error('Error updating food:', error);
      showErrorAlert('Error', 'Failed to update food item');
    }
  };

  const confirmDelete = (id: number) => {
    setFoodToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFood = () => {
    if (foodToDelete === null) return;

    try {
      const result = deleteFood(foodToDelete);
      
      if (result) {
        // Update the food list
        setFoods(getFoods());
        showSuccessAlert('Success', 'Food item deleted successfully');
      } else {
        showErrorAlert('Error', 'Failed to delete food item');
      }
      
      // Close dialog and reset
      setIsDeleteDialogOpen(false);
      setFoodToDelete(null);
    } catch (error) {
      console.error('Error deleting food:', error);
      showErrorAlert('Error', 'Failed to delete food item');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showErrorAlert('File Too Large', 'Image size should be less than 2MB');
      return;
    }

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onload = () => {
      if (isEditing && editingFood) {
        // Add to images array for editing food (max 3 images)
        const currentImages = editingFood.images || [];
        if (currentImages.length >= 3) {
          showErrorAlert('Limit Reached', 'Maximum 3 images per food item allowed');
          return;
        }
        
        setEditingFood({
          ...editingFood,
          images: [...currentImages, reader.result as string]
        });
      } else {
        // Add to images array for new food (max 3 images)
        const currentImages = newFood.images || [];
        if (currentImages.length >= 3) {
          showErrorAlert('Limit Reached', 'Maximum 3 images per food item allowed');
          return;
        }
        
        setNewFood({
          ...newFood,
          images: [...currentImages, reader.result as string]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number, isEditing: boolean) => {
    if (isEditing && editingFood) {
      const newImages = [...(editingFood.images || [])];
      newImages.splice(index, 1);
      setEditingFood({
        ...editingFood,
        images: newImages
      });
    } else {
      const newImages = [...(newFood.images || [])];
      newImages.splice(index, 1);
      setNewFood({
        ...newFood,
        images: newImages
      });
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
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <TableRow key={food.id}>
                  <TableCell>
                    {(food.imageUrl || (food.images && food.images.length > 0)) ? (
                      <div className="relative h-12 w-12">
                        <img 
                          src={food.imageUrl || food.images?.[0]} 
                          alt={food.name} 
                          className="h-12 w-12 object-cover rounded"
                        />
                        {food.images && food.images.length > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                            {food.images.length}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{food.name}</TableCell>
                  <TableCell>GHS {food.price.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {food.description || '—'}
                  </TableCell>
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
                <TableCell colSpan={5} className="text-center py-4">
                  No food items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Food Dialog */}
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
              <label htmlFor="foodPrice" className="block text-sm font-medium mb-1">
                Price (GHS) *
              </label>
              <Input
                id="foodPrice"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={newFood.price || ''}
                onChange={(e) => setNewFood({ ...newFood, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <label htmlFor="foodDescription" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="foodDescription"
                placeholder="Describe the food item"
                value={newFood.description || ''}
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
                onChange={(e) => handleImageUpload(e, false)}
                disabled={newFood.images && newFood.images.length >= 3}
              />
              
              {/* Display uploaded images */}
              {newFood.images && newFood.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newFood.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Food preview ${index + 1}`} 
                        className="h-16 w-16 object-cover rounded"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFood}>Add Food</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Food Dialog */}
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
                <label htmlFor="editFoodPrice" className="block text-sm font-medium mb-1">
                  Price (GHS) *
                </label>
                <Input
                  id="editFoodPrice"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={editingFood.price || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, price: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={(editingFood.images || []).length >= 3}
                />
                
                {/* Display uploaded images */}
                {editingFood.images && editingFood.images.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingFood.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`Food preview ${index + 1}`} 
                          className="h-16 w-16 object-cover rounded"
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
                ) : editingFood.imageUrl ? (
                  <div className="mt-2 relative">
                    <img 
                      src={editingFood.imageUrl} 
                      alt="Food preview" 
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button 
                      type="button"
                      onClick={() => setEditingFood({ ...editingFood, imageUrl: '' })}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null}
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

      {/* Delete Confirmation Dialog */}
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
