<template>
    <div class="form-field">
        <div v-if="hasLabel" class="form-field__label">
            <slot name="label" :id="id" :definition="definition" :model="model" :options="options" :errors="fieldErrors" :event-bus="eventBus">
                <label :for="id">
                    {{ definition.label }}
                </label>
            </slot>
        </div>

        <div class="form-field__element">
            <slot name="element" :definition="definition" :model="model" :options="options" :event-bus="eventBus">
                <component
                        :is="component"
                        :id="id"
                        :name="name"
                        :path="path"
                        :definition="definition"
                        :model="model"
                        :options="options"
                        :event-bus="eventBus"
                        @modify="onFieldModifyHandler"
                        @validate="onFieldValidateHandler"
                />
            </slot>
        </div>

        <div v-if="hasValidationErrors" class="form-field__error">
            <slot name="error" :definition="definition" :model="model" :options="options" :errors="fieldErrors" :event-bus="eventBus">
                <div v-for="error in fieldErrors">
                    {{ error }}
                </div>
            </slot>
        </div>
    </div>
</template>

<script>
    import _ from "lodash";
    import fields from "./fields";

    export default {
        name: "vue-form-field",
        components: Object.assign({}, fields),
        props: {
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
            errors: {
                type: Array,
                default: () => []
            },
            eventBus: {
                type: Object
            }
        },
        data () {
            return {
                modified: false,
                validated: false,
                fieldErrors: [],
            }
        },
        watch: {
            errors: function (errors) {
                this.validated = true;

                let validationErrors = [];

                errors.filter((error) => _.has(error, 'field') && error.field === this.path).forEach((error) => {
                    if (_.isNil(error.message) || error.message === '') {
                        return;
                    }

                    validationErrors.push(error.message);
                });

                this.fieldErrors = validationErrors;
            }
        },
        computed: {
            component () {
                return `vue-${this.definition.type}-form-field`;
            },
            id () {
                return (this.options.prefix || '') + '_' + this.definition['__metadata']['keys'].join('_');
            },
            name () {
                return (this.options.prefix || '') + '[' + this.definition['__metadata']['keys'].join('][') + ']';
            },
            path () {
                return this.definition['__metadata']['keys'].join('.');
            },
            hasLabel () {
                return _.has(this.definition, 'label', false);
            },
            hasValidationErrors () {
                return (this.modified || this.validated) && this.fieldErrors.length > 0;
            },
        },
        methods: {
            onFieldModifyHandler () {
                this.modified = true;
            },
            onFieldValidateHandler (errors) {
                this.fieldErrors = errors;
            }
        }
    }
</script>
