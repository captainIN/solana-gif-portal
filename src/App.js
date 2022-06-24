import './App.css';
import { useEffect, useState } from 'react';

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { BN, Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json'
import kp from './keypair.json'
import { v4 as uuidv4 } from 'uuid';
import Card from './components/Card';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".

/*
 * This preflightCommitment: "processed" thing is interesting. 
 * You can read on it a little here. Basically, we can actually 
 * choose when to receive a confirmation for when our transaction has succeeded. 
 * Because the blockchain is fully decentralized, we can choose how long 
 * we want to wait for a transaction. Do we want to wait for just one node 
 * to acknowledge our transaction? Do we want to wait for the whole Solana 
 * chain to acknowledge our transaction?

 * In this case, we simply wait for our transaction to be confirmed by the 
 * node we're connected to. This is generally okay — but if you wanna be 
 * super super sure you may use something like "finalized" instead. 
 * For now, let's roll with "processed".
*/
const opts = {
  preflightCommitment: "processed"
}

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

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }
  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();

    } catch (error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

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
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(uuidv4(), inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  const sendComment = async (item_id, content, next) => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      let modified_time_stamp  = new BN(Date.now());
      await program.rpc.addComment(item_id, content, modified_time_stamp, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      next();
      await getGifList();
    }catch(error){
      console.log("Error sending comment:", error)
    }
  }

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

  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    } else {
      return (
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
            {gifList.map((item, index) => (
              <Card item={item} key={index} sendComment={sendComment}/>
            ))}
          </div>
        </div>)
    }

  };

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

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account)
      setGifList(account.gifList)

    } catch (error) {
      console.log("Error in getGifList: ", error)
      setGifList(null);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList();
    }
  }, [walletAddress]);



  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">GIFsocial</p>
          <p className="sub-text">
            Socialising Metaverse✨
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
