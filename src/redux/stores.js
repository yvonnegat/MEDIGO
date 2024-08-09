import { createStore } from 'redux';

// Initial state
const initialState = {
  cart: JSON.parse(localStorage.getItem('cart')) || [], // Fetch cart from localStorage
};

// Actions
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_CART_QUANTITY = 'UPDATE_CART_QUANTITY'; // New action type

// Action creators
export const addToCart = (item) => ({
  type: ADD_TO_CART,
  payload: item,
});

export const removeFromCart = (item) => ({
  type: REMOVE_FROM_CART,
  payload: item,
});

export const updateCartQuantity = (item) => ({ // New action creator
  type: UPDATE_CART_QUANTITY,
  payload: item,
});

// Reducer
const rootReducer = (state = initialState, action) => {
  let newCart;
  switch (action.type) {
    case ADD_TO_CART:
      newCart = [...state.cart, action.payload];
      localStorage.setItem('cart', JSON.stringify(newCart)); // Save updated cart to localStorage
      return { ...state, cart: newCart };

    case REMOVE_FROM_CART:
      newCart = state.cart.filter((cartItem) => cartItem.id !== action.payload.id);
      localStorage.setItem('cart', JSON.stringify(newCart)); // Save updated cart to localStorage
      return { ...state, cart: newCart };

    case UPDATE_CART_QUANTITY:
      newCart = state.cart.map((cartItem) =>
        cartItem.id === action.payload.id ? { ...cartItem, quantity: action.payload.quantity } : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(newCart)); // Save updated cart to localStorage
      return { ...state, cart: newCart };

    default:
      return state;
  }
};

// Create store
const store = createStore(rootReducer);

export default store;
