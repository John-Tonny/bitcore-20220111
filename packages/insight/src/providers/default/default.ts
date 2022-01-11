import { Injectable } from '@angular/core';

@Injectable()
export class DefaultProvider {
  private defaults: {
    '%CHAIN%': string;
    '%API_PREFIX%': string;
    '%NETWORK%': string;
    '%NUM_BLOCKS%': string;
    '%COIN_UNIT_FROM_USER%': string;    
  } = {
    '%CHAIN%': process.env.CHAIN || 'VCL',
    '%API_PREFIX%': process.env.API_PREFIX || '/api',
    '%NETWORK%': process.env.NETWORK || 'mainnet',
    '%NUM_BLOCKS%': process.env.NUM_BLOCKS || '15',
    '%COIN_UNIT_FROM_USER%': process.env.COIN_UNIT_FROM_USER || '',
  };

  constructor() {}

  public getDefault(str: string): string {
    return this.defaults[str] !== undefined ? this.defaults[str] : str;
  }

  public setDefault(str: string, value: any): void {
    this.defaults[str] = value;
  }
}
