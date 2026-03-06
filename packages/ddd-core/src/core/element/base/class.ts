import { DomainObject, toJSON, type JsonValue } from '../../base';
import { AttachSigil, type sigil, type ExtendSigil } from '@vicin/sigil';
import type { DomainElementType, DomainElementValue } from './types';

@AttachSigil('@vicin/ddd-core.DomainElement')
export abstract class DomainElement extends DomainObject {
  declare [sigil]: ExtendSigil<'DomainElement', DomainObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainElement';
  }

  static override domainType: 'Element' = 'Element';
  override domainType: 'Element' = 'Element';

  static ElementType: DomainElementType;
  abstract ElementType: DomainElementType;

  abstract toValue(): DomainElementValue;

  toJSON(): JsonValue {
    return toJSON(this.toValue());
  }
}
