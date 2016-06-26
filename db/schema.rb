# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160626230852) do

  create_table "access_tokens", force: :cascade do |t|
    t.string   "access_token", null: false
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.text     "description"
  end

  create_table "assignments", force: :cascade do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "start"
    t.datetime "deadline"
    t.boolean  "allow_late"
    t.integer  "course_id"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.integer  "late_cap"
    t.boolean  "allow_zip"
    t.boolean  "allow_git"
    t.boolean  "allow_ide"
    t.string   "repourl"
    t.integer  "max_attempts"
  end

  add_index "assignments", ["course_id"], name: "index_assignments_on_course_id"

  create_table "audit_items", force: :cascade do |t|
    t.text     "body"
    t.string   "level"
    t.integer  "access_token_id"
    t.integer  "assignment_id"
    t.integer  "course_id"
    t.integer  "marking_tool_id"
    t.integer  "submission_id"
    t.integer  "user_id"
    t.datetime "timestamp",       limit: 3
  end

  add_index "audit_items", ["access_token_id"], name: "index_audit_items_on_access_token_id"
  add_index "audit_items", ["assignment_id"], name: "index_audit_items_on_assignment_id"
  add_index "audit_items", ["course_id"], name: "index_audit_items_on_course_id"
  add_index "audit_items", ["marking_tool_id"], name: "index_audit_items_on_marking_tool_id"
  add_index "audit_items", ["submission_id"], name: "index_audit_items_on_submission_id"
  add_index "audit_items", ["user_id"], name: "index_audit_items_on_user_id"

  create_table "courses", force: :cascade do |t|
    t.string   "title",       null: false
    t.text     "description"
    t.integer  "teacher_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "courses_users", id: false, force: :cascade do |t|
    t.integer "course_id"
    t.integer "user_id"
  end

  add_index "courses_users", ["course_id"], name: "index_courses_users_on_course_id"
  add_index "courses_users", ["user_id"], name: "index_courses_users_on_user_id"

  create_table "feedback_items", force: :cascade do |t|
    t.text     "body"
    t.integer  "submission_id"
    t.integer  "marking_tool_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_index "feedback_items", ["submission_id"], name: "index_feedback_items_on_submission_id"

  create_table "intermediate_marks", force: :cascade do |t|
    t.integer  "mark"
    t.integer  "marking_tool_id"
    t.integer  "submission_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_index "intermediate_marks", ["marking_tool_id"], name: "index_intermediate_marks_on_marking_tool_id"
  add_index "intermediate_marks", ["submission_id"], name: "index_intermediate_marks_on_submission_id"

  create_table "marking_tool_contexts", force: :cascade do |t|
    t.integer  "assignment_id"
    t.integer  "marking_tool_id"
    t.text     "context"
    t.integer  "weight"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.boolean  "configured",      default: false
  end

  add_index "marking_tool_contexts", ["assignment_id"], name: "index_marking_tool_contexts_on_assignment_id"
  add_index "marking_tool_contexts", ["marking_tool_id"], name: "index_marking_tool_contexts_on_marking_tool_id"

  create_table "marking_tools", force: :cascade do |t|
    t.text     "name"
    t.text     "description"
    t.text     "url"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.string   "uid"
    t.boolean  "requires_config", default: false
    t.text     "config_url"
  end

  add_index "marking_tools", ["uid"], name: "index_marking_tools_on_uid", unique: true

  create_table "students_courses", id: false, force: :cascade do |t|
    t.integer "user_id"
    t.integer "course_id"
  end

  add_index "students_courses", ["course_id"], name: "index_students_courses_on_course_id"
  add_index "students_courses", ["user_id"], name: "index_students_courses_on_user_id"

  create_table "submissions", force: :cascade do |t|
    t.integer  "assignment_id"
    t.integer  "user_id"
    t.datetime "submitted"
    t.boolean  "late"
    t.integer  "mark"
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.string   "original_filename"
    t.integer  "attempt_number"
    t.string   "saved_filename"
    t.text     "log"
    t.boolean  "extraction_error",  default: false
    t.text     "repourl"
    t.text     "commithash"
    t.string   "gitbranch"
    t.boolean  "studentrepo"
  end

  add_index "submissions", ["assignment_id"], name: "index_submissions_on_assignment_id"
  add_index "submissions", ["user_id"], name: "index_submissions_on_user_id"

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "",    null: false
    t.string   "encrypted_password",     default: "",    null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,     null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.string   "provider"
    t.string   "uid"
    t.text     "name"
    t.boolean  "admin",                  default: false
    t.text     "githubtoken"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true

end
