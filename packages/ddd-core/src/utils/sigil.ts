import { RECOMMENDED_LABEL_REGEX } from '@vicin/sigil';

/** Label regex used by 'Sigil' library to validate passed labels */
export const SIGIL_RECOMMENDED_LABEL_REGEX = RECOMMENDED_LABEL_REGEX;

export {
  updateSigilOptions,
  Sigil,
  SigilError,
  AttachSigil,
  attachSigil,
  type sigil,
  type ExtendSigil,
  type SigilOptions,
} from '@vicin/sigil';
