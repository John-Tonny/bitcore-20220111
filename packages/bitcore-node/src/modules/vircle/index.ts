import { BaseModule } from '..';
import { VCLStateProvider } from '../../providers/chain-state/vcl/vcl';
import { VircleP2PWorker } from '../vircle/p2p';
import { VerificationPeer } from '../vircle/VerificationPeer';

export default class VCLModule extends BaseModule {
  constructor(services: BaseModule['bitcoreServices']) {
    super(services);
    services.Libs.register('VCL', 'bitcore-lib-vcl', 'bitcore-p2p-vcl');
    services.P2P.register('VCL', VircleP2PWorker);
    services.CSP.registerService('VCL', new VCLStateProvider());
    services.Verification.register('VCL', VerificationPeer);
  }
}
