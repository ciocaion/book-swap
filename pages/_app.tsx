import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '../redux/store';
import '../app/globals.css';




function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
