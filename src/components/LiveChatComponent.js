import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Avatar,
  IconButton, Badge, Tooltip, CircularProgress, Collapse,
  Alert
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  StorefrontOutlined as PharmacyIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import {
  collection, addDoc, query, orderBy, where,
  onSnapshot, serverTimestamp, doc, getDoc,
  writeBatch, updateDoc, getDocs, limit
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const LiveChatComponent = ({ productId, pharmacyId, productName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pharmacyInfo, setPharmacyInfo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [chatId, setChatId] = useState(null);
  const [userAuthorized, setUserAuthorized] = useState(false);
  const messagesEndRef = useRef(null);

  // Sanitize inputs to prevent XSS
  const sanitizeInput = (input) => {
    if (!input) return '';
    // Basic sanitization - in a production app, use a proper sanitizer library
    return input.toString()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Verify user is authorized to access this chat
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        
        try {
          // Get user details
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || user.displayName || 'User');
            
            // Check user authorization based on user role
            const userRole = userData.role || 'user';
            
            // A user can chat about a product if:
            // 1. They're a regular user/customer, or
            // 2. They're the pharmacy admin for this product
            if (
              userRole === 'user' || 
              (userRole === 'admin' && user.uid === pharmacyId)
            ) {
              setUserAuthorized(true);
              
              // Set chat ID in format userId_productId_pharmacyId
              if (userRole === 'user') {
                setChatId(`${user.uid}_${productId}_${pharmacyId}`);
              } else if (userRole === 'admin') {
                // If admin (pharmacy), we need to find the customer's chatId
                const chatQuery = query(
                  collection(db, 'chatSummaries'),
                  where('productId', '==', productId),
                  where('pharmacyId', '==', pharmacyId),
                  limit(1)
                );
                
                const chatSnapshot = await getDocs(chatQuery);
                if (!chatSnapshot.empty) {
                  setChatId(chatSnapshot.docs[0].data().chatId);
                } else {
                  // No existing chat found
                  setError('No chat found for this product');
                }
              }
            } else {
              setError('You are not authorized to access this chat');
              setUserAuthorized(false);
            }
          } else {
            setUserName(user.displayName || 'User');
            // Assuming a new user should be allowed to chat as regular user
            setUserAuthorized(true);
            setChatId(`${user.uid}_${productId}_${pharmacyId}`);
          }
        } catch (err) {
          console.error('Error verifying user authorization:', err);
          setError('Failed to verify access. Please try again.');
          setUserAuthorized(false);
        }
      } else {
        setUserId(null);
        setUserName('Guest');
        setUserAuthorized(false);
        setError('Please sign in to chat with the pharmacy');
      }
    });
    
    return () => unsubscribe();
  }, [productId, pharmacyId]);

  // Fetch pharmacy info
  useEffect(() => {
    if (pharmacyId) {
      const getPharmacyInfo = async () => {
        try {
          const pharmacyDoc = await getDoc(doc(db, 'pharmacies', pharmacyId));
          if (pharmacyDoc.exists()) {
            setPharmacyInfo(pharmacyDoc.data());
          } else {
            setError('Pharmacy information not found');
          }
        } catch (err) {
          console.error('Error fetching pharmacy info:', err);
          setError('Failed to load pharmacy information');
        }
      };
      getPharmacyInfo();
    }
  }, [pharmacyId]);

  // Message listener
  useEffect(() => {
    if (!isOpen || !userId || !chatId || !userAuthorized) return;
    
    setLoading(true);
    setError(null);

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messagesList);
      setLoading(false);

      // Count unread messages and mark them as read if chat is open
      const unreadMessages = messagesList.filter(
        msg => msg.sender === 'pharmacy' && !msg.read
      );
      
      if (isOpen && unreadMessages.length > 0) {
        // Mark messages as read in batches
        const batch = writeBatch(db);
        unreadMessages.forEach(msg => {
          const msgRef = doc(db, 'chats', chatId, 'messages', msg.id);
          batch.update(msgRef, { read: true });
        });
        
        try {
          await batch.commit();
          
          // Update chat summary to reflect read status
          const summaryQuery = query(
            collection(db, 'chatSummaries'),
            where('chatId', '==', chatId),
            limit(1)
          );
          
          const summarySnapshot = await getDocs(summaryQuery);
          if (!summarySnapshot.empty) {
            const summaryRef = doc(db, 'chatSummaries', summarySnapshot.docs[0].id);
            await updateDoc(summaryRef, { 
              unreadByUser: false,
              lastCheckedByUser: serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Error marking messages as read:', err);
        }
        
        setUnreadCount(0);
      } else if (!isOpen) {
        setUnreadCount(unreadMessages.length);
      }
    }, (err) => {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, userId, chatId, userAuthorized]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !chatId || !userAuthorized || !pharmacyId) return;
  
    // Validate message length
    if (newMessage.length > 1000) {
      setError('Message is too long (maximum 1000 characters)');
      return;
    }
  
    const sanitizedMessage = sanitizeInput(newMessage);
    if (!sanitizedMessage) return;
  
    try {
      const userRole = await getUserRole();
      // Only admin role can send as pharmacy
      const isSenderPharmacy = userRole === 'admin';
      const sender = isSenderPharmacy ? 'pharmacy' : 'user';
      
      // Ensure pharmacyId is not undefined
      if (!pharmacyId) {
        setError('Pharmacy ID is required');
        return;
      }
  
      // Add message to chat
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: sanitizedMessage,
        sender,
        userId,
        userName: sanitizeInput(userName),
        pharmacyId, // Make sure this is valid
        productId,
        productName: sanitizeInput(productName),
        timestamp: serverTimestamp(),
        read: false
      });
  
      // Update or create chat summary
      const summaryQuery = query(
        collection(db, 'chatSummaries'),
        where('chatId', '==', chatId),
        limit(1)
      );
  
      const summarySnapshot = await getDocs(summaryQuery);
      
      if (!summarySnapshot.empty) {
        // Update existing summary
        const summaryRef = doc(db, 'chatSummaries', summarySnapshot.docs[0].id);
        await updateDoc(summaryRef, {
          lastMessage: sanitizedMessage,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSender: sender,
          unreadByPharmacy: sender === 'user',
          unreadByUser: sender === 'pharmacy'
        });
      } else {
        // Create new summary
        await addDoc(collection(db, 'chatSummaries'), {
          chatId,
          userId,
          userName: sanitizeInput(userName),
          pharmacyId, // Ensure it's passed correctly
          productId,
          productName: sanitizeInput(productName),
          lastMessage: sanitizedMessage,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSender: sender,
          unreadByPharmacy: sender === 'user',
          unreadByUser: sender === 'pharmacy'
        });
      }
  
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };
  
  
  // Helper function to get user role
  const getUserRole = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().role || 'user';
      }
      return 'user';
    } catch (err) {
      console.error('Error getting user role:', err);
      return 'user';
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Icon  */}
      <Tooltip title="Chat with Pharmacy">
        <Badge
          badgeContent={unreadCount}
          color="secondary"
          overlap="circular"
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 1000
          }}
        >
          <IconButton
            onClick={toggleChat}
            color="primary"
            sx={{
              bgcolor: '#2FB8A0',
              color: 'white',
              width: 56,
              height: 56,
              boxShadow: 3,
              '&:hover': {
                bgcolor: '#5C9EFF'
              }
            }}
          >
            <ChatIcon />
          </IconButton>
        </Badge>
      </Tooltip>

      {/* Chat Box */}
      <Collapse
        in={isOpen}
        sx={{
          position: 'fixed',
          bottom: 80,
          left: 20,
          width: { xs: '85%', sm: 350 },
          maxWidth: 350,
          zIndex: 1000,
          boxShadow: 5,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Paper sx={{ maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            p: 1.5,
            bgcolor: '#2FB8A0',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box display="flex" alignItems="center">
              <PharmacyIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {pharmacyInfo?.name || 'Pharmacy Chat'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ bgcolor: '#f0f7f5', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              Chatting about: <strong>{productName}</strong>
            </Typography>
          </Box>

          {/* Error Banner */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ m: 1 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box sx={{
            p: 2,
            height: 300,
            overflowY: 'auto',
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {loading && messages.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={30} color="primary" />
              </Box>
            ) : !userAuthorized ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
                <ErrorIcon color="error" sx={{ mb: 1 }} />
                <Typography color="error" variant="body2">
                  You are not authorized to access this chat
                </Typography>
              </Box>
            ) : messages.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" p={2}>
                <Typography align="center" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No messages yet. Start a conversation with the pharmacy about this product.
                </Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1.5
                  }}
                >
                  {message.sender === 'pharmacy' && (
                    <Avatar sx={{ bgcolor: '#2FB8A0', width: 32, height: 32, mr: 1 }}>
                      <PharmacyIcon fontSize="small" />
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 1.5,
                      bgcolor: message.sender === 'user' ? '#5C9EFF' : 'white',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      boxShadow: 1
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                      sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
                    >
                      {message.timestamp?.toDate ? 
                        new Date(message.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                        ''}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
            <TextField
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              fullWidth
              size="small"
              placeholder={userAuthorized ? "Type a message" : "Please sign in to chat"}
              variant="outlined"
              disabled={!userAuthorized}
              error={newMessage.length > 1000}
              helperText={newMessage.length > 1000 ? "Message too long" : ""}
            />
            <IconButton 
              color="primary" 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || !userAuthorized}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
};

export default LiveChatComponent;