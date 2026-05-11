import { LightningElement, track, api } from 'lwc';
import searchContacts from '@salesforce/apex/MG_ContactController.searchContacts';
export default class MgContactSearch extends LightningElement {
    @track contacts = []
    @track isLoading = false
    _selectedContact = []
    @api
    get selectedContact() {
        return this._selectedContact
    }
    set selectedContact(val) {
        this._selectedContact = val || [];
        if (!Array.isArray(this.contacts)) {
            this.contacts = [];
            return;

        }
        this.contacts = this.contacts.map(c => {
            return {
                ...c,
                checked: this._selectedContact.some(
                    cc => cc.Id === c.Id
                )
            };
        });
    }
    delayTimeout
    handleSearch(e) {
        const searchValue = e.target.value
        clearTimeout(this.delayTimeout)
        this.delayTimeout = setTimeout(() => {
            if (searchValue) {
                this.isLoading = true
                searchContacts({ keySearch: searchValue })
                    .then(res => {
                        this.isLoading = false
                        this.contacts = res.map(c => {
                            return {
                                ...c,
                                checked: this.selectedContact.some(cc => cc.Id === c.Id)
                            }
                        })
                    }).catch(err => { this.isLoading = false; console.log('Searching Error', err) })
            }
            else {
                this.isLoading = false
                this.contacts = []
            }
        }, 500)
    }
    handleSelection(e) {
        if (!Array.isArray(this.selectedContact)) {
            this.selectedContact = [];
        }
        const conId = e.target.dataset.id
        const conName = e.target.dataset.name
        if (e.target.checked) {
            if (this.selectedContact.length >= 10) {
                alert('Only 10 Contacts')
                e.target.checked = false
                return;
            }
            this.selectedContact = [...this.selectedContact, {
                Id: conId,
                Name: conName
            }]
        }
        else {
            this.selectedContact = this.selectedContact.filter(c => c.Id !== conId)
        }
        const selectedEvent = new CustomEvent('selectionchange', {
            detail: this.selectedContact
        })
        this.dispatchEvent(selectedEvent)
    }
}