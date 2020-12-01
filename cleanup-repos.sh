#!/bin/bash

url="https://api.github.com"

# Extract the values for NEXUS_GITHUB_ORG and NEXUS_GITHUB_TOKEN from .env.list
org=$(cat .env.list | grep NEXUS_GITHUB_ORG | awk -F "=" '/NEXUS_GITHUB_ORG/ {print $2}')
token=$(cat .env.list | grep NEXUS_GITHUB_TOKEN | awk -F "=" '/NEXUS_GITHUB_TOKEN/ {print $2}')

if [[ -z $org ]] || [[ -z $token ]]; then
  echo "Error: Both organistation and token must be set in .env.list for this script to work"
  exit 1
fi

echo "Are you sure you want to delete all assignment repositories in the $org organisation. [Y|y]"
read prompt

if [[ $prompt -ne "Y" ]] && [[ $prompt -ne "y" ]]; then
  exit 0
fi

# Required header for api call
token_cmd="Authorization: token $token"

# Get all repos and filter so we are left with an array of repo names
# in the form organisation/repo_name
repos=( $(curl -H "$token_cmd" --silent "$url/orgs/$org/repos" | jq -r '.[].full_name') )

repos_deleted=0
# Delete each repo, echoing out each deleted repo name
for repo in ${repos[@]}
do
  # Check that repo to delete starts with the organisation/assignment-
  if [[ "$repo" =~ ^$org/assignment-* ]]; then
    echo "Deleting $repo"
    # Delete if assignment name is prefixed with `org/assignment-`
    response=$(curl -X "DELETE" -H "$token_cmd" --silent --write-out '%{http_code}' "$url/repos/$repo")

    # If curl yields a 403
    # exit loop because org has forbidden repo deletion by members
    if [[ $response == 403 ]]; then
      echo "Error 403: You do not have permission to remove organisation repositories"
      exit 1
    fi
    repos_deleted=$((repos_deleted+=1))
  fi
done
echo "$repos_deleted repositories deleted from $org"
exit 0
