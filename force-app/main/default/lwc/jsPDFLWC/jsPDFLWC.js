import { LightningElement, api, wire } from 'lwc';
import jsPDFs from '@salesforce/resourceUrl/jsPDFs';
import CloudAnalogy from '@salesforce/resourceUrl/CloudAnalogy';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { loadScript } from 'lightning/platformResourceLoader';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import RATING_FIELD from '@salesforce/schema/Account.Rating';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

const fields = [NAME_FIELD, PHONE_FIELD, RATING_FIELD, INDUSTRY_FIELD];

const contactColumns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Email', fieldName: 'email' },
    { label: 'Phone', fieldName: 'phone' }
];
const opportunityColumns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Stage Name', fieldName: 'stageName' },
    { label: 'Amount', fieldName: 'amount', type: 'currency' },
    { label: 'Close Date', fieldName: 'closeDate', type: 'date' }
];

export default class JsPDFLWC extends LightningElement {
    @api recordId;
    contactColumns = contactColumns;
    opportunityColumns = opportunityColumns;
    accountName = '';
    phone = '';
    rating = '';
    industry = '';
    jsPDFInitialized = false;
    contactRecords = [];
    opportunityRecords = [];
    error;
    connectedCallback() {
        loadScript(this, jsPDFs)
            .then(() => {
                this.jsPDFInitialized = true;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    @wire(getRecord, { recordId: '$recordId', fields })
    accountData({ data, error }) {
        if (data) {
            this.accountName = getFieldValue(data, NAME_FIELD);
            this.phone = getFieldValue(data, PHONE_FIELD);
            this.rating = getFieldValue(data, RATING_FIELD);
            this.industry = getFieldValue(data, INDUSTRY_FIELD);
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Contacts',
        fields: [
            'Contact.Name',
            'Contact.Email',
            'Contact.Phone'
        ]
    })

    retrievedContacts({ error, data }) {
        if (data) {
            this.contactRecords = data.records.map((r) => this.contactRecordMap(r));
            this.error = undefined;
        }
        else if (error) {
            this.error = error;
            this.contactRecords = [];
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Opportunities',
        fields: [
            'Opportunity.Name',
            'Opportunity.CloseDate',
            'Opportunity.StageName',
            'Opportunity.Amount'
        ]
    })

    retrievedOpportunities({ data, error }) {
        if (data) {
            this.opportunityRecords = data.records.map((o) => this.opportunityRecordMap(o));
            this.error = undefined;
        }
        else if (error) {
            this.error = error;
            this.opportunityRecords = [];
        }
    }

    contactRecordMap(con) {
        return {
            id: con.id,
            name: con.fields.Name.value,
            email: con.fields.Email.value,
            phone: con.fields.Phone.value
        };
    }

    opportunityRecordMap(opp) {
        return {
            id: opp.id,
            name: opp.fields.Name.value,
            stageName: opp.fields.StageName.value,
            amount: opp.fields.Amount.value,
            closeDate: opp.fields.CloseDate.value
        };
    }

    get hasContacts() {
        return this.contactRecords && this.contactRecords.length > 0;
    }

    get hasOpportunities() {
        return this.opportunityRecords && this.opportunityRecords.length > 0;
    }

    totalWidth = 170;

    handlePDF() {
        if (!this.jsPDFInitialized) {
            console.log('jsPDF library not initialized');
            return;
        }
        const { jsPDF } = window.jspdf;
        const docu = new jsPDF();
        docu.setFillColor(240, 240, 240);
        docu.rect(0, 0, 210, 40, 'F');
        if (CloudAnalogy) {
            const img = new Image();
            img.src = CloudAnalogy;
            docu.addImage(img, 'JPEG', 20, 20, 35, 20);
        }
        this.generatePDF(docu);
        docu.save('Account_Report.pdf');
    }

    drawSection(docu, title, yPos) {
        docu.setFillColor(30, 64, 175);
        docu.rect(20, yPos, 170, 12, 'F');
        docu.setTextColor(255, 255, 255);
        docu.setFontSize(12);
        docu.text(title, 25, yPos + 8);
        return yPos + 18;
    }

    generatePDF(docu) {
        docu.setFontSize(18);
        docu.text('Account Details', 200, 30, { align: 'right' });
        docu.setDrawColor(200);
        docu.line(10, 45, 200, 45);
        docu.setFontSize(14);
        let yPos = 60;
        const accountRow = [
            ['AccountName', this.accountName],
            ['Phone', this.phone],
            ['Rating', this.rating],
            ['Industry', this.industry]
        ]

        yPos = this.drawSection(docu, 'ACCOUNT Details', yPos);
        yPos = this.tableMake(docu, {
            xPos: 20,
            yPos,
            headers: ['Field', 'Value'],
            rows: accountRow,
            columnWidths: [100, 80]
        })
        yPos += 10;
        docu.setFontSize(14);
        yPos = this.drawSection(docu, 'CONTACTS', yPos);
        const contactHeader = ['Name', 'Email', 'Phone'];
        const contactRow = this.hasContacts ? this.contactRecords.map(c => [c.name, c.email, c.phone]) : [['No Contact', '-', '-']]
        const contactWidth = this.calculateColWidth(
            docu,
            contactHeader,
            contactRow,
            totalWidth
        )
        yPos = this.tableMake(docu, {
            xPos: 20,
            yPos,
            headers: contactHeader,
            rows: contactRow,
            columnWidths: contactWidth
        })
        // if (this.hasContacts) {
        //     let line = 100;
        //     this.contactRecords.forEach((con, idx) => {
        //         docu.text(`${idx + 1}. Name: ${con.name}`, 25, line);
        //         line += 5;
        //         docu.text(`Email: ${con.email}`, 25, line);
        //         line += 5;
        //         docu.text(`Phone: ${con.phone}`, 25, line);
        //         line += 15;
        //     });
        // } else {
        //     docu.text('No contacts found', 25, 100);
        // }
        docu.setFontSize(14);
        yPos += 10;
        yPos = this.drawSection(docu, 'OPPORTUNITIES', yPos);
        const opportunityRow = this.hasOpportunities ? this.opportunityRecords.map(o => [o.name, o.stageName, o.amount, o.closeDate
        ]) : [['No Opportunities', '-', '-', '-']]
        const oppHeaders = ['Name', 'Stage', 'Amount', 'Close Date'];
        const oppWidths = this.calculateColumnWidths(
            docu,
            oppHeaders,
            oppRows,
            totalWidth
        );
        this.tableMake(docu, {
            xPos: 20,
            yPos,
            headers: oppHeaders,
            rows: opportunityRow,
            columnWidths: oppWidths
        })
        // if (this.hasOpportunities) {
        //     let line = 190;
        //     this.opportunityRecords.forEach((opp, idx) => {
        //         docu.text(`${idx + 1}. Name: ${opp.name}`, 25, line);
        //         line += 5;
        //         docu.text(`Stage: ${opp.stageName}`, 25, line);
        //         line += 5;
        //         docu.text(`Amount: ${opp.amount}`, 25, line);
        //         line += 5;
        //         docu.text(`Close Date: ${opp.closeDate}`, 25, line);
        //         line += 10;
        //     });
        // } else {
        //     docu.text('No opportunities found', 25, 190);
        // }
    }
    calculateColWidth(docu, headers, row, totalWidth) {
        const padding = 10;
        const maxWidth = headers.map((header, idx) => {
            let mx = docu.getTextWidth(header);
            row.forEach(r => {
                const cell = String(row[idx] || '-');
                const cellWidth = docu.getTextWidth(cell);
                if (cellWidth > mx) {
                    mx = cellWidth;
                }
            })
            return mx + padding;
        })
        const totalConWidth = maxWidth.reduce((a, b) => a + b, 0);
        return maxWidth.map(w => (w / totalConWidth) * totalWidth);
    }
    tableMake(docu, { xPos, yPos, headers, rows, columnWidths }) {
        let y = yPos;
        const padding = 4;
        const lineHeight = 5;
        const pageHeight = 297;
        docu.setFillColor(0, 102, 204);
        docu.setTextColor(255, 255, 255);
        let x = xPos;
        headers.forEach((h, i) => {
            docu.rect(x, y, columnWidths[i], 12, 'F');
            docu.text(h, x + padding, y + 8);
            x += columnWidths[i];
        });
        y += 12;
        docu.setTextColor(0, 0, 0);
        rows.forEach((row, rowIndex) => {
            let x = xPos;
            let rowHeight = 0;
            const cellHeights = row.map((cell, i) => {
                const value = String(cell || '-');
                if (value.length < 15) {
                    return 10;
                }
                const text = docu.splitTextToSize(value, columnWidths[i] - 8);
                return text.length * 5 + 4;
            });
            rowHeight = Math.max(...cellHeights);
            if (y + rowHeight > pageHeight - 20) {
                docu.addPage();
                y = 20;
                docu.setFillColor(0, 102, 204);
                docu.setTextColor(255, 255, 255);
                let hx = xPos;
                headers.forEach((h, i) => {
                    docu.rect(hx, y, columnWidths[i], 12, 'F');
                    docu.text(h, hx + padding, y + 8);
                    hx += columnWidths[i];
                });
                y += 12;
                docu.setTextColor(0, 0, 0);
            }
            if (rowIndex % 2 === 0) {
                docu.setFillColor(245, 245, 245);
                docu.rect(xPos, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
            }
            row.forEach((cell, i) => {
                const text = docu.splitTextToSize(String(cell || '-'), columnWidths[i] - 8);

                docu.rect(x, y, columnWidths[i], rowHeight);
                docu.text(text, x + padding, y + 6);

                x += columnWidths[i];
            });

            y += rowHeight;
        });

        return y + 5;
    }
}