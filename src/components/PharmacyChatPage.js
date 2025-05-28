import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Badge,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Send as SendIcon,
  MedicalServices as MedicineIcon,
  ChatBubble as ChatIcon,
  Circle as StatusIcon
} from '@mui/icons-material';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const PharmacyChatPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [pharmacyId, setPharmacyId] = useState(null);
  const [pharmacyName, setPharmacyName] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [productDetails, setProductDetails] = useState({});

  // Check if user is admin and get pharmacy ID
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        const adminPharmacyId = userDoc.data().pharmacyId || null;
        setPharmacyId(adminPharmacyId);
        setPharmacyName(userDoc.data().name || 'Pharmacy');

        if (adminPharmacyId) {
          fetchActiveChats(adminPharmacyId);
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  // Fetch all active chats for this pharmacy
  const fetchActiveChats = (pharmacyId) => {
    const chatsQuery = query(
      collection(db, 'chatSummaries'),
      where('pharmacyId', '==', pharmacyId),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get product details for each chat
      const chatWithProducts = await Promise.all(
        chatsData.map(async (chat) => {
          // Check if we already have this product's details
          if (!productDetails[chat.productId]) {
            try {
              const productDoc = await getDoc(doc(db, 'products', chat.productId));
              if (productDoc.exists()) {
                setProductDetails(prev => ({
                  ...prev,
                  [chat.productId]: productDoc.data()
                }));
              }
            } catch (err) {
              console.error('Error fetching product details:', err);
            }
          }
          return chat;
        })
      );
      
      setActiveChats(chatWithProducts);
    });

    return unsubscribe;
  };

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    
    const chatId = selectedChat.chatId;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messagesList);
      
      // Mark unread messages as read
      markMessagesAsRead(chatId);
    });
    
    return () => unsubscribe();
  }, [selectedChat]);
  
  // Mark messages as read when pharmacy views them
  const markMessagesAsRead = async (chatId) => {
    try {
      // Get all unread messages from user
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef,
        where('sender', '==', 'user'),
        where('read', '==', false)
      );
      
      const unreadMessages = await getDocs(q);
      
      // Mark each as read
      unreadMessages.docs.forEach(async (message) => {
        await updateDoc(doc(db, 'chats', chatId, 'messages', message.id), {
          read: true
        });
      });
      
      // Update chat summary
      const chatSummaryQuery = query(
        collection(db, 'chatSummaries'),
        where('chatId', '==', chatId)
      );
      
      const chatSummaries = await getDocs(chatSummaryQuery);
      chatSummaries.docs.forEach(async (chatSummary) => {
        await updateDoc(doc(db, 'chatSummaries', chatSummary.id), {
          unreadByPharmacy: false
        });
      });
      
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const chatId = selectedChat.chatId;
    
    try {
      // Add message to subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        sender: 'pharmacy',
        pharmacyId: pharmacyId,
        pharmacyName: pharmacyName,
        userId: selectedChat.userId,
        productId: selectedChat.productId,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update the chat summary
      const chatSummaryQuery = query(
        collection(db, 'chatSummaries'),
        where('chatId', '==', chatId)
      );
      
      const chatSummaries = await getDocs(chatSummaryQuery);
      chatSummaries.docs.forEach(async (chatSummary) => {
        await updateDoc(doc(db, 'chatSummaries', chatSummary.id), {
          lastMessage: newMessage,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSender: 'pharmacy',
          unreadByUser: true,
          unreadByPharmacy: false
        });
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter chats based on tab selection
  const filteredChats = activeChats.filter(chat => {
    if (tabValue === 0) return true; // All chats
    if (tabValue === 1) return chat.unreadByPharmacy; // Unread chats
    return false;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } 
    // Less than a week
    else if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    } 
    // More than a week
    else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2FB8A0', fontWeight: 'bold' }}>
        Customer Chat Center
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ height: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: '#2FB8A0', 
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChatIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Customer Conversations
              </Typography>
              <Badge 
                badgeContent={activeChats.filter(c => c.unreadByPharmacy).length} 
                color="error"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Box sx={{ p: 1 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth"
              >
                <Tab label="All" />
                <Tab 
                  label={
                    <Badge 
                      badgeContent={activeChats.filter(c => c.unreadByPharmacy).length} 
                      color="error"
                    >
                      <Box sx={{ pr: 1 }}>Unread</Box>
                    </Badge>
                  } 
                />
              </Tabs>
            </Box>
            
            <Divider />
            
            <List sx={{ overflow: 'auto', flex: 1 }}>
              {filteredChats.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No conversations yet
                  </Typography>
                </Box>
              ) : (
                filteredChats.map((chat) => (
                  <React.Fragment key={chat.id}>
                    <ListItem 
                      button 
                      onClick={() => handleSelectChat(chat)}
                      selected={selectedChat?.id === chat.id}
                      sx={{ 
                        bgcolor: chat.unreadByPharmacy ? '#f0f7f5' : 'transparent',
                        '&.Mui-selected': {
                          bgcolor: '#e0f0eb',
                          '&:hover': {
                            bgcolor: '#d0e8e2'
                          }
                        },
                        '&:hover': {
                          bgcolor: '#f5f5f5'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            chat.unreadByPharmacy && (
                              <StatusIcon sx={{ fontSize: 12, color: '#f44336' }} />
                            )
                          }
                        >
                          <Avatar sx={{ bgcolor: '#5C9EFF' }}>
                            <PersonIcon />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                              variant="subtitle2"
                              sx={{ fontWeight: chat.unreadByPharmacy ? 'bold' : 'normal' }}
                            >
                              {chat.userName || 'Customer'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(chat.lastMessageTimestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ 
                                display: 'inline',
                                color: chat.unreadByPharmacy ? 'text.primary' : 'text.secondary',
                                fontWeight: chat.unreadByPharmacy ? 'medium' : 'normal'
                              }}
                            >
                              {chat.lastMessage?.length > 25 
                                ? `${chat.lastMessage.substring(0, 25)}...` 
                                : chat.lastMessage}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Re: {chat.productName || 'Product'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Chat Messages */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ height: '75vh', display: 'flex', flexDirection: 'column' }}
          >
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#2FB8A0', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#5C9EFF', mr: 1 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedChat.userName || 'Customer'}
                      </Typography>
                      <Typography variant="caption">
                        User ID: {selectedChat.userId.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    icon={<MedicineIcon />} 
                    label={selectedChat.productName || 'Product'} 
                    variant="outlined" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }} 
                  />
                </Box>
                
                {/* Product info */}
                <Card variant="outlined" sx={{ mx: 2, mt: 2 }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <MedicineIcon color="primary" />
                      </Grid>
                      <Grid item xs>
                        <Typography variant="body2">
                          <strong>Product:</strong> {selectedChat.productName}
                        </Typography>
                        {productDetails[selectedChat.productId] && (
                          <Typography variant="caption" color="text.secondary">
                            Price: KSh {productDetails[selectedChat.productId].price} | 
                            Category: {productDetails[selectedChat.productId].category}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* Messages */}
                <Box 
                  sx={{ 
                    p: 2, 
                    flex: 1,
                    overflowY: 'auto',
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {messages.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
                      <Typography align="center" variant="body2" color="text.secondary">
                        No messages in this conversation yet.
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender === 'pharmacy' ? 'flex-end' : 'flex-start',
                          mb: 1.5
                        }}
                      >
                        {message.sender === 'user' && (
                          <Avatar 
                            sx={{ 
                              bgcolor: '#5C9EFF', 
                              width: 32, 
                              height: 32,
                              mr: 1 
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        )}
                        
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 1.5,
                            bgcolor: message.sender === 'pharmacy' ? '#2FB8A0' : 'white',
                            color: message.sender === 'pharmacy' ? 'white' : 'text.primary',
                            borderRadius: 2,
                            boxShadow: 1
                          }}
                        >
                          <Typography variant="body2">{message.text}</Typography>
                          <Typography 
                            variant="caption" 
                            color={message.sender === 'pharmacy' ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                            sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
                          >
                            {message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                          </Typography>
                        </Box>
                        
                        {message.sender === 'pharmacy' && (
                          <Avatar 
                            sx={{ 
                              bgcolor: '#2FB8A0', 
                              width: 32, 
                              height: 32,
                              ml: 1 
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
                
                {/* Input Area */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    bgcolor: 'white'
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    variant="outlined"
                    multiline
                    maxRows={3}
                  />
                  <IconButton
                    color="primary"
                    sx={{ ml: 1, bgcolor: '#2FB8A0', color: 'white', '&:hover': { bgcolor: '#5C9EFF' } }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
                <ChatIcon sx={{ fontSize: 60, color: '#2FB8A0', opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start chatting
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Respond to customer inquiries about your products
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PharmacyChatPage;