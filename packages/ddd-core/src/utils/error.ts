import { SigilError, AttachSigil, type sigil, type ExtendSigil } from './sigil';

@AttachSigil('@vicin/ddd-core.DddCoreDevError')
export class DddCoreDevError extends SigilError {
  declare [sigil]: ExtendSigil<'DddCoreDevError', SigilError>;
}
