<div ng-repeat="snippet in vm.submission">
    <h4>{{snippet.fileName}}:</h4>
    <p>
    <div ng-bind-html="snippet.content">
    </div>
    </p>
    <br/>
</div>