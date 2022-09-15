import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { ETHTxProvider } from '../eth';
import { VERC1155Abi } from './abi';
const { toBN } = Web3.utils;

export class VERC1155TxProvider extends ETHTxProvider {
  getERC1155Contract(tokenContractAddress: string) {
    const web3 = new Web3();
    const contract = new web3.eth.Contract(VERC1155Abi as AbiItem[], tokenContractAddress);
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
    const [{ address, amount }] = params.recipients;
    const { id, data } = token;
    var mdata = [];
    /*
    if(!data){
      mdata = new Uint8Arry([]);
    }
      mdata = new Uint8Array(Buffer.from(data));
    }*/
    const tokenIdStr = Number(id).toLocaleString('en', { useGrouping: false });
    const amountStr = Number(amount).toLocaleString('en', { useGrouping: false });
    const xdata = this.getERC1155Contract(tokenAddress)
      .methods.safeTransferFrom(from, address, tokenIdStr, amount, mdata)
      .encodeABI();
    return xdata;
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
    const { tokenAddress } = params;
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
    const [{ address, amount }] = recipients;
    const { id } = token;
    const tokenIdStr = Number(id).toLocaleString('en', { useGrouping: false });
    const amountStr = Number(amount).toLocaleString('en', { useGrouping: false });
    const data = this.getERC1155Contract(tokenAddress)
      .methods.mint( address, tokenIdStr, amountStr)
      .encodeABI();
    return data;
  }


}
