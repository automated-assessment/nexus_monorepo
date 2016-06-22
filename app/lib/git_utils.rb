class GitUtils
  class << self
    def setup_local_submission_repository!(submission)
      submission.log!('=== Git ===')
      repo_path = Rails.root.join('var', 'submissions', 'code', "#{submission.id}")
      branch_name = "submission-#{submission.id}"

      submission.log!("Using dir: #{repo_path}")
      submission.log!('Initialising git repo...')
      repo = Git.init(repo_path.to_s)
      repo.config('user.name', 'Nexus')
      repo.config('user.email', 'nexus@nexus')
      submission.log!('Checking out new branch for submission...')
      repo.checkout(branch_name, new_branch: true)
      submission.log!('Committing files...')
      repo.add(all: true)
      repo.commit('Submission made via Nexus')
      submission.log!("Commit SHA: #{repo.log[0].sha}")
      submission.commithash = repo.log[0].sha.to_s
      submission.gitbranch = branch_name
      submission.save!
    end

    def setup_remote_assignment_repo!(assignment)
      repo_name = "assignment-#{assignment.id}"
      repo_desc = "Automatically created on #{DateTime.now.utc} by Nexus for assignment \##{assignment.id}"
      res = Octokit.create_repository(repo_name,
                                      organization: Rails.configuration.ghe_org,
                                      private: true,
                                      has_issues: false,
                                      has_wiki: false,
                                      description: repo_desc)
      assignment.repourl = res.clone_url
      assignment.save!
    end

    def push_submission_to_github!(submission)
      repo_path = Rails.root.join('var', 'submissions', 'code', "#{submission.id}")
      repo = Git.init(repo_path.to_s)
      repo.config('user.name', 'Nexus')
      repo.config('user.email', 'nexus@nexus')

      repo.add_remote('origin', submission.assignment.repourl)
      repo.push('origin', submission.gitbranch)

      submission.repourl = submission.assignment.repourl
      submission.save!
    end
  end
end
