import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from "@mui/material";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const ordersRef = collection(db, "orders");

    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      console.log("Order status updated!");
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>User ID</TableCell>
            <TableCell>Total Price</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.userId}</TableCell>
              <TableCell>Ksh {order.totalPrice}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminOrders;
