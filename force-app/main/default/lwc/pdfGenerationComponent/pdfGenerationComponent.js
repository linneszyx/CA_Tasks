import { LightningElement, api } from 'lwc';
import generatePdf from '@salesforce/apex/PdfController.generatePdf';

export default class PdfGenerationComponent extends LightningElement {
    @api recordId;
    isLoading = false;
    get visualForceUrl() {
        return '/apex/displayPDF?id=' + this.recordId;
    }
    async handleSave() {
        this.isLoading = true;
        try {
            const docId = await generatePdf({ recordId: this.recordId });
        } catch (error) {
            console.log(error);
        }
        finally {
            this.isLoading = false;
        }
    }
}