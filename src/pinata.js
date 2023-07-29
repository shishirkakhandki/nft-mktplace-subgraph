//require('dotenv').config();

import { create } from "ipfs-http-client";
const key = "4e011c1c01b8cb29c336";
const secret =
  "d684f5378122f452d52c9d35fa42c988522526853074fb39eeb884b3090a7e85";

const axios = require("axios");
const FormData = require("form-data");

const projectId = "2LRaaQpwIq9ojv0BiUxTILbHSNV";
const projectSecret = "efd3ed8fc5c0e01337cb6d1425ce8f3b";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  apiPath: "/api/v0",
  headers: {
    authorization: auth,
  },
});

export const uploadJSONToIPFS = async (JSONBody) => {
  // const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  //making axios POST request to Pinata ⬇️
  // return axios
  //   .post(url, JSONBody, {
  //     headers: {
  //       pinata_api_key: key,
  //       pinata_secret_api_key: secret,
  //     },
  //   })
  //   .then(function (response) {
  //     return {
  //       success: true,
  //       pinataURL:
  //         "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
  //     };
  //   })

  try {
    let data = new FormData();

    const metadata = JSON.stringify(JSONBody);
    const added = await client.add(metadata);
    //  pinataURL = `https://ai-marketplace.infura-ipfs.io/ipfs/${added.path}`;
    return {
      success: true,
      pinataURL: `https://ai-marketplace.infura-ipfs.io/ipfs/${added.path}`,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const uploadFileToIPFS = async (file) => {
  //  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  //making axios POST request to Pinata ⬇️

  // try {
  //   const added = await client.add(JSONBody);
  //   //  pinataURL = `https://ai-marketplace.infura-ipfs.io/ipfs/${added.path}`;
  //   return {
  //     success: true,
  //     pinataURL: `https://ai-marketplace.infura-ipfs.io/ipfs/${added.path}`,
  //   };
  // } catch (error) {
  //   console.log(error);
  //   return {
  //     success: false,
  //     message: error.message,
  //   };
  // }

  // let data = new FormData();
  // data.append("file", file);

  // const metadata = JSON.stringify({
  //   name: "testname",
  //   keyvalues: {
  //     exampleKey: "exampleValue",
  //   },
  // });
  // data.append("pinataMetadata", metadata);

  // //pinataOptions are optional
  // const pinataOptions = JSON.stringify({
  //   cidVersion: 0,
  //   customPinPolicy: {
  //     regions: [
  //       {
  //         id: "FRA1",
  //         desiredReplicationCount: 1,
  //       },
  //       {
  //         id: "NYC1",
  //         desiredReplicationCount: 2,
  //       },
  //     ],
  //   },
  // });
  // data.append("pinataOptions", pinataOptions);

  try {
    const added = await client.add(file);
    //  pinataURL = `https://ai-marketplace.infura-ipfs.io/ipfs/${added.path}`;
    return {
      success: true,
      pinataURL: `https://ai-marketplace.infura-ipfs.io/ipfs/${added.path}`,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }

  // return axios
  //   .post(url, data, {
  //     maxBodyLength: "Infinity",
  //     headers: {
  //       "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
  //       pinata_api_key: key,
  //       pinata_secret_api_key: secret,
  //     },
  //   })
  //   .then(function (response) {
  //     console.log("image uploaded", response.data.IpfsHash);
  //     return {
  //       success: true,
  //       pinataURL:
  //         "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
  //     };
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   });
};
