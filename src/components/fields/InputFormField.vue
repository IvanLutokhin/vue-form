<template>
    <input
            :type="type"
            :id="id"
            :name="name"
            :value="value"
            :class="classes"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            @input="onInputHandler"
            v-on="$listeners"
    />
</template>

<script>
    import _ from "lodash";
    import fieldMixin from "../../mixins/field-mixin";

    export default {
        name: "vue-input-form-field",
        mixins: [fieldMixin],
        computed: {
            type () {
                return _.get(this.attributes, 'inputType', 'text').toString().toLowerCase();
            },
            placeholder () {
                return _.get(this.attributes, 'placeholder', '');
            },
            classes () {
                return _.get(this.attributes, 'classes');
            }
        },
        methods: {
            onInputHandler ($event) {
                this.value = $event.target.value;
            },
            transformValueToModel (value) {
                if (this.type === 'number') {
                    value = parseFloat(value);
                }

                return value;
            },
        }
    }
</script>
