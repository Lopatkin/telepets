import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background: #fff;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  z-index: 100;
`;

function Header({ user }) {
  return (
    <HeaderContainer>
      <h3>Привет, {user.firstName}!</h3>
      <p>ID: {user.id}</p>
    </HeaderContainer>
  );
}

export default Header;