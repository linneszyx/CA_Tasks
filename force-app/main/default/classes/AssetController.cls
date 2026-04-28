public with sharing class AssetController {

    @AuraEnabled(cacheable=true)
    public static List<Asset> getAsset() {
        Id userId = UserInfo.getUserId();
        User u = [SELECT ContactId, AccountId FROM User WHERE Id = :userId LIMIT 1];
        List<Asset> assetList =  [
            SELECT Id, Name, Status, Product2.Name
            FROM Asset
            WHERE AccountId = :u.AccountId
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
        User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        List<Case> caseList =  [
            SELECT Id, CaseNumber, Subject, Status, CreatedDate
            FROM Case
            WHERE ContactId = :u.ContactId
            ORDER BY CreatedDate DESC
        ];
        return caseList;
    }

    @AuraEnabled(cacheable=true)
public static AssetRep getAssetRT() {
    try {
        User u = [
            SELECT Id, ContactId
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (u.ContactId == null) {
            throw new AuraHandledException('User has no Contact linked');
        }

        Contact c = [
            SELECT Id, AccountId
            FROM Contact
            WHERE Id = :u.ContactId
            LIMIT 1
        ];

        if (c.AccountId == null) {
            throw new AuraHandledException('Contact has no Account linked');
        }

        Map<String, Id> rtMap = new Map<String, Id>();
        for (RecordType rt : [
            SELECT Id, DeveloperName
            FROM RecordType
            WHERE SObjectType = 'Asset'
        ]) {
            rtMap.put(rt.DeveloperName, rt.Id);
        }

        List<Asset> al = [
            SELECT Id, Name, Status,
                   RecordTypeId,
                   Product2.Name,
                   PurchaseDate,
                   InstallDate,
                   Warranty_End__c,
                   Service_Start_Date__c,
                   Service_End_Date__c
            FROM Asset
            WHERE AccountId = :c.AccountId
        ];

        return new AssetRep(al, rtMap);

    } catch (Exception e) {
        throw new AuraHandledException('ERROR: ' + e.getMessage());
    }
}

    public class AssetRep {
        @AuraEnabled public List<Asset> al;
        @AuraEnabled public Map<String, Id> rtMap;

        public AssetRep(List<Asset> al, Map<String, Id> rtMap) {
            this.al = al;
            this.rtMap = rtMap;
        }
    }
}