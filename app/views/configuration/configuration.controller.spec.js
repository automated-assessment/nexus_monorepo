/**
 * Created by adamellis on 12/03/2017.
 */
(function(){
    describe('Test the configuration controller',function() {
        let $controller,$scope,NotificationService;

        beforeEach(function(){
            module('PeerFeedback');
            inject(function(_$controller_,_$rootScope_,_NotificationService_){
                NotificationService = _NotificationService_;
                $scope = {};
                $controller = _$controller_('configurationController',{
                    $scope:$scope,
                    NotificationService:NotificationService
                });
            })
        });

        it('tests',function(){

        })



    })
}());