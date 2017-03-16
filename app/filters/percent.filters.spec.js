/**
 * Created by adamellis on 16/03/2017.
 */
(function(){
    describe('percent',function(){
        let percentFilter;

        beforeEach(function(){
            module('PeerFeedback');
            inject(function(_percentFilter_){
                percentFilter = _percentFilter_;
            });
        });

        it('should add a percentage to input',function(){
            expect(percentFilter('60')).toBe('60%');
        });

        it('should return an empty string if input is null',function(){
            expect(percentFilter(null)).toBe('');
        })
    });
}());