module.exports.BoxShema = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "required": true
        },
        "long_desc": {
            "type": "string",
            "required": true
        },
        "short_desc": {
            "type": "string",
            "required": true
        },
        "bullets": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "required": true
        },
        "brief": {
            "type": "string",
            "required": true
        },
        "price": {
            "type": "string",
            "required": true
        },
        "publish_date": {
            "type": "string",
            "format": "date-time",
            "required": true
        }
    },
    additionalProperties: false
};

module.exports.BoxQuerySchema = {
    type: 'object',
    properties: {
        sort: {
            type: 'string',
            required: false,
            enum: ["alphabetical", "price", "new"]
        }
    }
};