<section>
    <h3>Received feedback from the following students:</h3>
    <table class="table table-hover">
        <thead>
        <tr>
            <th>Alias</th>
            <th>Allocated on</th>
            <th>Last modified</th>
            <th>Mark</th>
        </tr>
        </thead>
        <tbody>


        <tr ng-repeat="provider in vm.submission.receivedFrom" ng-show="provider.display">
            <td>
                <a ui-sref="frameState.receiverState({receiverSid:{{vm.submission.core.sid}},providerSid:{{provider.providerSid}},token:'{{vm.submission.core.token}}',name:'{{provider.alias}}'})">
                    {{provider.alias}} ({{provider.providerSid}})
                </a></td>
            <td>{{provider.dateAllocated | date: 'shortDate'}}</td>
            <td>{{provider.dateModified | date:'shortDate'}}</td>
            <td>{{provider.providerMark | percent}}</td>

        </tr>


        </tbody>


    </table>
</section>