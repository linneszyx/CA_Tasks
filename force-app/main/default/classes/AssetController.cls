public with sharing class AssetController {
    @AuraEnabled(cacheable=true)
    public static List<Asset> getAsset() {
        List<Asset> assetList = [SELECT Id,Name,Product2.Name,Status FROM Asset WHERE ContactId =:UserInfo.getUserId()];
        return assetList;
    }
}