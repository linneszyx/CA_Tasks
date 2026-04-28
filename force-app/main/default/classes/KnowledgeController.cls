public with sharing class KnowledgeController {
    @AuraEnabled(cacheable=true)
    public static List<Knowledge__kav> getArticles() {
        try {
            List<Knowledge__kav> kk =  [SELECT Id, Title, Summary, UrlName FROM Knowledge__kav WHERE PublishStatus = 'Online' AND Language = 'en_US' ];
            return kk;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to retrieve knowledge articles: ' + e.getMessage());
        }
    }
}
