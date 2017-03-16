/**
 * Created by adamellis on 16/03/2017.
 */
(function(){
    describe('allocationService',function(){
        let allocationService;
        let $httpBackend;

        const mockResponse = {
            body:"Body of response"
        };

        const failTest = function(){
            fail();

        };

        beforeEach(function(){
            module('PeerFeedback');
            inject(function(_allocationService_,_$httpBackend_){
                allocationService = _allocationService_;
                $httpBackend = _$httpBackend_;

            });
        });

        afterEach(function(){
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should get receivers',function(){
            const mockProviderSid = 3;

            allocationService.getReceivers(mockProviderSid)
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

            allocationService.getProviders(mockReceiverSid)
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

            allocationService.getAllocation(mockQuery.receiverSid,mockQuery.providerSid)
                .then(testGetAllocation,failTest);

            function testGetAllocation(allocation){
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

            allocationService.updateAllocation(mockQuery.receiverSid,mockQuery.providerSid,mockUpdate)
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