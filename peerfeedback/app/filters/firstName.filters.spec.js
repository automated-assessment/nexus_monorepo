/**
 * Created by adamellis on 19/03/2017.
 */

(function(){
    'use strict';

    describe('firstName',function(){

        let firstNameFilter;

        beforeEach(function(){
            module('PeerFeedback');
            inject(function(_firstNameFilter_){
                firstNameFilter = _firstNameFilter_;
            })
        });

        describe('return the first name of the student',function(){
            it('should accept a standard input',function(){
                expect(firstNameFilter("Joe Bloggs")).toBe("Joe");
            });

            it('should accept a double barrel first name',function(){
                expect(firstNameFilter("Joe-Barty Bloggs")).toBe("Joe-Barty");
            });

            it('should accept a first initial as a name',function(){
                expect(firstNameFilter("J Bloggs")).toBe("J");
            })
        })
    });
}());
