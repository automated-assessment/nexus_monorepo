class GitUtils
  class << self
    # Assignment definition utils
    def gen_assignment_path(assignment)
      Rails.root.join('var', 'assignments', 'code', assignment.id.to_s)
    end

    def gen_tmp_assignment_path()
      Rails.root.join('var', 'assignments', 'tmp', SecureRandom.alphanumeric(10))
    end
    
    # def clone_assignment(repo_url, assignment)
    #   assignment_path = gen_assignment_path(assignment)

    #   # Nuke whatever repo was there before
    #   FileUtils.rm_rf(assignment_path, secure: true) if Dir.exist?(assignment_path)

    #   Git.clone(repo_url, assignment_path)
    # end
    
    # Clones an assignment to a temporary directory and returns the path to it
    def clone_tmp_assignment(repo_url)
      tmp_path = gen_tmp_assignment_path()
      # Nuke whatever repo was there before
      FileUtils.rm_rf(tmp_path, secure: true) if Dir.exist?(tmp_path)
      # Need to set this, otherwise, if an invalid url is given, it will freeze nexus
      ENV['GIT_TERMINAL_PROMPT'] = '0'
      Git.clone(repo_url, tmp_path)
      return tmp_path
    end

    # Moves an assignment repository from a temporary directory to a permanent one
    def move_tmp_assignment_repo(tmp_path, assignment)
      # Delete the assignment git repo directory if it exists, maybe something
      # went wrong before. We want to completely replace it.
      delete_assignment_repo(assignment)

      assignment_path = gen_assignment_path(assignment)
      FileUtils.mv(tmp_path, assignment_path)
    end

    # Deletes assignment repository directory if it exists
    def delete_assignment_repo(assignment)
      assignment_path = gen_assignment_path(assignment)
      FileUtils.rm_rf(assignment_path, secure: true) if Dir.exist?(assignment_path)
    end

    def pull_assignment(assignment)
      assignment_path = gen_assignment_path(assignment)
      raise "Assignment has no folder, therefore it cannot be pulled from a git repo" unless Dir.exist?(File.join(assignment_path, '.git'))

      g = Git.open(assignment_path, :log => Logger.new(STDOUT))
      g.pull
      return true
    rescue StandardError => e
      Rails.logger.error "Error pulling assignment repository for assignment #{assignment.id}, #{assignment.title}: #{e.inspect}"
      assignment.log("Error pulling assignment repository: #{e.inspect}", 'error')
      return false
    end

    def get_assignment_config(assignment)
      return get_assignment_config_from_path(gen_assignment_path(assignment))
    end
    
    def get_grader_config(assignment)
      return get_grader_config_from_path(gen_assignment_path(assignment))
    end

    def get_assignment_config_from_path(path)
      assignment_config_file = File.join(path, 'assignment.yml')
      assignment_config = YAML.load(File.read(assignment_config_file))
      return assignment_config
    end
    
    def get_grader_config_from_path(path)
      grader_config_file = File.join(path, 'grader-config.yml')
      grader_config = YAML.load(File.read(grader_config_file))
      return grader_config
    end

    def convert_marking_tool_names_to_ids(name)
      # Temporary solution
      id_map = {
        'nexus' => '1',
        'javac' => '2',
        'rng' => '3',
        'conf' => '4',
        'iotool' => '5',
        'junit' => '6'
      }
      return id_map[name]
    end

    def gen_marking_tool_attributes(grader)
      attributes = {
        'marking_tool_id' => convert_marking_tool_names_to_ids(grader['name']),
        'weight' => grader['weight'].to_s,
        'condition' => grader['condition'].to_s,
        'context' => grader['context'],
        '_destroy' => 'false'
      }
      return attributes
    end

    def gen_marking_tool_contexts_attributes(grader_config)
      marking_tool_contexts_attributes = grader_config.map.with_index { |grader, idx| [idx.to_s, gen_marking_tool_attributes(grader)] }.to_h
      return marking_tool_contexts_attributes
    end
    
    def convert_uat_parameter_type_name_to_type(name)
      # Temporary solution
      id_map = {
        'int' => '1',
        'float' => '2',
        'double' => '3',
        'string' => '4',
        'boolean' => '5'
      }
      return id_map[name]
    end

    def gen_uat_parameters(uat)
      parameters = {
        'name' => uat['name'],
        'type' => convert_uat_parameter_type_name_to_type(uat['type']),
        'construct' => uat['construction_constraints'],
        '_destroy' => ''
      }
      return parameters
    end

    def gen_uat_parameters_attributes(assignment_config)
      if assignment_config['is_unique']
        if assignment_config['uat_parameters']
          uat_parameters_attributes = assignment_config['uat_parameters'].map.with_index { |uat, idx| [idx, gen_uat_parameters(uat)] }.to_h
          return uat_parameters_attributes
        else
          # A default uat_parameters_attributes is sent if assignment is unique, but all parameters are removed
          return {
            "0" => {
              "name" => "name",
              "type" => "1",
              "construct" => "",
              "_destroy" => "1"
            }
          }
        end
      else
        # A default uat_parameters_attributes is sent even if assignment isn't unique, so we replicate it
        return {
          "0" => {
            "name" => "name",
            "type" => "1",
            "construct" => "",
            "_destroy" => ""
          }
        }
      end
    end

    def gen_active_services(grader_config)
      active_services = grader_config.map.with_index { |grader, idx| [idx.to_s, grader['depends-on']] }.select {|grader| grader[1] != nil }.to_h
      return active_services
    end

    def convert_assignment_config_format(course_id, assignment_config, grader_config)
      assignment = {
        'course_id' => course_id,
        'title' => assignment_config['title'],
        'is_unique' => assignment_config['is_unique'],
        'description' => assignment_config['description'],
        'start' => assignment_config['start'],
        'deadline' => assignment_config['deadline'],
        'max_attempts' => assignment_config['max_attempts'],
        'allow_late' => assignment_config['allow_late'],
        'feedback_only' => assignment_config['feedback_only'],
        'late_cap' => assignment_config['late_cap'],
        'latedeadline' => assignment_config['latedeadline'],
        'allow_zip' => assignment_config['allow_zip'],
        'allow_git' => assignment_config['allow_git'],
        'allow_ide' => assignment_config['allow_ide'],
        'marking_tool_contexts_attributes' => gen_marking_tool_contexts_attributes(grader_config),
        'uat_parameters_attributes' => gen_uat_parameters_attributes(assignment_config),
        'active_services' => gen_active_services(grader_config)
      }
      return assignment
    end

    # Submission utils
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
      # Get the repo path in the file system and
      # generate a tmp path to store files while updating the git repo.
      repo_path = gen_repo_path(submission)
      tmp_path = gen_tmp_path(submission)

      # move files to a temporary location while we pull and remove
      FileUtils.mkdir_p tmp_path
      FileUtils.cd(repo_path) do
        # Also make sure . files are moved
        FileUtils.mv all_files_except_git, tmp_path
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
      # Everything but not .git
      FileUtils.cd(repo_path) do
        # Remove all files that are not . or .. or .git
        FileUtils.rm_r(all_files_except_git)
      end

      # Remove everything from the remote repo in preparation
      # for the new push
      repo.remove('.', recursive: true)

      # move files back from temporary location to
      # local repository location
      FileUtils.cd(tmp_path) do
        FileUtils.mv all_files_except_git, repo_path
      end
      submission.log("Moved files back to code directory: #{repo_path}", 'Debug')

      # Clean up temp location
      FileUtils.rmdir(tmp_path)
      submission.log("#{tmp_path} deleted", 'Debug')

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
      client = new_organisation_git_client
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

    # Delete remote repository for the given assignment
    # Returns true if repository was destroyed
    # Returns false otherwise
    def delete_remote_assignment_repo!(assignment)
      repo_name = owner_and_repo_name(assignment)
      client = new_organisation_git_client
      client.delete_repository(repo_name)
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

      client = new_user_git_client(submission)
      owner_repo = owner_and_repo_name(submission)

      begin
        # Check repo/branch existence in one call, using the information extracted
        # above.
        # Throws Octokit::NotFound exception if branch doesn't exist.
        branch = client.branch(owner_repo, submission.gitbranch.strip)

        # Branch exists.
        # Return true if sha exists anywhere in branch commit tree
        valid_sha?(branch[:commit], submission.commithash.strip)
      rescue Octokit::NotFound # Thrown when branch doesn't exist
        false
      end
    end

    private

    def valid_sha?(branch_commits, submission_sha)
      # Check if sha is most recent commit
      return true if branch_commits[:sha].start_with? submission_sha

      # Not most recent commit, so check all previous
      parent_commits = branch_commits[:parents]
      parent_commits.each do |commit|
        return true if commit[:sha].start_with? submission_sha
      end
      false
    end

    # Gets all files to move except for ., .. and .git
    def all_files_except_git
      Dir.glob('*', File::FNM_DOTMATCH).delete_if { |file| file =~ /\A\.{1,2}\z|\A\.git\z/ }
    end

    def new_organisation_git_client
      Octokit::Client.new(login: Rails.configuration.ghe_user, password: Rails.configuration.ghe_password)
    end

    def new_user_git_client(submission)
      # Handle separately GHE and github.com repositories by checking the repo URL
      if submission.repourl.include? 'github.com'
        Octokit::Client.new(api_endpoint: 'https://api.github.com/', login: submission.user.github_com_login, access_token: submission.user.github_com_token)
      else
        Octokit::Client.new(login: submission.user.ghe_login, access_token: submission.user.githubtoken)
      end
    end

    # Split on / and grab the last two entries (user and repo name)
    # Join the two with a slash and remove the .git extension
    #
    # By doing the URL manipulation, this eliminates the need for the
    # a seperate call to Octokit::Repository all together, which returns
    # a Repository object with owner and repo name instance fields, both of which
    # the below line extracts from the submission.repourl
    def owner_and_repo_name(assignment_or_submission)
      assignment_or_submission.repourl.split('/')[-2..-1].join('/')[0..-5]
    end
  end
end
