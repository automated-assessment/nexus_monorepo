/**
 * Created by adamellis on 08/02/2017.
 */



const test = [1,2,3,4,5];

let testing = test.reduce(function(acc,val){
    console.log(acc,val);
    return acc+val;
},0);


console.log(testing);
