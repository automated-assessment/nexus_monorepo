<h4>Please provide the following feedback:</h4>



<p><form render-form current-form="vm.provider.currentForm" disable="vm.readOnly"></form></p>

Please indicate how well you think the student performed:

<span uib-rating ng-model="vm.mark.rate" max="vm.mark.max" read-only="vm.mark.isReadonly"
      on-hover="vm.mark.hoveringOver(value)" on-leave="vm.mark.overStar = null"
      aria-labelledby="default-rating"></span>
<span class="label"
      ng-class="{'label-warning': vm.mark.percent<30, 'label-info': vm.mark.percent>=30 && vm.mark.percent<70, 'label-success': vm.mark.percent>=70}"
      ng-show="vm.mark.overStar && !vm.mark.isReadonly">{{vm.mark.percent}}%</span>

