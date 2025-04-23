
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Booking, updateBooking, deleteBooking } from '@/lib/storage';
import { toast } from "sonner";

interface BookingsTableProps {
  bookings: Booking[];
  onBookingsUpdate: () => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ 
  bookings, 
  onBookingsUpdate 
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [editedStatus, setEditedStatus] = useState<string>("");
  
  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }
    
    // Filter by date
    if (dateFilter) {
      const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
      if (bookingDate !== dateFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
  };
  
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditedStatus(booking.status);
    setEditModalOpen(true);
  };
  
  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteModalOpen(true);
  };
  
  const saveBookingEdit = () => {
    if (!selectedBooking) return;
    
    updateBooking(selectedBooking.id, { status: editedStatus as any });
    toast.success('Booking updated successfully');
    setEditModalOpen(false);
    onBookingsUpdate();
  };
  
  const confirmDeleteBooking = () => {
    if (!selectedBooking) return;
    
    deleteBooking(selectedBooking.id);
    toast.success('Booking deleted successfully');
    setDeleteModalOpen(false);
    onBookingsUpdate();
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/2">
          <Label htmlFor="date-filter">Filter by Date</Label>
          <div className="flex gap-2">
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <Button 
                variant="ghost" 
                onClick={() => setDateFilter("")}
                aria-label="Clear date filter"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Bookings Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Food</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.food.name.length > 20 ? `${booking.food.name.slice(0, 20)}...` : booking.food.name}</TableCell>
                  <TableCell>{booking.location}</TableCell>
                  <TableCell>{booking.phoneNumber}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewBooking(booking)}
                        aria-label="View booking details"
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditBooking(booking)}
                        aria-label="Edit booking"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleDeleteBooking(booking)}
                        aria-label="Delete booking"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No bookings found matching the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Food:</div>
                <div>{selectedBooking.food.name}</div>
                
                <div className="font-medium">Quantity:</div>
                <div>{selectedBooking.quantity}</div>
                
                <div className="font-medium">Price:</div>
                <div>GHS {selectedBooking.food.price * selectedBooking.quantity}</div>
                
                {selectedBooking.drink && (
                  <>
                    <div className="font-medium">Drink:</div>
                    <div>{selectedBooking.drink}</div>
                  </>
                )}
                
                <div className="font-medium">Payment Mode:</div>
                <div>{selectedBooking.paymentMode}</div>
                
                <div className="font-medium">Location:</div>
                <div>{selectedBooking.location}</div>
                
                {selectedBooking.additionalInfo && (
                  <>
                    <div className="font-medium">Additional Info:</div>
                    <div>{selectedBooking.additionalInfo}</div>
                  </>
                )}
                
                <div className="font-medium">Phone:</div>
                <div>{selectedBooking.phoneNumber}</div>
                
                <div className="font-medium">Delivery Time:</div>
                <div>{new Date(selectedBooking.deliveryTime).toLocaleString()}</div>
                
                <div className="font-medium">Status:</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                
                <div className="font-medium">Created At:</div>
                <div>{new Date(selectedBooking.createdAt).toLocaleString()}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the status for Order ID: {selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editedStatus} onValueChange={setEditedStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={saveBookingEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Order ID: {selectedBooking?.id}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteBooking}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsTable;
