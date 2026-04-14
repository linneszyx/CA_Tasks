import { LightningElement } from 'lwc';

export default class PicklistTemplate extends LightningElement {
    handleChange(event) {
        const value = event.detail.value;
        const context = event.target.dataset.id;

        this.dispatchEvent(new CustomEvent('edit', {
            composed: true,
            bubbles: true,
            detail: {
                value: value,
                context: context
            }
        }));
    }
}