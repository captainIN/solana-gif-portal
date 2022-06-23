import './App.css';
import { useEffect, useState } from 'react';


const TEST_GIFS = [
  'https://media4.giphy.com/media/l46Cgwa9YZNNrEQla/giphy.gif?cid=ecf05e47a5myd6k2u7epzodo6jjtgmsr7v2f6lgiwyzw7jpg&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/3YIqOC6asAHD3W0Qrt/giphy.gif?cid=ecf05e473iryob4f1vo7vzwbolhq0humvxpklzqtikivsskc&rid=giphy.gif&ct=g',
  'https://media0.giphy.com/media/l0K4lebmhs3n9HW00/giphy.gif?cid=ecf05e47k6f4ccwfm45yklh8vhxpx1v31hixwnxxw1cxgtcn&rid=giphy.gif&ct=g',
  'https://media0.giphy.com/media/3o7qDOUZq9Y21izzW0/giphy.gif?cid=ecf05e47qvw1a5akz5uheuyqoayhoh8frj4q88cnv8gzdr4y&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/mXuPwCWpd2WLV5WCSQ/giphy.gif?cid=ecf05e47qvw1a5akz5uheuyqoayhoh8frj4q88cnv8gzdr4y&rid=giphy.gif&ct=g'
]

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);

      setGifList([...gifList, inputValue]);
      setInputValue('');

    } else {
      console.log('Empty input. Try again.');
    }
  };

  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      {/* Go ahead and add this input and button to start */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendGif();
        }}
      >
        <input
          type="text"
          placeholder="Enter gif link!"
          value={inputValue}
          onChange={onInputChange}
        />
        <button type="submit" className="cta-button submit-gif-button">Submit</button>
      </form>
      <div className="gif-grid">
        {gifList.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );

  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');

      // Call Solana program here.

      // Set state
      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);



  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {/* Render your connect to wallet button right here */}
          {!walletAddress && renderNotConnectedContainer()}

          {walletAddress && renderConnectedContainer()}
        </div>

      </div>
    </div>
  );
};

export default App;
