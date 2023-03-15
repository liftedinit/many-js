export interface SerializedManyError {
  "0"?: number;
  "1"?: string;
  "2"?: { [field: string]: string };
}

export class ManyError extends Error {
  public code: Number;
  public fields: { [field: string]: string };

  constructor(error: SerializedManyError) {
    // Error messages replace `{NAME}` with error["2"].name
    const { "0": code, "1": message, "2": fields } = error;
    if (message === undefined) {
      super(
        `ManyError(${code || 0}) message=${JSON.stringify(
          message,
        )} fields=${JSON.stringify(fields)}`,
      );
    } else {
      const re = /\{\{|\}\}|\{[^\}\s]*\}/g;
      super(
        message.replace(re, (fieldName) => {
          switch (fieldName) {
            case "{{":
              return "{";
            case "}}":
              return "}";
            default:
              return (fields && fields[fieldName.slice(1, -1)]) || "";
          }
        }),
      );
    }

    this.code = code || 0;
    this.fields = fields || {};
  }
}
