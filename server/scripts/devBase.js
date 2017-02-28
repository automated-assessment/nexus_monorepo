/**
 * Created by adamellis on 08/02/2017.
 */

const randomName = require('node-random-name');

for(let i=0;i<150;i++){
    console.log(randomName({ seed:Math.random()}));
}

