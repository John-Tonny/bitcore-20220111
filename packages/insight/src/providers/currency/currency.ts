import { Injectable } from '@angular/core';
import { ApiProvider, ChainNetwork } from '../api/api';
import { Logger } from '../logger/logger';

@Injectable()
export class CurrencyProvider {
  public currencySymbol: string;
  public factor = 1;
  public bitstamp: number;
  public kraken: number;
  public loading: boolean;
  public explorers: any = [];

  constructor(private apiProvider: ApiProvider) {}

  public roundFloat(aFloat: number, decimalPlaces: number): number {
    return (
      Math.round(aFloat * Math.pow(10, decimalPlaces)) /
      Math.pow(10, decimalPlaces)
    );
  }

  public setCurrency(chainNetwork?: ChainNetwork, currency?: string): void {
    if (!currency) {
      currency = chainNetwork.chain.toUpperCase();
    }
    const logger = new Logger();
    if (currency !== 'USD') {
      // john
      let chain = chainNetwork.chain.toUpperCase();      
      const coin_unit = this.apiProvider.getCoinUnitFromUser();

      // logger.info(chain);
      // logger.info(coin_unit);
      if(chain === 'VCL'){
        if(coin_unit !== '' ){
          chain = coin_unit;
        }
      }
      this.currencySymbol = currency.startsWith('m') ? 'm' + chain : chain;
    } else {
      this.currencySymbol = 'USD';
    }
    logger.info(this.currencySymbol);
  }

  public getCurrency(): string {
    return this.currencySymbol;
  }

  public getConvertedNumber(value: number, chain): number {
    // TODO: Change this function to make use of satoshis so that we don't have to do all these roundabout conversions.
    switch (chain) {
      case 'ETH':
        value = value * 1e-18;
        break;
      default:
        value = value * 1e-8;
        break;
    }
    if (value === 0.0) {
      return 0;
    }

    let response: number;

    if (this.currencySymbol === 'USD') {
      response = this.roundFloat(value * this.factor, 2);
    } else if (
      this.currencySymbol ===
      'm' + this.apiProvider.networkSettings.selectedNetwork.chain
    ) {
      this.factor = 1000;
      response = this.roundFloat(value * this.factor, 5);
    } else if (this.currencySymbol === 'bits') {
      this.factor = 1000000;
      response = this.roundFloat(value * this.factor, 2);
    } else {
      this.factor = 1;
      response = this.roundFloat(value * this.factor, 8);
    }

    return response;
  }

  /**
   * @deprecated use getConvertedNumber
   */
  public getConversion(value: number): string {
    if (value === 0.0) {
      return '0 ' + this.currencySymbol; // fix value to show
    }

    let response: number;

    if (this.currencySymbol === 'USD') {
      response = this.roundFloat(value * this.factor, 2);
    } else if (
      this.currencySymbol ===
      'm' + this.apiProvider.networkSettings.selectedNetwork.chain
    ) {
      this.factor = 1000;
      response = this.roundFloat(value * this.factor, 5);
    } else if (this.currencySymbol === 'bits') {
      this.factor = 1000000;
      response = this.roundFloat(value * this.factor, 2);
    } else {
      this.factor = 1;
      response = this.roundFloat(value * this.factor, 8);
    }
    return response + ' ' + this.currencySymbol;
  }
}
