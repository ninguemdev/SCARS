/** Field factories shared by the SCARS data models. */

export function integerField(initial, { min = 0, max } = {}) {
  const { NumberField } = foundry.data.fields;
  return new NumberField({ required: true, nullable: false, integer: true, min, max, initial });
}

export function textField(initial = "") {
  const { StringField } = foundry.data.fields;
  return new StringField({ required: true, blank: true, initial });
}

export function htmlField() {
  const { HTMLField } = foundry.data.fields;
  return new HTMLField({ required: true, blank: true, initial: "" });
}

export function booleanField(initial) {
  const { BooleanField } = foundry.data.fields;
  return new BooleanField({ initial });
}

/** A string field restricted to the keys of a choices object whose values are label keys. */
export function choiceField(choices, initial) {
  const { StringField } = foundry.data.fields;
  return new StringField({ required: true, choices, initial });
}
