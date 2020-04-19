import _ from "lodash";

export default function (value, definition, options) {
    return (_.isNil(value) || value === '') ? ['Field is required'] : [];
}
