public with sharing class RROpportunityApproval {
   @AuraEnabled 
   public static void submitForApproval(Id oppId) {
    Opportunity opp = [SELECT Id FROM Opportunity WHERE Id=:oppId];
    opp.Locked_For_Editing__C = true;
    opp.Approval_Status__c = 'Pending';
    update opp;
    Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();
    req.setObjectId(oppId);
    Approval.process(req);
   }
}