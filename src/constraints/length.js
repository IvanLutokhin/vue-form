import _ from "lodash";

export default function (value, definition, options = { max: 255 }) {
    if (_.isNil(value) || value === '') {
        return [];
    }

    return value.length > options.max ? [`This value should be ${options.max} or less.`] : [];
}
