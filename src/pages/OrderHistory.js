import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Avatar, Box } from "@mui/material";
import { styled } from "@mui/system";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Styled Components for Layout
const PageWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh", // Ensures full height
});

const ContentWrapper = styled("div")({
  flex: "1", // Pushes the footer down
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  width: "100%", // Ensures full width
  maxWidth: "1200px", // Prevents stretching on larger screens
  margin: "auto", // Centers content
});

// Styled Paper for Claymorphic Effect
const StyledPaper = styled(Paper)({
  background: "#EDE8DC",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "6px 6px 12px rgba(177, 127, 89, 0.3), -6px -6px 12px rgba(255, 255, 255, 0.8)",
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto", // Enables horizontal scroll if needed
});

// Styled Table Cell for Responsive Font Sizes
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "#B17F59",
  fontWeight: "bold",
  fontSize: "16px",
  [theme.breakpoints.down("sm")]: {
    fontSize: "12px", // Smaller text on mobile
  },
}));

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const transactionsRef = collection(db, `users/${user.uid}/transactions`);
      const q = query(transactionsRef);

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched Orders:", fetchedOrders);
        setOrders(fetchedOrders);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <PageWrapper>
      <Header />
      <ContentWrapper>
        <StyledPaper>
          <Typography variant="h5" gutterBottom sx={{ color: "#A5B68D", fontWeight: "bold", textAlign: "center" }}>
            Order History
          </Typography>
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#C1CFA1" }}>
                  <StyledTableCell>Transaction ID</StyledTableCell>
                  <StyledTableCell>Product</StyledTableCell>
                  <StyledTableCell>Quantity</StyledTableCell>
                  <StyledTableCell>Total Price</StyledTableCell>
                  <StyledTableCell>Payment Method</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const items = order.cart || order.items || [];

                  return items.map((item, index) => (
                    <TableRow key={`${order.id}-${index}`} sx={{ backgroundColor: "#EDE8DC" }}>
                      <TableCell>{index === 0 ? order.id : ""}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar src={item.imageUrl || ""} alt={item.name || "Product"} sx={{ width: 40, height: 40, borderRadius: "10px" }} />
                          {item.name || "Unknown Product"}
                        </Box>
                      </TableCell>
                      <TableCell>{item.quantity || 1}</TableCell>
                      <TableCell>{index === 0 ? `Ksh ${order.totalPrice || "N/A"}` : ""}</TableCell>
                      <TableCell>{index === 0 ? order.paymentMethod || "N/A" : ""}</TableCell>
                      <TableCell>{index === 0 ? order.status || "Pending" : ""}</TableCell>
                      <TableCell>
                        {index === 0 && order.timestamp ? new Date(order.timestamp.toDate()).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledPaper>
      </ContentWrapper>
      <Footer />
    </PageWrapper>
  );
};

export default OrderHistory;
