
import { useEffect, useState } from "react";
import {
  Users,
  BriefcaseBusiness,
  GraduationCap,
  Search,
  MapPin,
  Building2,
  Mail,
  ArrowLeft,
  UserRound,
  X,
  LoaderCircle,
  Handshake
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [alumni, setAlumni] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Directory");
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showMentorshipForm, setShowMentorshipForm] = useState(false);
  const [mentorshipMessage, setMentorshipMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setNotice("");

      try {
        const [alumniResponse, jobsResponse] = await Promise.all([
          fetch(`${API}/alumni`),
          fetch(`${API}/jobs`)
        ]);

        if (!alumniResponse.ok) {
          const details = await alumniResponse.text();
          throw new Error(
            `Alumni API failed (${alumniResponse.status}): ${details}`
          );
        }

        if (!jobsResponse.ok) {
          const details = await jobsResponse.text();
          throw new Error(
            `Jobs API failed (${jobsResponse.status}): ${details}`
          );
        }

        const alumniData = await alumniResponse.json();
        const jobsData = await jobsResponse.json();

        if (!Array.isArray(alumniData)) {
          throw new Error("Alumni API did not return an array.");
        }

        if (!Array.isArray(jobsData)) {
          throw new Error("Jobs API did not return an array.");
        }

        if (!cancelled) {
          setAlumni(alumniData);
          setJobs(jobsData);
        }
      } catch (error) {
        console.error("loadData failed:", error);

        if (!cancelled) {
          setNotice(
            `Could not load data: ${error.message}. Check the backend terminal and browser console.`
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAlumni = alumni.filter((person) => {
    const term = search.trim().toLowerCase();

    return [
      person.name,
      person.email,
      person.company,
      person.job_title,
      person.department,
      person.location
    ].some((value) =>
      String(value || "").toLowerCase().includes(term)
    );
  });

  function openAlumniDetails(person) {
    console.log("Clicked alumni:", person);
    setSelectedAlumni(person);
    setShowMentorshipForm(false);
    setMentorshipMessage("");
    setNotice("");
  }

  function goToPage(page) {
    setActivePage(page);
    setSelectedAlumni(null);
    setSearch("");
    setNotice("");
  }

  async function requestMentorship(event) {
    event.preventDefault();

    if (!selectedAlumni?.id) {
      setNotice("This alumni record has no ID. Check the alumni table.");
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      const response = await fetch(`${API}/mentorship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          alumni_id: selectedAlumni.id,
          message: mentorshipMessage
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `Request failed (${response.status})`
        );
      }

      setNotice("Mentorship request submitted successfully.");
      setShowMentorshipForm(false);
      setMentorshipMessage("");
    } catch (error) {
      console.error("Mentorship request failed:", error);
      setNotice(`Mentorship request failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={27} />
          </div>

          <div>
            <h2>AlumniConnect</h2>
            <span>CAREER NETWORK</span>
          </div>
        </div>

        <p className="menu-label">MENU</p>

        <button
          type="button"
          className={`nav-item ${
            activePage === "Directory" && !selectedAlumni ? "active" : ""
          }`}
          onClick={() => goToPage("Directory")}
        >
          <Users size={19} />
          Alumni Directory
        </button>

        <button
          type="button"
          className={`nav-item ${
            activePage === "Jobs" ? "active" : ""
          }`}
          onClick={() => goToPage("Jobs")}
        >
          <BriefcaseBusiness size={19} />
          Job Opportunities
        </button>

        <div className="sidebar-bottom">
          <div className="network-card">
            <Handshake size={23} />
            <h3>Grow together</h3>
            <p>
              Connect with alumni and explore new career opportunities.
            </p>
          </div>

          <p className="sidebar-footer">AlumniConnect © 2026</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PROFESSIONAL COMMUNITY</p>

            <h1>
              {selectedAlumni
                ? "Alumni Profile"
                : activePage === "Directory"
                ? "Alumni Directory"
                : "Job Opportunities"}
            </h1>
          </div>

          <div className="topbar-icon">
            <Users size={22} />
          </div>
        </header>

        {notice && (
          <div className="notice" role="alert">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <LoaderCircle className="spinner" size={28} />
            <p>Loading AlumniConnect...</p>
          </div>
        ) : selectedAlumni ? (
          <section className="profile-section">
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setSelectedAlumni(null);
                setShowMentorshipForm(false);
                setNotice("");
              }}
            >
              <ArrowLeft size={18} />
              Back to Directory
            </button>

            <div className="profile-card">
              <div className="profile-banner" />

              <div className="profile-main">
                <div className="profile-avatar">
                  <UserRound size={43} />
                </div>

                <div className="profile-heading">
                  <h2>{selectedAlumni.name || "Alumni"}</h2>

                  <p>
                    {selectedAlumni.job_title || "Professional"}
                  </p>

                  {selectedAlumni.company && (
                    <p className="profile-company">
                      <Building2 size={16} />
                      {selectedAlumni.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="profile-divider" />

              <h3 className="details-title">
                Personal and Career Details
              </h3>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-icon">
                    <Mail size={19} />
                  </span>
                  <div>
                    <label>Email Address</label>
                    <p>{selectedAlumni.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    <GraduationCap size={19} />
                  </span>
                  <div>
                    <label>Graduation Year</label>
                    <p>
                      {selectedAlumni.graduation_year || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    <Users size={19} />
                  </span>
                  <div>
                    <label>Department</label>
                    <p>{selectedAlumni.department || "Not provided"}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    <Building2 size={19} />
                  </span>
                  <div>
                    <label>Company</label>
                    <p>{selectedAlumni.company || "Not provided"}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    <BriefcaseBusiness size={19} />
                  </span>
                  <div>
                    <label>Job Title</label>
                    <p>{selectedAlumni.job_title || "Not provided"}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    <MapPin size={19} />
                  </span>
                  <div>
                    <label>Location</label>
                    <p>{selectedAlumni.location || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    setShowMentorshipForm((previous) => !previous)
                  }
                >
                  <Handshake size={18} />
                  Request Mentorship
                </button>
              </div>

              {showMentorshipForm && (
                <form
                  className="mentorship-form"
                  onSubmit={requestMentorship}
                >
                  <label htmlFor="mentorship-message">
                    Why would you like mentorship?
                  </label>

                  <textarea
                    id="mentorship-message"
                    value={mentorshipMessage}
                    onChange={(event) =>
                      setMentorshipMessage(event.target.value)
                    }
                    placeholder="Write your message..."
                    required
                  />

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              )}
            </div>
          </section>
        ) : activePage === "Directory" ? (
          <section className="directory-section">
            <div className="welcome-section">
              <div>
                <h2>Discover your alumni network</h2>
                <p>
                  Find graduates, learn about their careers, and build
                  connections.
                </p>
              </div>

              <div className="welcome-icon">
                <GraduationCap size={42} />
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple">
                  <Users size={22} />
                </div>
                <div>
                  <p>Total Alumni</p>
                  <h2>{alumni.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  <Building2 size={22} />
                </div>
                <div>
                  <p>Companies</p>
                  <h2>
                    {
                      new Set(
                        alumni
                          .map((person) => person.company)
                          .filter(Boolean)
                      ).size
                    }
                  </h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <BriefcaseBusiness size={22} />
                </div>
                <div>
                  <p>Open Jobs</p>
                  <h2>{jobs.length}</h2>
                </div>
              </div>
            </div>

            <div className="section-heading">
              <div>
                <h2>Meet Our Alumni</h2>
                <p>Click a profile to see more details.</p>
              </div>

              <div className="search-box">
                <Search size={19} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search alumni..."
                />
              </div>
            </div>

            {filteredAlumni.length === 0 ? (
              <div className="empty-state">
                <Users size={38} />
                <h3>No alumni found</h3>
                <p>
                  Try another search term or add alumni records to your
                  database.
                </p>
              </div>
            ) : (
              <div className="alumni-grid">
                {filteredAlumni.map((person, index) => (
                  <button
                    type="button"
                    className="alumni-card"
                    key={
                      person.id ??
                      person.email ??
                      `${person.name}-${index}`
                    }
                    onClick={() => openAlumniDetails(person)}
                  >
                    <div className="card-top">
                      <div className="person-avatar">
                        <UserRound size={29} />
                      </div>

                      <span className="view-profile">
                        View Profile →
                      </span>
                    </div>

                    <h3>{person.name || "Alumni"}</h3>

                    <p className="person-role">
                      {person.job_title || "Role not provided"}
                    </p>

                    <div className="card-info">
                      <span>
                        <Building2 size={16} />
                        {person.company || "Company not provided"}
                      </span>

                      <span>
                        <MapPin size={16} />
                        {person.location || "Location not provided"}
                      </span>

                      <span>
                        <GraduationCap size={16} />
                        Class of {person.graduation_year || "N/A"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="jobs-section">
            <div className="welcome-section">
              <div>
                <h2>Explore career opportunities</h2>
                <p>
                  Discover openings shared with your alumni community.
                </p>
              </div>

              <div className="welcome-icon">
                <BriefcaseBusiness size={42} />
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-state">
                <BriefcaseBusiness size={38} />
                <h3>No jobs available yet</h3>
                <p>
                  New job opportunities will appear here when added to
                  the database.
                </p>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job, index) => (
                  <article
                    className="job-card"
                    key={job.id ?? index}
                  >
                    <div className="job-icon">
                      <BriefcaseBusiness size={24} />
                    </div>

                    <h3>
                      {job.title || job.job_title || "Job Opportunity"}
                    </h3>

                    <p className="job-company">
                      {job.company || "Company not provided"}
                    </p>

                    <p className="job-location">
                      <MapPin size={16} />
                      {job.location || "Location not provided"}
                    </p>

                    <p className="job-description">
                      {job.description || "No description provided."}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
