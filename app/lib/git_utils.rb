class GitUtils
  class << self
    def gen_repo_path(submission)
      Rails.root.join('var', 'submissions', 'code', submission.id.to_s)
    end

    def gen_tmp_path(submission)
      Rails.root.join('var', 'submissions', 'tmp', submission.id.to_s)
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
      FileUtils.rm_rf(File.join(repo_path, '.git'), secure: true) if Dir.exist?(File.join(repo_path, '.git'))

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
      submission.log("Moved files to tmp directory: #{tmp_path}", 'Debug')
      # init repo; pull remote branch; rm all; add all; commit; push
      repo = init_gitobj(submission)
      branch_name = gen_branch_name(submission)
      submission.repourl = submission.assignment.repourl
      repo.add_remote('origin', submission.augmented_clone_url)
      repo.pull('origin', branch_name)
      repo.checkout(branch_name)
      # Remove all files, if any
      repo.remove('.', recursive: true) unless Dir["#{repo_path}/*"].reject { |fname| fname == '.' || fname == '..' }.empty?
      # move files back
      FileUtils.cd(tmp_path) do
        FileUtils.mv Dir.glob('*'), repo_path
      end
      submission.log("Moved files back to code directory: #{repo_path}", 'Debug')
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
      client = Octokit::Client.new(login: Rails.configuration.ghe_user, password: Rails.configuration.ghe_password)
      res = client.create_repository(repo_name,
                                     organization: Rails.configuration.ghe_org,
                                     private: true,
                                     has_issues: false,
                                     has_wiki: false,
                                     description: repo_desc)
      assignment.repourl = res.clone_url
      assignment.save!

      assignment.log("Created GHE repo for assignment (#{assignment.repourl})", 'success')
      return true
    rescue StandardError => e
      Rails.logger.error "Error creating assignment repository for assignment #{assignment.id}, #{assignment.title}: #{e.inspect}"
      assignment.log("Error creating assignment repository: #{e.inspect}", 'Error')
      return false
    end

    # Danger, Will Robinson!
    # Attempts to repush the files for all submissions to this assignment between the two ids given (incl)
    # Lots of reasons why this could go wrong, but when GHE loses files due to storage crash and backup issues,
    # what can you do...
    def repush_submission_files!(assignment, min_id, max_id)
      assignment.log("Attempting to re-push submissions #{min_id}--#{max_id}.", 'info')

      # First need to reset repourl field for all submissions we are going to be treating
      assignment.log('Removing repourl markers.', 'debug')
      assignment.submissions.where('id >= ? AND id <= ?', min_id, max_id).update_all repourl: nil

      # Now need to iterate over all of these submissions and do a push for each one
      assignment.submissions.unscoped.order(:id).where('id >= ? AND id <= ?', min_id, max_id).each do |s|
        Rails.logger.debug("Re-pushing submission #{s.id}.")
        s.log('Re-pushing', 'info')
        push!(s)

        raise "There was a problem re-pushing submission #{s.id}" unless s.git_success
      end

      assignment.log("Successfully re-pushed submissions #{min_id}--#{max_id}.", 'success')
      return true
    rescue StandardError => e
      Rails.logger.error("Couldn't re-push: #{e.inspect}.")
      assignment.log("Couldn't re-push submissions #{min_id}--#{max_id}: #{e.inspect}.", 'error')

      return false
    end

    def valid_repo?(submission)
      return true unless submission.studentrepo # We've constructed the repo ourselves so this should be OK by default

      submission_user = submission.user
      client = Octokit::Client.new(login: submission_user.ghe_login, access_token: submission_user.githubtoken)

      # Split on / and grab the last two entries (user and repo name)
      # Join the two with a slash and remove the .git extension
      owner_repo = submission.repourl.split('/')[-2..-1].join('/')[0..-5]

      # Check repo/branch existence
      branch = client.branch(owner_repo, submission.gitbranch.strip)
      return false unless branch

      # Branch exists.
      # Return true is sha exists
      valid_sha?(branch[:commit], submission.commithash.strip)
    end

    private

    def valid_sha?(branch_commits, submission_sha)
      binding.pry
      # Check if sha is most recent commit
      return true if branch_commits[:sha].start_with? submission_sha

      # Not most recent commit, so check all previous
      parent_commits = branch_commits[:parents]
      parent_commits.each do |commit|
        return true if commit[:sha].start_with? submission_sha
      end
      false
    end
  end
end
