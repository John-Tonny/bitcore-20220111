import { InternalStateProvider } from '../internal/internal';

export class VCLStateProvider extends InternalStateProvider {
  constructor(chain: string = 'VCL') {
    super(chain);
  }
}
