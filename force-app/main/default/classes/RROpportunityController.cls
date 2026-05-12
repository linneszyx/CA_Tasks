public with sharing class RROpportunityController {
  @AuraEnabled 
  public static Opportunity createOpportunity(Opportunity op) {
    insert op;
    return op;
  }
  @AuraEnabled(cacheable=true) 
  public static Opportunity getOpportunity(Id oppId) {
    Opportunity op = [SELECT Id,Name,Country__c,Locked_For_Editing__c,Approval_Status__c FROM Opportunity WHERE Id=:oppId];
    return op;
  }
  @AuraEnabled(cacheable=true) 
  public static Id getPricebookId(String country) {
    Country_Pricebook_Config__mdt con = [SELECT Pricebook_Name__c FROM Country_Pricebook_Config__mdt WHERE Country__c = :country LIMIT 1];
    Pricebook2 pb = [SELECT Id FROM Pricebook2 WHERE Name =:con.Pricebook_Name__c LIMIT 1];
    return pb.Id;
  }
  @AuraEnabled(cacheable=true) 
  public static List<PricebookEntry> getProducts(Id pricebookId) {
    List<PricebookEntry> pbeList = [SELECT id,UnitPrice,Product2.Name FROM PricebookEntry WHERE Pricebook2Id = :pricebookId AND IsActive = true];
    return pbeList;
  }
  @AuraEnabled 
  public static void saveProducts(List<OpportunityLineItem> oli) {
    insert oli;
  }
}