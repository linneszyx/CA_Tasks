import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCases from '@salesforce/apex/MG_ContactController.getCases';
import getTasks from '@salesforce/apex/MG_ContactController.getTasks';

export default class MyMainDashboard extends LightningElement {

    @track selectedContact = []
    @track cases = []
    @track tasks = []

    @track isCaseLoading = false
    @track isTaskLoading = false

    @track groupData = []
    @track isGroupOpen = false

    openGroup() {
        this.buildGroupData()
        this.isGroupOpen = true
    }
    closeGroup() {
        this.isGroupOpen = false
    }

    get groupButton() {
        return (this.cases.length + this.tasks.length) > 5
    }

    buildGroupData() {
        this.groupData = this.selectedContact.map(c => {
            const relatedCases = this.cases.filter(cc => cc.ContactId === c.Id)
            const relatedTasks = this.tasks.filter(tt => tt.WhoId === c.Id)
            return {
                contactId: c.Id,
                contactName: c.Name,
                contactLabel: `${c.Name} • Cases (${relatedCases.length}) • Tasks (${relatedTasks.length})`,
                cases: relatedCases,
                tasks: relatedTasks,
                caseTitle: `Related Cases`,
                taskTitle: `Related Tasks`,

            }
        })
    }

    handleSelectionChange(e) {
        this.selectedContact = [...e.detail]
        this.loadCases()
        this.loadTasks()
    }

    handleRemoveContact(e) {
        const contactId = e.detail
        this.selectedContact = this.selectedContact.filter(c => c.Id !== contactId)
        this.loadCases()
        this.loadTasks()
    }

    loadCases() {
        this.isCaseLoading = true
        const contactIds = this.selectedContact.map(c => c.Id);
        if (contactIds.length === 0) {
            this.cases = []
            this.isCaseLoading = false
            return
        }
        getCases({ contactIds })
            .then(r => {
                this.cases = r;
                this.buildGroupData()
            }).catch(e => {
                console.log(e)
                this.showToast('Error', 'Failed to Load Cases', 'error')
            }).finally(() => this.isCaseLoading = false)

    }

    loadTasks() {
        this.isTaskLoading = true
        const contactIds = this.selectedContact.map(c => c.Id);
        if (contactIds.length === 0) {
            this.tasks = []
            this.isTaskLoading = false
            return
        }
        getTasks({ contactIds })
            .then(r => {
                this.tasks = r
                this.buildGroupData()
            }).catch(e => {
                console.log(e)
                this.showToast('Error', 'Failed to Load Tasks', 'error')
            }).finally(() => this.isTaskLoading = false)
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }))
    }

    closeModal() {
        this.isModalOpen = false
    }
}