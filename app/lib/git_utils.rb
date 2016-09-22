class GitUtils
  class << self
    def gen_repo_path(submission)
      Rails.root.join('var', 'submissions', 'code', "#{submission.id}")
    end

    def gen_tmp_path(submission)
      Rails.root.join('var', 'submissions', 'tmp', "#{submission.id}")
    end

    def gen_branch_name(submission)
      "submissions-u#{submission.user.uid}-l#{submission.user.ghe_login}"
    end

    def gen_commit_msg(submission)
      "Submission via Nexus [sid #{submission.id} triggered by uid #{submission.user.uid} (#{submission.user.name})]"
    end

    def init_gitobj(submission)
      repo_path = gen_repo_path(submission)
      # Ensure this isn't a Git repo already (safety catch in case a previous push went wrong)
      FileUtils.rm_rf(File.join(repo_path, ".git"), secure: true) if Dir.exists?(File.join(repo_path, ".git"))

      Dir.chdir(repo_path) do
        git_init_out = `git init`
        submission.log("Output from git init command: #{git_init_out}", 'Debug')
      end
      repo = Git.open(repo_path.to_s)
      repo.config('user.name', 'Nexus')
      repo.config('user.email', 'nexus@nexus')
      repo
    end

    def push!(submission)
      if Submission.where(user: submission.user, repourl: submission.assignment.repourl).empty?
        first_time_push!(submission)
      else
        subsequent_push!(submission)
      end
    end

    def first_time_push!(submission)
      # binding.pry
      # init repo; checkout new branch; add all files; commit; push
      repo = init_gitobj(submission)
      branch_name = gen_branch_name(submission)
      repo.checkout(branch_name, new_branch: true)
      repo.add(all: true)
      repo.commit(gen_commit_msg(submission))
      submission.repourl = submission.assignment.repourl
      repo.add_remote('origin', submission.augmented_clone_url)
      repo.push('origin', branch_name)

      submission.log('Submission stored on GHE (new branch created)', 'success')
      submission.gitbranch = branch_name
      submission.commithash = repo.log[0].sha.to_s
      submission.git_success = true
      submission.save!
    rescue StandardError
      submission.log("Git process failed: #{$ERROR_INFO.message}", 'Error')
      submission.repourl = 'ERR'
      submission.gitbranch = 'ERR'
      submission.commithash = 'ERR'
      submission.git_success = false
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
      submission.repourl = submission.assignment.repourl
      repo.add_remote('origin', submission.augmented_clone_url)
      repo.pull('origin', branch_name)
      repo.checkout(branch_name)
      # Remove all files, if any
      repo.remove('.', recursive: true) unless Dir["#{repo_path}/*"].reject{|fname| fname == '.' || fname == '..'}.empty?
      # move files back
      FileUtils.cd(tmp_path) do
        FileUtils.mv Dir.glob('*'), repo_path
      end
      repo.add(all: true)
      repo.commit(gen_commit_msg(submission), allow_empty: true)
      repo.push('origin', branch_name)

      submission.log('Submission stored on GHE (used existing branch)', 'success')
      submission.gitbranch = branch_name
      submission.commithash = repo.log[0].sha.to_s
      submission.git_success = true
      submission.save!
    rescue StandardError
      submission.log("Git process failed: #{$ERROR_INFO.message}", 'Error')
      submission.repourl = 'ERR'
      submission.gitbranch = 'ERR'
      submission.commithash = 'ERR'
      submission.git_success = false
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

      assignment.log("Created GHE repo for assignment (#{assignment.repourl})", 'success')
      return true
    rescue Octokit::ClientError
      return false
    end

    def has_valid_repo?(submission)
      if (submission.studentrepo)
        aug_url = submission.augmented_clone_url
        refs = Git.ls_remote(aug_url)
        unless (refs['branches'].nil?)
          # Check the branch mentioned exists
          return !refs['branches'][submission.gitbranch].nil?
          # TODO Really should also be checking commit SHA existence, but I cannot seem to figure out how to do this without a full-fletched fetch of the branch, which I would prefer to avoid :-)
        else
          # No branches exist at all in remote repo
          return false
        end
      else
        # We've constructed the repo ourselves so this should be OK by default
        return true
      end
    end
  end
end
