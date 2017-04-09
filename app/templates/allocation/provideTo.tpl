<section>
    <h3>Provide feedback for the following students:</h3>
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
        <tr ng-repeat="receiver in vm.submission.provideTo" ng-class="{danger: !receiver.provided}">
            <td>
                <a ui-sref="frameState.providerState({receiverSid:{{receiver.receiverSid}},providerSid:{{vm.submission.core.sid}},aid:{{vm.submission.core.aid}},token:'{{vm.auth.token}}',email:'{{vm.auth.email}}',academic:'{{vm.academic}}'})">
                    {{receiver.alias}} ({{receiver.receiverSid}})
                </a></td>
            <td>{{receiver.dateAllocated | date: 'shortDate'}}</td>
            <td>{{receiver.dateModified | date:'shortDate'}}</td>
            <td>{{receiver.providerMark | percent}}</td>
        </tr>

        </tbody>
    </table>
</section>