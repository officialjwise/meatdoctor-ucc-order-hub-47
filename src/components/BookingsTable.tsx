import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { BellRing } from 'lucide-react';
import { toast } from "sonner";

const BACKEND_URL = 'http://localhost:4000';

const BookingsTable = ({ bookings, onBookingsUpdate }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [previousBookingsCount, setPreviousBookingsCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  
  useEffect(() => {
    console.log('Bookings data:', bookings);
    setPreviousBookingsCount(bookings.length);
  }, [bookings]);

  useEffect(() => {
    if (previousBookingsCount > 0 && bookings.length > previousBookingsCount) {
      setHasNewNotification(true);
      toast(
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4" />
          <span>New order received!</span>
        </div>,
        {
          description: "You have a new order to process.",
          action: {
            label: "View",
            onClick: () => {
              setHasNewNotification(false);
              setStatusFilter("Pending");
            },
          },
        }
      );
    }
    setPreviousBookingsCount(bookings.length);
  }, [bookings.length]);

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter !== "all" && booking.order_status !== statusFilter) {
      return false;
    }
    if (dateFilter) {
      const bookingDate = new Date(booking.created_at).toISOString().split('T')[0];
      if (bookingDate !== dateFilter) {
        return false;
      }
    }
    return true;
  });

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setEditedStatus(booking.order_status);
    setEditModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update order status (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to update order status (Status: ${response.status}) - Unexpected response format`);
        }
      }

      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      onBookingsUpdate();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="relative">
          {hasNewNotification && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
            >
              !
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            className={hasNewNotification ? "animate-pulse" : ""}
            onClick={() => {
              setHasNewNotification(false);
              setStatusFilter("Pending");
            }}
          >
            <BellRing className="h-4 w-4" />
            <span className="sr-only">View new notifications</span>
          </Button>
        </div>
      </div>

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
              <SelectItem value="Processing">Processing</SelectItem>
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
                  <TableCell className="font-medium">{booking.order_id}</TableCell>
                  <TableCell>
                    <span>
                      {booking.food?.name?.length > 20 
                        ? `${booking.food.name.slice(0, 20)}...` 
                        : booking.food?.name || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>{booking.delivery_location}</TableCell>
                  <TableCell>{booking.phone_number}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.order_status)}`}>
                      {booking.order_status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
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

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedBooking?.order_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Food:</div>
                <div>{selectedBooking.food?.name || 'N/A'}</div>
                
                <div className="font-medium">Quantity:</div>
                <div>{selectedBooking.quantity}</div>
                
                {selectedBooking.addonDetails && selectedBooking.addonDetails.length > 0 && (
                  <>
                    <div className="font-medium">Addons:</div>
                    <div>
                      {selectedBooking.addonDetails.map((addon, index) => (
                        <div key={index}>
                          {addon.name} (GHS {addon.price?.toFixed(2)})
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {selectedBooking.drink && (
                  <>
                    <div className="font-medium">Drink:</div>
                    <div>{selectedBooking.drink}</div>
                  </>
                )}
                
                <div className="font-medium">Total Price:</div>
                <div>GHS {selectedBooking.totalPrice?.toFixed(2) || '0.00'}</div>
                
                <div className="font-medium">Payment Mode:</div>
                <div>{selectedBooking.payment_mode}</div>
                
                <div className="font-medium">Location:</div>
                <div>{selectedBooking.delivery_location}</div>
                
                <div className="font-medium">Phone:</div>
                <div>{selectedBooking.phone_number}</div>
                
                <div className="font-medium">Delivery Time:</div>
                <div>{new Date(selectedBooking.delivery_time).toLocaleString()}</div>
                
                <div className="font-medium">Status:</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedBooking.order_status)}`}>
                    {selectedBooking.order_status}
                  </span>
                </div>
                
                <div className="font-medium">Created At:</div>
                <div>{new Date(selectedBooking.created_at).toLocaleString()}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the status for Order ID: {selectedBooking?.order_id}
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
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedBooking) {
                handleStatusChange(selectedBooking.id, editedStatus);
                setEditModalOpen(false);
              }
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsTable;