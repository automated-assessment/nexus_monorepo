<section>
<div uib-accordion-group class="panel-default" heading="{{vm.submission.core.student}}, submission number: {{vm.submission.core.sid}}" is-open="false">
    <div ng-include="'app/templates/allocation/provideTo.tpl.html'"></div>
    <div ng-include="'app/templates/allocation/receivedFrom.tpl.html'"></div>
</div>
</section>
