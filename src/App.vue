<template>
    <div>
        <vue-form :fields="fields" :model="model" :options="options" :errors="errors" @validate="onFormValidateHandler">
            <template v-slot:address_street="{definition, model, options, errors, eventBus}">
                <vue-form-field :definition="definition" :model="model" :options="options" :errors="errors" :event-bus="eventBus">
                    <template v-slot:label="{definition}">
                        <div> Modified label for {{ definition.label }}</div>
                    </template>
                </vue-form-field>
            </template>
        </vue-form>

        <button @click="onSubmitClickHandler" :disabled="!isValid">Submit</button>
    </div>
</template>

<script>
    import VueForm from "./components/Form";
    import VueFormField from "./components/FormField"
    import constraints from "./constraints";

    export default {
        name: 'App',
        components: {
            VueForm,
            VueFormField
        },
        data () {
            return {
                fields: {
                    id: {
                        type: 'input',
                        label: 'ID',
                        attributes: {
                            inputType: 'text',
                            placeholder: 'ID',
                            readonly: false,
                        },
                        disabled: false,
                        required: true,
                        constraints: [{ function: constraints.required }]
                    },
                    address: {
                        city: {
                            type: 'input',
                            label: 'city',
                            attributes: {
                                inputType: 'text',
                                placeholder: 'city',
                                readonly: false,
                            },
                            disabled: false,
                            required: true,
                            constraints: [
                                {
                                    function: constraints.length,
                                    options: { max: 10 }
                                }
                            ]
                        },
                        street: {
                            type: 'input',
                            label: 'street',
                            attributes: {
                                inputType: 'text',
                                placeholder: 'street',
                                readonly: false,
                            },
                            disabled: false,
                            required: true,
                            constraints: []
                        }
                    },
                    email: () => {
                        return {
                            type: 'input',
                            label: 'Email',
                            attributes: {
                                inputType: 'email',
                                placeholder: 'Email',
                                readonly: false,
                            },
                            disabled: false,
                            required: true,
                            constraints: [
                                /*{
                                    function: (value, definition, options) => [options.message],
                                    options: { message: 'Already invalid field' }
                                }*/
                            ]
                        }
                    },
                    card: () => {
                        return {
                            number: {
                                type: 'input',
                                label: 'number',
                                attributes: {
                                    inputType: 'text',
                                    placeholder: 'number',
                                    readonly: false,
                                },
                                disabled: false,
                                required: true,
                                constraints: []
                            }
                        }
                    },
                    import: () => import('./schema/test-type')
                },
                model: {
                    id: 5,
                    address: {
                        city: null,
                        street: null,
                    },
                    email: null,
                    card: {
                        number: null,
                    },
                    import: {
                        test: null,
                    },
                },
                options: {
                    prefix: 'vue_form',
                    validateOnChange: true,
                    validateDebounceTimeout: 500,
                },
                errors: [],
                isValid: false,
            }
        },
        methods: {
            onFormValidateHandler (isValid) {
                this.isValid = isValid;
            },
            onSubmitClickHandler () {
                this.errors = [];

                for (let i = 0; i < Math.floor(Math.random() * 2) + 1; ++i) {
                    this.errors.push({ message: 'Random form error message ' + i });
                }

                this.errors.push({ field: 'email', message: 'Test error from backend ' + ( Math.floor(Math.random() * 5) + 1) });
                this.errors.push({ field: 'import.test', message: 'Test error from backend ' + ( Math.floor(Math.random() * 5) + 1) });
            }
        }
    }
</script>
