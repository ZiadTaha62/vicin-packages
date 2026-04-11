import { Sigil, AttachSigil, type sigil, type ExtendSigil } from '../sigil';

@AttachSigil('@vicin/ddd-core.PlainBase')
export class PlainBase extends Sigil {
  declare [sigil]: ExtendSigil<'PlainBase', Sigil>;
}
