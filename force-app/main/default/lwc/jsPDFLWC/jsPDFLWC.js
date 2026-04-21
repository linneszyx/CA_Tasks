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
import USER_ID from '@salesforce/user/Id';
import USER_NAME from '@salesforce/schema/User.Name';

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
    userName = '';
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

    @wire(getRecord, { recordId: USER_ID, fields: [USER_NAME] })
    userData({ data, error }) {
        if (data) {
            this.userName = getFieldValue(data, USER_NAME);
        }
        else if (error) {
            console.log(error);
        }
    }

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
        if (!this.jsPDFInitialized || !window.jspdf) {
            console.log('jsPDF library not initialized');
            return;
        }
        const { jsPDF } = window.jspdf;
        const docu = new jsPDF();
        docu.setFillColor(240, 240, 240);
        docu.rect(0, 0, 210, 40, 'F');
        docu.setFontSize(9);
        if (CloudAnalogy) {
            const img = new Image();
            img.src = CloudAnalogy;
            const imgHeight = 20;
            const headHeight = 40;
            const imgY = (headHeight - imgHeight) / 2;
            docu.addImage(img, 'JPEG', 10, imgY, 35, imgHeight);
        }
        this.generatePDF(docu);
        docu.save('Account_Report.pdf');
    }

    drawFormGrid(docu, { x, y, colWidths, rows }) {
        let cy = y;
        const padding = 2;
        rows.forEach(r => {
            let cx = x;
            const cellHeights = r.map((c, i) => {
                const txt = docu.splitTextToSize(
                    String(c || ''),
                    colWidths[i] - 4
                );
                return txt.length * 4 + 2;
            });
            const maxHeight = Math.max(...cellHeights);
            r.forEach((c, i) => {
                const txt = docu.splitTextToSize(String(c || ''), colWidths[i] - 4);
                docu.setFontSize(9);
                docu.setTextColor(0, 0, 0);
                if (i % 2 !== 0) {
                    docu.setFillColor(240, 240, 240);
                    docu.rect(cx, cy, colWidths[i], maxHeight, 'F');
                }
                docu.setDrawColor(160);
                docu.setLineWidth(0.2);
                docu.rect(cx, cy, colWidths[i], maxHeight);
                docu.text(txt, cx + padding, cy + 5, {
                    maxWidth: colWidths[i] - 4
                });
                cx += colWidths[i];
            })
            cy += maxHeight;
        })
        return cy;
    }

    drawSection(docu, title, yPos, startX, tableWidth) {
        const height = 8;
        docu.setFillColor(30, 64, 175);
        docu.rect(startX, yPos, tableWidth, height, 'F');
        docu.setTextColor(255, 255, 255);
        docu.setFontSize(9);
        docu.text(title, startX + tableWidth / 2, yPos + 5.5, {
            align: 'center'
        })
        docu.setTextColor(0, 0, 0);
        return yPos + height + 6;
    }

    drawSingleRecordSection(docu, title, datarow, yPos, startX, tableWidth) {
        yPos = this.drawSection(docu, title, yPos, startX, tableWidth);
        const colWidths = [40, 50, 40, 50];
        const startY = yPos;
        yPos = this.drawFormGrid(docu, {
            x: startX,
            y: yPos,
            colWidths,
            rows: datarow
        })
        const height = yPos - startY;
        docu.setDrawColor(120);
        docu.setLineWidth(0.5);
        docu.rect(startX, startY, tableWidth, height);
        return yPos + 10;
    }

    getProjectDetailHeader() {
        return [
            [
                'Project Name', this.accountName,
                'Date of Report', this.formatDate(new Date())
            ],
            [
                'Site Visit Date',
                this.formatDate(new Date()),
                'Case Visited By',
                this.userName
            ]
        ]
    }
    formatDate(date) {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }

    generatePDF(docu) {
        docu.setFontSize(9);
        docu.setDrawColor(200);
        docu.line(10, 45, 200, 45);
        docu.setFontSize(9);
        let yPos = 60;
        docu.setFontSize(9);
        const colWidths = [40, 50, 40, 50];
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);
        const pageWidth = docu.internal.pageSize.getWidth();
        const startX = (pageWidth - tableWidth) / 2;
        const startY = yPos;
        yPos = this.drawFormGrid(docu, {
            x: startX,
            y: yPos,
            colWidths,
            rows: this.getProjectDetailHeader()
        })
        const tableHeight = yPos - startY;
        docu.setDrawColor(120);
        docu.setLineWidth(0.6);
        docu.rect(startX, startY, tableWidth, tableHeight);
        yPos += 12;
        const accFields = [
            { label: 'Account Name', value: this.accountName },
            { label: 'Phone', value: this.phone },
            { label: 'Rating', value: this.rating },
            { label: 'Industry', value: this.industry }
        ];
        const accRows = this.buildTwoCol(accFields);
        docu.setFontSize(9);
        yPos = this.drawSection(docu, 'ACCOUNT Details', yPos, startX, tableWidth);
        const accStartY = yPos;
        docu.setFontSize(9);
        yPos = this.drawFormGrid(docu, {
            x: startX,
            y: yPos,
            colWidths: [40, 50, 40, 50],
            rows: accRows
        })
        const accHeight = yPos - accStartY;
        docu.setLineWidth(0.6);
        docu.rect(startX, accStartY, tableWidth, accHeight);
        yPos += 10;
        if (yPos > 250) {
            docu.addPage();
            yPos = 20;
        }
        docu.setFontSize(9);
        yPos = this.drawSection(docu, 'CONTACTS', yPos, startX, tableWidth);
        if (this.hasContacts) {
            this.contactRecords.forEach((c, idx) => {
                const fields = [
                    { label: 'Name', value: c.name },
                    { label: 'Email', value: c.email },
                    { label: 'Phone', value: c.phone }
                ];
                const rows = this.buildTwoCol(fields)
                yPos = this.drawSingleRecordSection(docu,
                    `CONTACT ${idx + 1}`,
                    rows,
                    yPos,
                    startX,
                    tableWidth
                )
            })
        }
        else {
            yPos = this.drawSingleRecordSection(
                docu,
                'CONTACT',
                [['Info', 'No Contacts']],
                yPos,
                startX,
                tableWidth
            )
        }
        docu.setFontSize(9);
        yPos += 10;
        if (yPos > 250) {
            docu.addPage();
            yPos = 20;
        }
        docu.setFontSize(9);
        yPos = this.drawSection(docu, 'OPPORTUNITIES', yPos, startX, tableWidth);
        if (this.hasOpportunities) {
            this.opportunityRecords.forEach((o, idx) => {
                const fields = [
                    { label: 'Name', value: o.name },
                    { label: 'Stage', value: o.stageName },
                    { label: 'Amount', value: o.amount },
                    { label: 'Close Date', value: o.closeDate }
                ];
                const rows = this.buildTwoCol(fields);
                yPos = this.drawSingleRecordSection(
                    docu,
                    `OPPORTUNITY ${idx + 1}`,
                    rows,
                    yPos,
                    startX,
                    tableWidth
                )
            })
        }
        else {
            yPos = this.drawSingleRecordSection(
                docu,
                'OPPORTUNITY',
                [['Info', 'No Opportunities']],
                yPos,
                startX,
                tableWidth
            )
        }

    }
    calculateColWidth(docu, headers, row, totalWidth) {
        const padding = 10;
        const maxWidth = headers.map((header, idx) => {
            let mx = docu.getTextWidth(header);
            row.forEach(r => {
                const cell = String(r[idx] || '-');
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

    buildTwoCol(fields) {
        const rows = [];
        for (let i = 0; i < fields.length; i += 2) {
            const l = fields[i];
            const r = fields[i + 1];
            rows.push([
                l.label, l.value,
                r ? r.label : '',
                r ? r.value : ''
            ])
        }
        return rows;
    }
    tableMake(docu, { xPos, yPos, headers, rows, columnWidths }) {
        let y = yPos;
        const padding = 4;
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