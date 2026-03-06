import type { JsonSerializer, JsonValue } from '../../base';

export type DomainElementType = 'ValueObject' | 'Entity' | 'AggregateRoot' | 'Map' | 'Set';

export type DomainElementValue = JsonValue | JsonSerializer;

type DomainElementSerializerItem = {
  toValue(): DomainElementValue;
};
type DomainElementSerializerObject = { [Key in string]: DomainElementSerializer };
type DomainElementSerializerArray = DomainElementSerializer[] | readonly DomainElementSerializer[];
export type DomainElementSerializer =
  | DomainElementSerializerItem
  | DomainElementSerializerObject
  | DomainElementSerializerArray;
