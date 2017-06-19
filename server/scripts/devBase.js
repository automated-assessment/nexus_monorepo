/**
 * Created by adamellis on 08/02/2017.
 */

const randomName = require('node-random-name');

for(var i=0;i<100;i++){
    console.log(randomName({seed:Math.random()}));
}
