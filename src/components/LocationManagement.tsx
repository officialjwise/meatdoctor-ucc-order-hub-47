
import React, { useState, useEffect } from 'react';
import { Location, getLocations, saveLocation, deleteLocation } from '@/lib/storage';
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
  MapPin,
  Plus
} from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showConfirmationAlert } from '@/lib/alerts';

const LocationManagement = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);

  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({
    name: '',
    description: '',
    active: true,
  });

  // Load locations from localStorage
  useEffect(() => {
    setLocations(getLocations());
  }, []);

  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLocation = () => {
    // Validate inputs
    if (!newLocation.name.trim()) {
      showErrorAlert('Required Field Missing', 'Location name is required');
      return;
    }

    try {
      // Create a new location without ID (will be generated in saveLocation)
      const savedLocation = saveLocation(newLocation as Location);
      
      // Update the locations list
      setLocations(getLocations());
      
      // Reset form
      setNewLocation({
        name: '',
        description: '',
        active: true,
      });
      
      // Close dialog
      setIsAddDialogOpen(false);
      
      // Show success message
      showSuccessAlert('Success', `${savedLocation.name} has been added successfully`);
    } catch (error) {
      console.error('Error saving location:', error);
      showErrorAlert('Error', 'Failed to add location');
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation({ ...location });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLocation = () => {
    if (!editingLocation) return;

    // Validate inputs
    if (!editingLocation.name.trim()) {
      showErrorAlert('Required Field Missing', 'Location name is required');
      return;
    }

    try {
      // Update the location
      saveLocation(editingLocation);
      
      // Update the locations list
      setLocations(getLocations());
      
      // Close dialog and reset form
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      
      // Show success message
      showSuccessAlert('Success', 'Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      showErrorAlert('Error', 'Failed to update location');
    }
  };

  const confirmDelete = (id: number) => {
    setLocationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLocation = async () => {
    if (locationToDelete === null) return;

    try {
      const result = deleteLocation(locationToDelete);
      
      if (result) {
        // Update the locations list
        setLocations(getLocations());
        showSuccessAlert('Success', 'Location deleted successfully');
      } else {
        showErrorAlert('Error', 'Failed to delete location');
      }
      
      // Close dialog and reset
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    } catch (error) {
      console.error('Error deleting location:', error);
      showErrorAlert('Error', 'Failed to delete location');
    }
  };

  const toggleLocationActive = async (location: Location) => {
    const updatedLocation = {
      ...location,
      active: !location.active
    };

    try {
      saveLocation(updatedLocation);
      setLocations(getLocations());
      showSuccessAlert('Status Updated', `${location.name} is now ${!location.active ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error toggling location status:', error);
      showErrorAlert('Error', 'Failed to update location status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Location Management</h2>
        <Button 
          variant="default" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          <MapPin className="mr-2 h-4 w-4" /> Add New Location
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
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
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {location.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={location.active}
                      onCheckedChange={() => toggleLocationActive(location)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditLocation(location)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => confirmDelete(location.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No locations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new delivery location to be available on the ordering page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium mb-1">
                Location Name *
              </label>
              <Input
                id="locationName"
                placeholder="Enter location name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="locationDescription" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="locationDescription"
                placeholder="Describe the location (optional)"
                value={newLocation.description || ''}
                onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="locationActive"
                checked={newLocation.active}
                onCheckedChange={(checked) => setNewLocation({ ...newLocation, active: checked })}
              />
              <label htmlFor="locationActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Make changes to the location details below.
            </DialogDescription>
          </DialogHeader>
          
          {editingLocation && (
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="editLocationName" className="block text-sm font-medium mb-1">
                  Location Name *
                </label>
                <Input
                  id="editLocationName"
                  placeholder="Enter location name"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="editLocationDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="editLocationDescription"
                  placeholder="Describe the location (optional)"
                  value={editingLocation.description || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="editLocationActive"
                  checked={editingLocation.active}
                  onCheckedChange={(checked) => 
                    setEditingLocation({ ...editingLocation, active: checked })
                  }
                />
                <label htmlFor="editLocationActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation}>
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
              Are you sure you want to delete this location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLocation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationManagement;
