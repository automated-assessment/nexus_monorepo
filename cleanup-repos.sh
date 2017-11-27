#!/bin/bash

url="https://github.kcl.ac.uk/api/v3"

# Extract the values for NEXUS_GITHUB_ORG and NEXUS_GITHUB_TOKEN from .env.list
org=$(cat .env.list | grep NEXUS_GITHUB_ORG | awk -F "=" '/NEXUS_GITHUB_ORG/ {print $2}')
token=$(cat .env.list | grep NEXUS_GITHUB_TOKEN | awk -F "=" '/NEXUS_GITHUB_TOKEN/ {print $2}')

if [[ -z $org ]] || [[ -z $token ]]; then
  echo "Error: Both organistation and token must be set in .env.list for this script to work"
  exit 1
fi

# Required header for api call
token_cmd="Authorization: token $token"

# Get all repos and filter so we are left with an array of repo names
# in the form organisation/repo_name
repos=( $(curl -H "$token_cmd" "$url/orgs/$org/repos" | jq -r '.[].full_name') )

# Delete each repo, echoing out each deleted repo name
for repo in ${repos[@]}
do
  echo $repo
  curl -X "DELETE" -H "$token_cmd" "$url/repos/$repo"
done

exit 0
