/**
 * Created by adamellis on 02/03/2017.
 */
(function(){
    angular.module('PeerFeedback')
        .service('NotificationService',['$anchorScroll',function($anchorScroll){


            const notification = {
                text:"",
                type:"",
                display:""
            };

            this.getNotification = function(){
                return notification;
            };

            this.createNotification = function(text,type) {
                notification.text = text;
                notification.type = type;
                notification.display = true;
                $anchorScroll();
            };

            this.hideNotification = function(){
                notification.display = false;
            }



        }])


}());