import { expectAssignable } from 'tsd';
import { assertors } from '../../dist';
import type { Identity, __Phantom, __Tag, __Label } from '../../dist';

declare const __User: unique symbol;
type User = Identity.Declare<typeof __User, 'User'>;

expectAssignable<true>(true);
