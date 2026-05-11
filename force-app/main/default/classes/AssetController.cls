public without sharing class AssetController 
{
    @AuraEnabled(cacheable=true)
    public static List<Asset> getAsset() {
        Id userId = UserInfo.getUserId();
        User u = [SELECT ContactId, AccountId FROM User WHERE Id = :userId LIMIT 1];
        List<Asset> assetList =  [
            SELECT Id, Name, Status, Product2.Name,Warranty_Status__c
            FROM Asset  WHERE AccountId = :u.AccountId
        ];
        return assetList;
       
    }
    @AuraEnabled
    public static Case createCase(Id assetId, String subject, String description) {
        try {
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            Case c = new Case(
                Subject = subject,
                Description = description,
                AssetId = assetId,
                ContactId = u.ContactId,
                Origin = 'Web'
            );
            insert c;
            return c;   

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Case> getAllCases() {
        User u = [SELECT Id, AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        if (u.AccountId == null) {
            throw new AuraHandledException('User has no Account linked');
        }
        List<Contact> contactsForAccount = [SELECT Id FROM Contact WHERE AccountId = :u.AccountId LIMIT 1];
        if (contactsForAccount.isEmpty()) {
            return new List<Case>();
        }
        Id contactId = contactsForAccount[0].Id;
        List<Case> caseList =  [ SELECT Id, CaseNumber, Subject, Status, CreatedDate FROM Case WHERE ContactId = :contactId ORDER BY CreatedDate DESC];
        return caseList;
    }
    @AuraEnabled(cacheable=true)
    public static AssetRep getAssetRT() 
    {
        try {
            User u = [SELECT Id, AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (u.AccountId == null) {
                throw new AuraHandledException('User has no Account linked');
            }
            List<Contact> contacts = [ SELECT Id, AccountId FROM Contact WHERE AccountId = :u.AccountId LIMIT 1 ];
            if (contacts.isEmpty()) {
                throw new AuraHandledException('No Contact found for user Account');
            }
            Contact c = contacts[0];
            Map<String, Id> rtMap = new Map<String, Id>();
            for (RecordType rt : [SELECT Id, DeveloperName FROM RecordType WHERE SObjectType = 'Asset']) {
                rtMap.put(rt.DeveloperName, rt.Id);
            }
            List<Asset> al = [ SELECT Id, Name, Status, RecordTypeId, Product2.Name, PurchaseDate, Service_Type__c, Warranty_End__c, Warranty_Status__c, Quantity, Service_Start_Date__c, Service_End_Date__c FROM Asset WHERE AccountId = :c.AccountId];
            return new AssetRep(al, rtMap);
        } 
        catch (Exception e) {
            throw new AuraHandledException('ERROR: ' + e.getMessage());
        }
    }
     @AuraEnabled 
        public static Asset extendWarranty(Id assetId,Integer months) {
         Asset a = [SELECT Id,Warranty_End__c FROM Asset WHERE Id=:assetId LIMIT 1];
          if (a.Warranty_End__c == null) {
            a.Warranty_End__c = System.today().addMonths(months);
        } 
        else {
        a.Warranty_End__c = a.Warranty_End__c.addMonths(months);
     }
        update a;
        return a;
    }
    @AuraEnabled
    public static void extendWarrantyDate(Id assetId, Date newDate) {
     Asset a = [ SELECT Id, Warranty_End__c FROM Asset WHERE Id = :assetId LIMIT 1 ];
     a.Warranty_End__c = newDate;
     if (newDate >= System.today()) {
        a.Warranty_Status__c = 'Active';
      } 
      else {
        a.Warranty_Status__c = 'Expired';
      }
    update a;
}
    public class AssetRep {
        @AuraEnabled public List<Asset> al;
        @AuraEnabled public Map<String, Id> rtMap;
        public AssetRep(List<Asset> al, Map<String, Id> rtMap) {
            this.al = al;
            this.rtMap = rtMap;
        }
    }

    @AuraEnabled
    public static Asset updateServiceStatus(Id assetId, String newStatus) {
        try {
            if (assetId == null || String.isBlank(newStatus)) {
                throw new AuraHandledException('Asset Id and newStatus are required');
            }
            Asset a = [SELECT Id, Status FROM Asset WHERE Id = :assetId LIMIT 1];
            a.Status = newStatus;
            update a;
            return a;
        } catch (Exception e) {
            throw new AuraHandledException('ERROR updating status: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Asset updateServiceStatusWithExtension(Id assetId, String newStatus, Integer monthsToAdd) {
        try {
            if (assetId == null || String.isBlank(newStatus) || monthsToAdd == null) {
                throw new AuraHandledException('assetId, newStatus and monthsToAdd are required');
            }
            Asset a = [SELECT Id, Status, Service_End_Date__c, Service_Start_Date__c FROM Asset WHERE Id = :assetId LIMIT 1];
            a.Status = newStatus;
            a.Service_Start_Date__c = System.today();
            if (a.Service_End_Date__c == null) {
                a.Service_End_Date__c = System.today().addMonths(monthsToAdd);
            } else {
                a.Service_End_Date__c = a.Service_End_Date__c.addMonths(monthsToAdd);
            }
            update a;
            return a;
        } catch (Exception e) {
            throw new AuraHandledException('ERROR updating status with extension: ' + e.getMessage());
        }
    }
}
