/**
 * Created by adamellis on 02/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .service('notification',['$anchorScroll',function($anchorScroll){


            const notification = {
                text:"",
                type:"",
                display:""
            };

            this.get = function(){
                return notification;
            };

            this.create = function(text,type) {
                notification.text = text;
                notification.type = type;
                notification.display = true;
                $anchorScroll();
            };

            this.hide = function(){
                notification.display = false;
            };

            this.SUCCESS = "success";
            this.FAILURE = "danger";




        }])


}());