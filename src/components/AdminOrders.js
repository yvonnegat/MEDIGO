import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc,getDoc } from "firebase/firestore";
import {
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText
} from "@mui/material";

const AdminOrders = ({ pharmacyId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!pharmacyId) return;

      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const fetchedOrders = querySnapshot.docs
          .map(doc => ({ id: doc.id, userId: doc.data().userId, ...doc.data() })) // Ensure userId exists
          .filter(order => order.cart?.some(item => item.pharmacyId === pharmacyId));

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pharmacyId]);

  const handleStatusChange = async (orderId, userId, newStatus) => {
    if (!newStatus) {
      console.error("Error: Status cannot be undefined or empty");
      return;
    }
  
    if (!userId) {
      console.error(`Error: Missing userId for order ${orderId}`);
      return;
    }
  
    console.log(`Updating order ${orderId} for user ${userId} to ${newStatus}`);
  
    try {
      const orderRef = doc(db, "orders", orderId);
      const userOrderRef = doc(db, `users/${userId}/transactions`, orderId);
  
      // Update the status of the order in the 'orders' collection
      await updateDoc(orderRef, { status: newStatus });
  
      // Update the status of the order in the user's transaction subcollection
      const userOrderDoc = await getDoc(userOrderRef);
      if (userOrderDoc.exists()) {
        await updateDoc(userOrderRef, { status: newStatus });
        console.log("Order status updated in the user's transactions.");
      } else {
        console.error("Error: User transaction document does not exist.");
      }
  
      // Update UI
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
  
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Orders for Your Pharmacy
      </Typography>

      {orders.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Order ID</b></TableCell>
                <TableCell><b>User Email</b></TableCell>
                <TableCell><b>Ordered Items</b></TableCell>
                <TableCell><b>Status</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.userEmail || "Unknown"}</TableCell>
                  <TableCell>
                    <List dense>
                      {order.cart?.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${item.name} - Qty: ${item.quantity}`} />
                        </ListItem>
                      ))}
                    </List>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status || "Pending"} // Ensure status is never undefined
                      onChange={(e) => handleStatusChange(order.id, order.userId, e.target.value)}
                      sx={{ width: 150 }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Processing">Processing</MenuItem>
                      <MenuItem value="Shipped">Shipped</MenuItem>
                      <MenuItem value="Delivered">Delivered</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No orders found.</Typography>
      )}
    </Paper>
  );
};

export default AdminOrders;
