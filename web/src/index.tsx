import React from 'react';
import ReactDOM from 'react-dom';
import App from './Routes';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { accessToken, getAccessToken } from './accessToken';

// const client = new ApolloClient({
//   uri: 'http://localhost:4000/graphql',
//   credentials: 'include',
//   cache: new InMemoryCache(),
//   req
//     // const accessToken = getAccessToken();
//     // opration.setContext({
//     //   headers: {
//     //     authorization: accessToken ? `bearer ${accessToken}` : '',
//     //   },
//     // });
// });

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      authorization: accessToken ? `bearer ${accessToken}` : '',
    },
  }));

  return forward(operation);
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
});
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
