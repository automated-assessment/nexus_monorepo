/**
 * Created by adamellis on 08/02/2017.
 */

"use strict";

require('dotenv').config();
const request = require('request-promise');



token = process.env.NEXUS_GITHUB_TOKEN;
commitQuery()
    .then(function(response){
    });
function commitQuery() {

    const repo = "assignment-1";
    const options = {
        method: 'POST',
        url: `https://github.kcl.ac.uk/api/v3/repos/NexusDevAdam/${repo}/git/commits`,
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Accept': 'application/vnd.github.v3.html'
        },
        body:{
            message: "Hello",
            tree: "c4678335e7022ebeb123095358383ed1836c24c4",
            parents:[]
        },
        json:true

    };

    return request(options)
        .then(function (response) {
            return response;
        }, function (err) {
            return err;
        });
}
