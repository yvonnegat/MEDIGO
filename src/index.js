import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './redux/stores';

// Custom CSS to reset margins and padding
const customCSS = `
  body {
    margin: 0;
    padding: 0;
  }
`;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <style>{customCSS}</style>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
