class GitUtils
  class << self
    def gen_repo_path(submission)
      Rails.root.join('var', 'submissions', 'code', "#{submission.id}")
    end

    def gen_tmp_path(submission)
      Rails.root.join('var', 'submissions', 'tmp', "#{submission.id}")
    end

    def gen_branch_name(submission)
      "submissions-u#{submission.user.uid}"
    end

    def gen_commit_msg(submission)
      "Submission via Nexus [sid #{submission.id} triggered by uid #{submission.user.uid} (#{submission.user.name})]"
    end

    def init_gitobj(submission)
      repo_path = gen_repo_path(submission)
      repo = Git.init(repo_path.to_s)
      repo.config('user.name', 'Nexus')
      repo.config('user.email', 'nexus@nexus')
      repo
    end

    def first_time_push!(submission)
      # init repo; checkout new branch; add all files; commit; push
      repo = init_gitobj(submission)
      branch_name = gen_branch_name(submission)
      repo.checkout(branch_name, new_branch: true)
      repo.add(all: true)
      repo.commit(gen_commit_msg(submission))
      repo.add_remote('origin', submission.assignment.repourl)
      repo.push('origin', branch_name)

      submission.gitbranch = branch_name
      submission.repourl = submission.assignment.repourl
      submission.commithash = repo.log[0].sha.to_s
      submission.save!
    end

    def subsequent_push!(submission)
      # move files to a temporary location while we pull and remove
      repo_path = gen_repo_path(submission)
      tmp_path = gen_tmp_path(submission)
      FileUtils.mkdir_p tmp_path
      FileUtils.cd(repo_path) do
        FileUtils.mv Dir.glob('*'), tmp_path
      end
      # init repo; pull remote branch; rm all; add all; commit; push
      repo = init_gitobj(submission)
      branch_name = gen_branch_name(submission)
      repo.add_remote('origin', submission.assignment.repourl)
      repo.pull('origin', branch_name)
      repo.checkout(branch_name)
      repo.remove('.', recursive: true)
      # move files back
      FileUtils.cd(tmp_path) do
        FileUtils.mv Dir.glob('*'), repo_path
      end
      repo.add(all: true)
      repo.commit(gen_commit_msg(submission), allow_empty: true)
      repo.push('origin', branch_name)

      submission.gitbranch = branch_name
      submission.repourl = submission.assignment.repourl
      submission.commithash = repo.log[0].sha.to_s
      submission.save!
    end

    def setup_remote_assignment_repo!(assignment)
      repo_name = "assignment-#{assignment.id}"
      repo_desc = "Automatically created on #{DateTime.now.utc} by Nexus for assignment id #{assignment.id}"
      res = Octokit.create_repository(repo_name,
                                      organization: Rails.configuration.ghe_org,
                                      private: true,
                                      has_issues: false,
                                      has_wiki: false,
                                      description: repo_desc)
      assignment.repourl = res.clone_url
      assignment.save!
    end
  end
end
