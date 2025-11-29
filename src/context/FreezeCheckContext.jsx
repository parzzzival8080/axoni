import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import { API_BASE_URL, API_KEY } from '../config';

const FreezeCheckContext = createContext();

export const useFreezeCheck = () => useContext(FreezeCheckContext);

export const FreezeCheckProvider = ({ children }) => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [freezeMessage, setFreezeMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      if (token && user?.email) {
        try {
          const response = await axios.get(`${API_BASE_URL}/freeze-check?apikey=${API_KEY}&email=${user.email}`);

          // Handle different response statuses
          if (response.data.status === 'error' || response.data.error === 'User Not Found') {
            setIsFrozen(true);
            setFreezeMessage('Session expired. Kindly log in again.');
          } else if (response.data.status === 'success' || response.data.status === 'not freeze') {
            setIsFrozen(false);
            setFreezeMessage('');
          } else if (response.data.status === 'freeze') {
            // User is frozen - show freeze message with session expired
            setIsFrozen(true);
            setFreezeMessage('Session expired. Kindly log in again.');
          }
        } catch (error) {
          console.error('Error checking freeze status:', error);
          setIsFrozen(true);
          setFreezeMessage('Session expired. Kindly log in again.');
        }
      }
    };

    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsFrozen(false);
    setFreezeMessage('');
    navigate('/login');
  };

  return (
    <FreezeCheckContext.Provider value={{}}>
      {children}
      <Modal
        isOpen={isFrozen}
        onClose={handleLogout} // Prevent closing without logging out
        title="Prompt"
      >
        <p>{freezeMessage || 'Session expired. Kindly log in again.'}</p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '20px',
            backgroundColor: '#F0B90B',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Return to Login
        </button>
      </Modal>
    </FreezeCheckContext.Provider>
  );
};
