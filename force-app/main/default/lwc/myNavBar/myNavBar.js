import { LightningElement, api } from 'lwc';

export default class NavbarMenu extends LightningElement {
    _filters = []
    isOpen = false;

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.dispatchEvent(new CustomEvent('togglefilter', {
            detail: { isOpen: this.isOpen },
            bubbles: true,
            composed: true
        }));
    }
}