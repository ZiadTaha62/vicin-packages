// import { Sigil, AttachSigil, type sigil, type ExtendSigil } from '@vicin/sigil';
// import type { DomainObjectType } from './types';
// import type { JsonValue } from './types';
// import { toString } from './helpers';

// @AttachSigil('@vicin/lib-core.DomainObject')
// export abstract class DomainObject extends Sigil {
//   declare [sigil]: ExtendSigil<'DomainObject', Sigil>;

//   get [Symbol.toStringTag]() {
//     return 'DomainObject';
//   }

//   static readonly domainType: DomainObjectType;
//   abstract readonly domainType: DomainObjectType;

//   abstract toJSON(): JsonValue;

//   override toString(): string {
//     return toString(this.toJSON());
//   }
// }
