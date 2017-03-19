/**
 * Created by adamellis on 16/03/2017.
 */
(function(){
    'use strict';

    describe('allocationNetService',function(){
        let allocationNetService;
        let $httpBackend;

        const mockResponse = {
            body:"Body of response"
        };

        const failTest = function(){
            fail();

        };

        beforeEach(function(){
            module('PeerFeedback');
            inject(function(_allocationNetService_,_$httpBackend_){
                allocationNetService = _allocationNetService_;
                $httpBackend = _$httpBackend_;

            });
        });

        afterEach(function(){
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should get receivers',function(){
            const mockProviderSid = 3;

            allocationNetService.getReceivers(mockProviderSid)
                .then(testReceivers,failTest);

            function testReceivers(receivers){
                expect(receivers.data.body).toBe(mockResponse.body);
            }

            $httpBackend
                .expectGET(`/api/allocations/receivers/${mockProviderSid}`)
                .respond(200,mockResponse);

            $httpBackend.flush();
        });

        it('should get providers',function(){
            const mockReceiverSid = 3;

            allocationNetService.getProviders(mockReceiverSid)
                .then(testProviders,failTest);

            function testProviders(providers){
                expect(providers.data.body).toBe(mockResponse.body);
            }

            $httpBackend
                .expectGET(`/api/allocations/providers/${mockReceiverSid}`)
                .respond(200,mockResponse);

            $httpBackend.flush();
        });

        it('should get an allocation',function(){
            const mockQuery = {
                receiverSid:3,
                providerSid:4
            };

            allocationNetService.getOneAllocation(mockQuery.receiverSid,mockQuery.providerSid)
                .then(testGetOneAllocation,failTest);

            function testGetOneAllocation(allocation){
                expect(allocation.data.body).toBe(mockResponse.body);
            }

            $httpBackend
                .expectGET(`/api/allocations/${mockQuery.receiverSid}/${mockQuery.providerSid}`)
                .respond(200,mockResponse);

            $httpBackend.flush();
        });

        it('should update an allocation',function(){

            const mockQuery = {
                receiverSid:3,
                providerSid:4
            };

            const mockUpdate = {
                body:"This is the update body"
            };

            allocationNetService.updateAllocation(mockQuery.receiverSid,mockQuery.providerSid,mockUpdate)
                .then(testUpdateAllocation,failTest);

            function testUpdateAllocation(allocation){
                expect(allocation.data.body).toBe(mockResponse.body);
            }

            $httpBackend
                .expectPUT(`/api/allocations/${mockQuery.receiverSid}/${mockQuery.providerSid}`,mockUpdate)
                .respond(200,mockResponse);

            $httpBackend.flush();
        });
    });
}());