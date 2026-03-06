export type DomainObjectType = 'Element' | 'Event' | 'Specification' | 'Error';

type JsonItem = string | number | boolean | null;
type JsonObject = { [Key in string]: JsonValue };
type JsonArray = JsonValue[] | readonly JsonValue[];
export type JsonValue = JsonItem | JsonObject | JsonArray;

type JsonSerializerItem = {
  toJSON(): JsonValue;
};
type JsonSerializerObject = { [Key in string]: JsonSerializer };
type JsonSerializerArray = JsonSerializer[] | readonly JsonSerializer[];
export type JsonSerializer = JsonSerializerItem | JsonSerializerObject | JsonSerializerArray;

type JsonDeserializerItem = {
  fromJSON(json: JsonValue): unknown;
};
type JsonDeserializerObject = { [Key in string]: JsonDeserializer };
type JsonDeserializerArray = JsonDeserializer[] | readonly JsonDeserializer[];
export type JsonDeserializer = JsonDeserializerItem | JsonDeserializerObject | JsonDeserializerArray;

export type StringValue = string;

type StringSerializerItem = {
  toString(): StringValue;
};
type StringSerializerObject = { [Key in string]: StringSerializer };
type StringSerializerArray = StringSerializer[] | readonly StringSerializer[];
export type StringSerializer = StringSerializerItem | StringSerializerObject | StringSerializerArray;
