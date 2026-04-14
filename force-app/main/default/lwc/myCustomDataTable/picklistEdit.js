import { LightningElement, api } from 'lwc';
export default class PicklistEdit extends LightningElement {
    @api typeAttributes;
    @api context;

    handleChange(event) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                value: event.detail.value,
                context: this.context
            },
            bubbles: true,
            composed: true
        }));
    }
}