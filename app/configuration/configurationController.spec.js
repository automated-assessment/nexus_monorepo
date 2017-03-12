/**
 * Created by adamellis on 12/03/2017.
 */
describe('Test the configuration controller',function(){

    beforeEach(module("PeerFeedback"));

    let $controller;

    beforeEach(inject(function(_$controller_){
        $controller = _$controller_;
    }));

    it('sets the providercounts to a number between 1 and 8',function(){
       let $scope;
       $scope = $controller('configurationController',{$scope:$scope});
       expect($scope).toBe(isDefined);
    });
});