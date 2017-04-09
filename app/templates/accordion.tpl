<section>
<div uib-accordion-group class="panel-default" heading="{{vm.submission.core.student}} submitted number {{vm.submission.core.sid}}" is-open="false">
    <div ng-include="'app/templates/allocation/provideTo.tpl'"></div>
    <div ng-include="'app/templates/allocation/receivedFrom.tpl'"></div>
</div>
</section>
