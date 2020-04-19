<template>
    <div class="vue-form">
        <h1>Form</h1>

        <template v-if="hasValidationErrors">
            <div class="form__errors">
                <div v-for="error in validationErrors">
                    {{ error.message }}
                </div>
            </div>
        </template>

        <template v-for="definition in definitions">
            <slot :name="getFieldSlotName(definition)" :definition="definition" :model="model" :options="options" :errors="errors" :event-bus="eventBus">
                <vue-form-field :definition="definition" :model="model" :options="options" :errors="errors" :event-bus="eventBus" />
            </slot>
        </template>
    </div>
</template>

<script>
    import _ from "lodash";
    import Vue from "vue";
    import VueFormField from "./FormField";

    async function flat(object, properties = [], accumulator = {}, flag = 'temp__property_is_handled__') {
        let keys = [];

        for (let [key, definition] of Object.entries(object)) {
            keys = properties.concat(key !== 'default' ? [key] : []);

            if (definition instanceof Function) {
                definition = definition.call(this);
            }

            if (definition instanceof Promise) {
                definition = await definition;
            }

            if (definition instanceof Object && definition.hasOwnProperty('type')) {
                const path = keys.join('.');

                accumulator[path] = Object.assign({}, definition, { '__metadata' : { keys: keys } });
            } else {
                if (definition.hasOwnProperty(flag) && definition[flag]) {
                    throw new Error('Circular links by path: ' + keys.join('.'));
                }

                Object.defineProperty(definition, flag, {
                    value: true,
                    writable: false,
                    configurable: true
                });

                flat(definition, keys, accumulator);

                delete definition[flag];
            }
        }

        return accumulator;
    }

    export default {
        name: "vue-form",
        components: { VueFormField },
        props: {
            fields: {
                type: Object,
                required: true
            },
            model: {
                type: Object,
                required: true
            },
            options: {
                type: Object,
                default: () => {
                    return {
                        prefix: null,
                        validateOnChange: true,
                        validateDebounceTimeout: 500,
                    }
                }
            },
            errors: {
                type: Array,
                default: () => []
            }
        },
        data () {
            const eventBus = new Vue();

            return {
                eventBus,
                definitions: {},
                formErrors: {},
            }
        },
        computed: {
            validatedDefinitions () {
                return Object.values(this.definitions).filter((definition) => !definition.disabled && !definition.readonly && definition.constraints.length > 0);
            },
            validationErrors () {
                return this.errors.filter((error) => !error.hasOwnProperty('field'));
            },
            hasValidationErrors () {
                return this.validationErrors.length > 0;
            },
        },
        methods: {
            getFieldSlotName (definition) {
                return definition['__metadata']['keys'].join('_');
            },
            onModelUpdateHandler (newValue, oldValue, path) {
                this.$emit('model-update', newValue, oldValue, path);
            },
            onFieldValidateHandler (errors, path) {
                this.formErrors[path] = errors;

                if (Object.keys(this.validatedDefinitions).length === Object.keys(this.formErrors).length) {
                    this.debounceValidate();
                }
            },
            validate () {
                let isValid = true;
                for (let errors of Object.values(this.formErrors)) {
                    if (_.isArray(errors) && errors.length > 0) {
                        isValid = false;

                        break;
                    }
                }

                this.$emit('validate', isValid, this.formErrors);
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
            flat(this.fields).then((definitions) => this.definitions = definitions);

            this.eventBus.$on('form:model-update', this.onModelUpdateHandler);
            this.eventBus.$on('form:field-validate', this.onFieldValidateHandler);
        },
        beforeDestroy() {
            this.eventBus.$off('form:model-update');
            this.eventBus.$off('form:field-validate');
        },
    }
</script>
