import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { setAccessToken } from '../accessToken';
import { useLoginMutation } from '../generated/graphql';

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login] = useLoginMutation();
  return (
    <form
      onSubmit={async (e) => {
        console.log('form submitted');
        e.preventDefault();
        const response = await login({
          variables: {
            email,
            password,
          },
        });
        history.push('/');
        console.log(response);
        if (response && response.data) {
          setAccessToken(response.data.login.accessToken);
        }
      }}
    >
      <div>
        <input
          value={email}
          placeholder="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          placeholder="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <div>
        <button type="submit"> login</button>
      </div>
    </form>
  );
};
