import React from 'react';
import './EditProfileForm.css';

const EditProfileForm = ({ profile, onProfileChange, onProfileSubmit, saving }) => {
  return (
    <div className="profile-settings-card" id="profile-form-anchor">
      <h3>Personal Information Settings</h3>
      <form onSubmit={onProfileSubmit} className="profile-form-grid">
        <div className="form-group-row">
          <div>
            <label>Display Name</label>
            <input type="text" name="name" value={profile.name} onChange={onProfileChange} required />
          </div>
          <div>
            <label>Profession Title</label>
            <input type="text" name="profession" value={profile.profession} onChange={onProfileChange} placeholder="e.g. Frontend Engineer" />
          </div>
        </div>

        <div>
          <label>Bio Statement</label>
          <textarea rows="3" name="bio" value={profile.bio} onChange={onProfileChange} placeholder="A short description about your skills..." />
        </div>

        <div className="form-group-row">
          <div>
            <label>Education Type</label>
            <select name="educationType" value={profile.educationType} onChange={onProfileChange}>
              <option value="SCHOOL">School</option>
              <option value="COLLEGE">College</option>
              <option value="EMPLOYED">Employed</option>
              <option value="SELF_LEARNER">Self Learner</option>
            </select>
          </div>
          {profile.educationType === "SCHOOL" && (
            <div>
              <label>School Name</label>
              <input type="text" name="schoolName" value={profile.schoolName} onChange={onProfileChange} />
            </div>
          )}
          {profile.educationType === "COLLEGE" && (
            <div>
              <label>College Name</label>
              <input type="text" name="college" value={profile.college} onChange={onProfileChange} />
            </div>
          )}
          {profile.educationType === "EMPLOYED" && (
            <div>
              <label>Company Name</label>
              <input type="text" name="company" value={profile.company} onChange={onProfileChange} />
            </div>
          )}
        </div>

        <div className="form-group-row">
          <div>
            <label>Department / Stream</label>
            <input type="text" name="department" value={profile.department} onChange={onProfileChange} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label>Academic Year / Std</label>
            <input type="number" name="academicYear" value={profile.academicYear} onChange={onProfileChange} />
          </div>
        </div>

        <div className="form-group-row">
          <div>
            <label>GitHub Profile Url</label>
            <input type="url" name="githubUrl" value={profile.githubUrl} onChange={onProfileChange} placeholder="https://github.com/..." />
          </div>
          <div>
            <label>LinkedIn Profile Url</label>
            <input type="url" name="linkedinUrl" value={profile.linkedinUrl} onChange={onProfileChange} placeholder="https://linkedin.com/in/..." />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving profile..." : "Save Profile Details"}
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;
