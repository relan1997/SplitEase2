import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Transactions from '../Transactions/Transactions';
import Names from '../Names/Names';

const Split = () => {
  const navigate = useNavigate();
  const { groupId } = useParams(); // 👈 Access it once here
  console.log("GroupId", groupId); // 👈 Debugging line
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Invalid token', error);
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <Names groupId={ groupId } />
      <Transactions groupId={ groupId } />
    </>
  );
};

export default Split;
