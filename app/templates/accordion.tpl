<section>
<div uib-accordion-group class="panel-default" heading="{{vm.submission.core.student}} submitted number {{vm.submission.core.sid}}" ng-click="vm.clicker(vm.submission.sid)" is-open="false">
    <div ng-include="'app/templates/provideTo.tpl'"></div>
    <div ng-include="'app/templates/receivedFrom.tpl'"></div>
</div>
</section>
