import React, { useState, useEffect, useRef } from 'react';
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
import Sweetalert2 from 'sweetalert2';

const BACKEND_URL = 'http://localhost:4000';

// Define the Location interface with is_active and string id
interface Location {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

const LocationManagement = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({
    name: '',
    description: '',
    is_active: true, // Updated to is_active
  });

  // Ref for the trigger button to manage focus
  const addTriggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const editTriggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const deleteTriggerButtonRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Load locations from the API
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/locations`, {
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
          throw new Error(errorData.message || `Failed to fetch locations (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch locations (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      Sweetalert2.fire(
        'Error',
        error.message || 'Failed to load locations.',
        'error'
      );
    }
  };

  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleAddLocation = async () => {
    // Validate inputs
    if (!newLocation.name.trim()) {
      Sweetalert2.fire('Required Field Missing', 'Location name is required', 'error');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          name: newLocation.name,
          description: newLocation.description || null,
          is_active: newLocation.is_active,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to add location (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to add location (Status: ${response.status}) - Unexpected response format`);
        }
      }

      // Refresh the locations list
      await loadLocations();

      // Reset form
      setNewLocation({
        name: '',
        description: '',
        is_active: true,
      });

      Sweetalert2.fire({
        title: 'Success',
        text: `${newLocation.name} has been added successfully`,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error saving location:', error);
      Sweetalert2.fire('Error', error.message || 'Failed to add location', 'error');
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation({ ...location });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;

    // Validate inputs
    if (!editingLocation.name.trim()) {
      Sweetalert2.fire('Required Field Missing', 'Location name is required', 'error');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          name: editingLocation.name,
          description: editingLocation.description || null,
          is_active: editingLocation.is_active,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update location (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to update location (Status: ${response.status}) - Unexpected response format`);
        }
      }

      // Refresh the locations list
      await loadLocations();

      Sweetalert2.fire({
        title: 'Success',
        text: 'Location updated successfully',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      Sweetalert2.fire('Error', error.message || 'Failed to update location', 'error');
    }
  };

  const confirmDelete = (id: string) => {
    setLocationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/locations/${locationToDelete}`, {
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
          throw new Error(errorData.message || `Failed to delete location (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to delete location (Status: ${response.status}) - Unexpected response format`);
        }
      }

      // Refresh the locations list
      await loadLocations();

      Sweetalert2.fire({
        title: 'Success',
        text: 'Location deleted successfully',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      Sweetalert2.fire('Error', error.message || 'Failed to delete location', 'error');
    }
  };

  const toggleLocationActive = async (location: Location) => {
    const updatedLocation = {
      ...location,
      is_active: !location.is_active, // Updated to is_active
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/locations/${location.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(updatedLocation),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update location status (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to update location status (Status: ${response.status}) - Unexpected response format`);
        }
      }

      // Refresh the locations list
      await loadLocations();

      Sweetalert2.fire({
        title: 'Success',
        text: `${location.name} is now ${!location.is_active ? 'active' : 'inactive'}`,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error toggling location status:', error);
      Sweetalert2.fire('Error', error.message || 'Failed to update location status', 'error');
    }
  };

  // Handle dialog close and restore focus
  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        addTriggerButtonRef.current?.focus();
      }, 0);
      setNewLocation({
        name: '',
        description: '',
        is_active: true,
      });
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        editTriggerButtonRef.current?.focus();
      }, 0);
      setEditingLocation(null);
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      const button = deleteTriggerButtonRef.current.get(locationToDelete ?? '');
      setTimeout(() => {
        button?.focus();
      }, 0);
      setLocationToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Location Management</h2>
        <Button 
          variant="default" 
          onClick={() => setIsAddDialogOpen(true)}
          ref={addTriggerButtonRef}
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
              aria-label="Search locations"
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
                      checked={location.is_active} // Updated to is_active
                      onCheckedChange={() => toggleLocationActive(location)}
                      aria-label={`Toggle active status for ${location.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        handleEditLocation(location);
                      }}
                      className="mr-2"
                      aria-label={`Edit ${location.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        deleteTriggerButtonRef.current.set(location.id, deleteTriggerButtonRef.current.get(location.id) || document.activeElement as HTMLButtonElement);
                        confirmDelete(location.id);
                      }}
                      ref={(el) => {
                        if (el) deleteTriggerButtonRef.current.set(location.id, el);
                      }}
                      aria-label={`Delete ${location.name}`}
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
      <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpenChange}>
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
                aria-required="true"
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
                checked={newLocation.is_active} // Updated to is_active
                onCheckedChange={(checked) => setNewLocation({ ...newLocation, is_active: checked })}
                aria-label="Toggle active status for new location"
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
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
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
                  aria-required="true"
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
                  checked={editingLocation.is_active} // Updated to is_active
                  onCheckedChange={(checked) => 
                    setEditingLocation({ ...editingLocation, is_active: checked })
                  }
                  aria-label={`Toggle active status for ${editingLocation.name}`}
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
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