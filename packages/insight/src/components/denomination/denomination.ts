import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import _ from 'lodash';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
@Component({
  selector: 'denomination',
  templateUrl: 'denomination.html'
})
export class DenominationComponent {
  public units: any = [];
  public availableNetworks;
  public currencySymbol;
  public showUnits = false;

  constructor(
    public viewCtrl: ViewController,
    public api: ApiProvider,
    public navParams: NavParams
  ) {}

  public ionViewDidEnter() {
    this.currencySymbol = this.navParams.data.currencySymbol;
    this.availableNetworks = this.api.networkSettings.availableNetworks;
    this.showUnits = _.some(
      this.availableNetworks,
      this.api.networkSettings.selectedNetwork
    )
      ? true
      : false;
    // john 20211228
    const coin_unit = this.api.getCoinUnitFromUser();
    if(this.api.networkSettings.selectedNetwork.chain !== 'VCL' ||  coin_unit === '' ){
      this.units = [
        this.api.networkSettings.selectedNetwork.chain,
	'm' + this.api.networkSettings.selectedNetwork.chain
      ];
    }else{
      this.units = [
        coin_unit,
        'm' + coin_unit
      ];
    }
  }

  public changeUnit(unit: string): void {
    this.currencySymbol = unit;
    this.viewCtrl.dismiss({
      chainNetwork: this.navParams.data.config,
      currencySymbol: this.currencySymbol
    });
  }

  public changeExplorer(chainNetwork: ChainNetwork): void {
    this.viewCtrl.dismiss({
      chainNetwork,
      currencySymbol: this.currencySymbol
    });
  }
}
