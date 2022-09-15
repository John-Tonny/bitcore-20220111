import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { ETHTxProvider } from '../eth';
import { VERC721Abi } from './abi';
const { toBN } = Web3.utils;

export class VERC721TxProvider extends ETHTxProvider {
  getERC721Contract(tokenContractAddress: string) {
    const web3 = new Web3();
    const contract = new web3.eth.Contract(VERC721Abi as AbiItem[], tokenContractAddress);
    return contract;
  }

  create(params: {
    recipients: Array<{ address: string; amount: string }>;
    nonce: number;
    gasPrice: number;
    data: string;
    gasLimit: number;
    network: string;
    chainId?: number;
    tokenAddress: string;
    token: any;
    from: string;
  }) {
    const { tokenAddress } = params;
    const data = this.encodeData(params);
    const recipients = [{ address: tokenAddress, amount: '0' }];
    const newParams = { ...params, recipients, data };
    return super.create(newParams);
  }

  encodeData(params: {
    recipients: Array<{ address: string; amount: string }>;
    tokenAddress: string;
    token: any;
    from: string;
  }) {
    const { recipients, tokenAddress, from, token } = params;
    const [{ address }] = recipients;
    const { id } = token;
    const tokenIdStr = Number(id).toLocaleString('en', { useGrouping: false });
    const data = this.getERC721Contract(tokenAddress)
      .methods.safeTransferFrom(from, address, tokenIdStr)
      .encodeABI();
    return data;
  }

  createMintNft(params: {
    recipients: Array<{ address: string; amount: string }>;
    nonce: number;
    gasPrice: number;
    data: string;
    gasLimit: number;
    network: string;
    chainId?: number;
    tokenAddress: string;
    token: any;
  }) {
    const { tokenAddress } = params;
    const data = this.encodeMintNftData(params);
    const recipients = [{ address: tokenAddress, amount: '0' }];
    const newParams = { ...params, recipients, data };
    return super.create(newParams);
  }

  encodeMintNftData(params: {
    recipients: Array<{ address: string; amount: string }>;
    tokenAddress: string;
    token: any;
  }) {
    const { recipients, tokenAddress, token } = params;
    const [{ address }] = recipients;
    const { uri } = token;
    const data = this.getERC721Contract(tokenAddress)
      .methods.mintNFT(address, uri)
      .encodeABI();
    return data;
  }

  createMint(params: {
    recipients: Array<{ address: string; amount: string }>;
    nonce: number;
    gasPrice: number;
    data: string;
    gasLimit: number;
    network: string;
    chainId?: number;
    tokenAddress: string;
    token: any;
  }) {
    const { tokenAddress, token } = params;
    const data = this.encodeMintData(params);
    const recipients = [{ address: tokenAddress, amount: '0' }];
    const newParams = { ...params, recipients, data };
    return super.create(newParams);
  }

  encodeMintData(params: {
    recipients: Array<{ address: string; amount: string }>;
    tokenAddress: string;
    token: any;
  }) {
    const { recipients, tokenAddress, token } = params;
    const [{ address }] = recipients;
    const { id, uri } = token;
    const tokenIdStr = Number(id).toLocaleString('en', { useGrouping: false });
    const data = this.getERC721Contract(tokenAddress)
      .methods.mint( address, tokenIdStr, uri)
      .encodeABI();
    return data;
  }


}
