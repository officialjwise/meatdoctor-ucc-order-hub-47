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

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
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
          throw new Error(errorData.message || `Failed to fetch locations`);
        } else {
          throw new Error(`Failed to fetch locations`);
        }
      }

      const data = await response.json();
      setLocations(data);
    } catch (error) {
      toast.error('Failed to load locations.');
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
    setCurrentLocation(null);
  };

  const handleEdit = (location) => {
    setCurrentLocation(location);
    setFormData({ name: location.name });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this location?');
    if (confirmed) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/locations/${id}`, {
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
            throw new Error(errorData.message || `Failed to delete location`);
          } else {
            throw new Error(`Failed to delete location`);
          }
        }

        toast.success('Location deleted successfully.');
        loadLocations();
      } catch (error) {
        toast.error('Failed to delete location.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const locationData = { name: formData.name };

      const url = currentLocation
        ? `${BACKEND_URL}/api/locations/${currentLocation.id}`
        : `${BACKEND_URL}/api/locations`;
      const method = currentLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to ${currentLocation ? 'update' : 'add'} location`);
        } else {
          throw new Error(`Failed to ${currentLocation ? 'update' : 'add'} location`);
        }
      }

      toast.success(`Location ${currentLocation ? 'updated' : 'added'} successfully.`);
      loadLocations();
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      toast.error(`Failed to ${currentLocation ? 'update' : 'add'} location.`);
    }
  };

  const totalPages = Math.ceil(locations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLocations = locations.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading locations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Delivery Locations</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Location</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentLocation ? 'Edit' : 'Add'} Location</DialogTitle>
              <DialogDescription>
                {currentLocation ? 'Update the' : 'Add a new'} delivery location.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
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
                  {currentLocation ? 'Update' : 'Add'} Location
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentLocations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle>{location.name}</CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(location)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(location.id)}>
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

      {locations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No locations added yet.</p>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
