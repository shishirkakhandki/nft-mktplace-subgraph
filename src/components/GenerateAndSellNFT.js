import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import Marketplace from "../Marketplace.json";
import axios from 'axios';
import Navbar from "./Navbar";

// Components
import Spinner from 'react-bootstrap/Spinner';
// import Navigation from './components/Navigation';

// ABIs
import NFT from './abis/NFT.json'

// Config
// import config from './config.json';

export default function GenerateAndSellNFT() {
  // const [formParams, updateFormParams] = useState({
  //   name: "",
  //   description: "",
  //   price: "",
  // });
  const [provider, setProvider] = useState(null)
    const [message1, updateMessage] = useState("");
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [url, setURL] = useState(null)

  const [message, setMessage] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)

  // const loadBlockchainData = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum)
  //   setProvider(provider)

  //   const network = await provider.getNetwork()

  //   const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider)
  //   setNFT(nft)
  // }

  const submitHandler = async (e) => {
    e.preventDefault()

    if (name === "" || description === "") {
      window.alert("Please provide a name and description")
      return
    }

    setIsWaiting(true)

    // Call AI API to generate a image based on description
    const imageData = await createImage()

    // Upload image to IPFS (NFT.Storage)
    const url = await uploadImage(imageData)

    // Mint NFT
    await mintImage(url)

    setIsWaiting(false)
    setMessage("")
  }

  const createImage = async () => {
    setMessage("Generating Image...")

    // You can replace this with different model API's
    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`

    // Send the request
    const response = await axios({
      url: URL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        inputs: description, options: { wait_for_model: true },
      }),
      responseType: 'arraybuffer',
    })

    const type = response.headers['content-type']
    const data = response.data

    const base64data = Buffer.from(data).toString('base64')
    const img = `data:${type};base64,` + base64data // <-- This is so we can render it on the page
    setImage(img)

    return data
  }

  const uploadImage = async (imageData) => {
    setMessage("Uploading Image...")

    // Create instance to NFT.Storage
    // const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })

    // // Send request to store image
    // const { ipnft } = await nftstorage.store({
    //   image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
    //   name: name,
    //   description: description,
    // })

    // // Save the URL
    // const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    // setURL(url)

    // return url


    var file = new File([imageData], "image.jpeg", { type: "image/jpeg" });
    //check for file extension
    try {
      //upload the file to IPFS
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setURL(response.pinataURL);
        return response.pinataURL
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }



  async function uploadMetadataToIPFS() {
    // const { name, description, price } = formParams;
    // //Make sure that none of the fields are empty
    // if (!name || !description || !price || !fileURL) return;

    const nftJSON = {
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
    }
  }


  const mintImage = async (tokenURI) => {
    setMessage("Waiting for Mint...")

    // const signer = await provider.getSigner()
    // const transaction = await nft.connect(signer).mint(tokenURI, { value: ethers.utils.parseUnits("1", "ether") })
    // await transaction.wait()

    try {
      const metadataURL = await uploadMetadataToIPFS();
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      updateMessage("Please wait.. uploading (upto 5 mins)");

      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      //massage the params to be sent to the create NFT request
      const price = ethers.utils.parseUnits("0.18", "ether");
      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();

      //actually create the NFT
      let transaction = await contract.createToken(metadataURL, price, {
        value: listingPrice,
      });
      await transaction.wait();

      alert("Successfully listed your NFT!");
      updateMessage("");
    //  updateFormParams({ name: "", description: "", price: "" });
      window.location.replace("/");
    } catch (e) {
      alert("Upload error" + e);
    }

  }

  // useEffect(() => {
  //   loadBlockchainData()
  // }, [])

  return (
    <div>
  <Navbar></Navbar>

      <div className='form'>
        <form onSubmit={submitHandler}>
          <input type="text" placeholder="Create a name..." onChange={(e) => { setName(e.target.value) }} />
          <input type="text" placeholder="Create a description..." onChange={(e) => setDescription(e.target.value)} />
          <input type="submit" value="Create & Mint" />
        </form>

        <div className="image">
          {!isWaiting && image ? (
            <img src={image} alt="AI generated image" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {!isWaiting && url && (
        <p>
          View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a>
        </p>
      )}
    </div>
  );
}