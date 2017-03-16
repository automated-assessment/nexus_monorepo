/**
 * Created by adamellis on 14/03/2017.
 */
//TODO: AcademicController spec
describe('AcademicController',function(){

    let $controller;
    let $httpBackend;


    beforeEach(function(){
        module('PeerFeedback');
        inject(function(_$controller_,_$httpBackend_){
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
        });
    });
});