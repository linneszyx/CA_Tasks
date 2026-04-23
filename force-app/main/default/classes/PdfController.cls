public class PdfController {
    @AuraEnabled
    public static Id generatePdf(Id recordId) {
        try {
            PageReference pdfPage = Page.displayPDF;
            pdfPage.getParameters().put('id', recordId);
            Blob pdfBlob = pdfPage.getContentAsPDF();
            Account acc = [
                SELECT Id, Name 
                FROM Account 
                WHERE Id = :recordId 
                LIMIT 1
            ];
           String pdfName = acc.Name + ' - ' + String.valueOf(Date.today());
            ContentVersion cv = new ContentVersion();
            cv.Title = pdfName;
            cv.PathOnClient = pdfName + '.pdf';
            cv.VersionData = pdfBlob;
            cv.FirstPublishLocationId = recordId; 
            insert cv;
            return [ SELECT ContentDocumentId  FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
        } catch (Exception e) {
            throw new AuraHandledException('PDF generation failed: ' + e.getMessage());
        }
    }
}