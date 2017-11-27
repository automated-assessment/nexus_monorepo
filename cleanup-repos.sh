#!/bin/bash

# Get List of all repos
url="https://github.kcl.ac.uk/api/v3"
org=$(cat .env.list | grep NEXUS_GITHUB_ORG | awk -F "=" '/NEXUS_GITHUB_ORG/ {print $2}')
token=$(cat .env.list | grep NEXUS_GITHUB_TOKEN | awk -F "=" '/NEXUS_GITHUB_TOKEN/ {print $2}')

if [[ -z $org ]] || [[ -z $token ]]; then
  echo "Error: Both organistation and token must be set in .env.list for this script to work"
  exit 1
fi

token_cmd="Authorization: token $token"
repos=( $(curl -H "$token_cmd" "$url/orgs/$org/repos" | jq -r '.[].full_name') )

for repo in ${repos[@]}
do
  echo $repo
  curl -X "DELETE" -H "$token_cmd" "$url/repos/$repo"
done

exit 0
