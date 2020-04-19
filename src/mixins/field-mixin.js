import _ from "lodash";

export default {
    props: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        definition: {
            type: Object,
            required: true
        },
        model: {
            type: Object,
            required: true
        },
        options: {
            type: Object,
            default: () => {}
        },
        eventBus: {
            type: Object
        }
    },
    data () {
        return {
            modified: false,
            fieldErrors: [],
        }
    },
    watch: {
        fieldErrors: {
            handler (errors) {
                this.$emit('validate', errors);
            }
        }
    },
    computed: {
        value: {
            cache: false,
            get () {
                const value = _.get(this.model, this.path, null);

                return this.transformValueToField(value);
            },
            set (value) {
                const
                    oldValue = this.value,
                    newValue = this.transformValueToModel(value)
                ;

                _.set(this.model, this.path, newValue);

                if (!this.modified) {
                    this.modified = true;

                    this.$emit('modify');
                }

                this.eventBus.$emit('form:model-update', newValue, oldValue, this.path);

                if (_.get(this.options, 'validateOnChange', false)) {
                    this.debounceValidate();
                }
            }
        },
        attributes () {
            return _.get(this.definition, 'attributes', {});
        },
        disabled () {
            return _.get(this.definition, 'disabled', false);
        },
        required () {
            return _.get(this.definition, 'required', false);
        },
        constraints () {
            return _.get(this.definition, 'constraints', []);
        }
    },
    methods: {
        transformValueToField (value) {
            return value;
        },
        transformValueToModel (value) {
            return value;
        },
        validate () {
            if (
                this.disabled ||
                this.readonly ||
                this.constraints.length === 0
            ) {
                return;
            }

            let validations = [];
            this.constraints.forEach((constraint) => {
                if (!_.isFunction(constraint.function)) {
                    return;
                }

                let constraintFunction = constraint.function.bind(this);

                validations.push(constraintFunction(this.value, this.definition, constraint.options || {}));
            });

            Promise
                .all(validations)
                .then((errors) => {
                    let validationErrors = [];

                    errors.forEach((fieldErrors) => {
                        if (_.isArray(fieldErrors) && fieldErrors.length > 0) {
                            fieldErrors.forEach((fieldError) => validationErrors.push(fieldError));
                        }
                    });

                    this.fieldErrors = validationErrors;

                    this.eventBus.$emit('form:field-validate', validationErrors, this.path);

                    return errors;
                })
            ;
        },
        debounceValidate () {
            const debounce  = _.debounce(
                this.validate.bind(this),
                _.get(this.options, 'validateDebounceTimeout', 500)
            );

            debounce();
        }
    },
    created () {
        this.eventBus.$on('form:validate-fields', this.validate);
    },
    mounted() {
        this.$nextTick(() => this.validate());
    },
    beforeDestroy() {
        this.eventBus.$off('form:validate-fields');
    },
}
