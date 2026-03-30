import { useEffect, useMemo, useState } from 'react'
import { fetchApi, postApi } from './api'

const navItems = [
  'Overview',
  'Browse Jobs',
  'Post Job',
  'Employer Dashboard',
  'User Dashboard',
  'Data Insights',
  'Code Studio'
]

const emptyJob = {
  title: '',
  company: '',
  location: 'Remote',
  type: 'Full-time',
  description: ''
}

const defaultOverview = [
  { label: 'Open Roles', value: '0', detail: '+0% this week' },
  { label: 'New Candidates', value: '0', detail: '+0% this week' },
  { label: 'Jobs Filled', value: '0', detail: '+0% this month' },
  { label: 'HR Tasks', value: '0', detail: '-0% from last week' }
]

const defaultInsights = [
  { metric: 'Conversion rate', value: '0%', change: '+0%' },
  { metric: 'Time to fill', value: '0 days', change: '-0 days' },
  { metric: 'Candidate quality', value: '0%', change: '+0%' },
  { metric: 'Candidate response', value: '0%', change: '+0%' }
]

const defaultCode = `// SprintWork data pipeline sample
const jobs = [
  { title: 'Full Stack Developer', team: 'Platform', stage: 'Open' },
  { title: 'Marketing Manager', team: 'Growth', stage: 'Interview' }
]

function assignCandidate(candidate, role) {
  return {
    ...candidate,
    assignedRole: role,
    assignedAt: new Date().toISOString()
  }
}

const activeAssignments = jobs.filter(job => job.stage !== 'Closed')
console.log(activeAssignments)
`

export default function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs, setJobs] = useState([])
  const [overviewStats, setOverviewStats] = useState(defaultOverview)
  const [applications, setApplications] = useState([])
  const [insights, setInsights] = useState(defaultInsights)
  const [code, setCode] = useState(defaultCode)
  const [formValues, setFormValues] = useState(emptyJob)
  const [jobCreated, setJobCreated] = useState(false)
  const [codeSaved, setCodeSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [authError, setAuthError] = useState('')

  const postedJobs = useMemo(() => jobs.slice(0, 6), [jobs])

  useEffect(() => {
    if (!user) return
    loadAppData()
  }, [user])

  useEffect(() => {
    if (!user) return
    if (activePage === 'Browse Jobs') {
      fetchJobs(searchQuery)
    }
  }, [activePage, searchQuery, user])

  async function loadAppData() {
    setLoading(true)
    try {
      await Promise.all([
        fetchOverview(),
        fetchJobs(searchQuery),
        fetchApplications(),
        fetchInsights(),
        fetchCodeSnippet()
      ])
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(credentials) {
    setLoading(true)
    setAuthError('')
    try {
      const userData = await postApi('/api/login', credentials)
      setUser(userData)
      setAuthError('')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOverview() {
    try {
      const data = await fetchApi('/api/overview')
      setOverviewStats(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function fetchJobs(search = '') {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : ''
      const data = await fetchApi(`/api/jobs${query}`)
      setJobs(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function fetchApplications() {
    if (!user) return
    try {
      const data = await fetchApi(`/api/applications?userEmail=${encodeURIComponent(user.email)}`)
      setApplications(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function fetchInsights() {
    try {
      const data = await fetchApi('/api/insights')
      setInsights(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function fetchCodeSnippet() {
    try {
      const data = await fetchApi('/api/code')
      setCode(data.code || defaultCode)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleCreateJob() {
    setLoading(true)
    setJobCreated(false)
    try {
      const newJob = await postApi('/api/jobs', formValues)
      setJobs(current => [newJob, ...current])
      setFormValues(emptyJob)
      setJobCreated(true)
      setActivePage('Employer Dashboard')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply(job) {
    if (!user) return
    setLoading(true)
    try {
      await postApi('/api/applications', {
        role: job.title,
        company: job.company,
        userEmail: user.email
      })
      await Promise.all([fetchApplications(), fetchJobs(searchQuery)])
      setMessage(`Applied to ${job.title} at ${job.company}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveCode() {
    setLoading(true)
    setCodeSaved(false)
    try {
      await postApi('/api/code', { code })
      setCodeSaved(true)
      setMessage('Code saved successfully.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} error={authError} loading={loading} />
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SprintWork</strong>
            <p>Platform</p>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(item => (
            <button
              key={item}
              className={item === activePage ? 'nav-item active' : 'nav-item'}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <small>Local full-stack rebuild.</small>
          <small>Backend API powered.</small>
        </div>
      </aside>

      <div className="content-view">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live platform preview</p>
            <h1>{activePage}</h1>
            <p>Welcome back, {user.name}. Use the left menu to switch sections.</p>
          </div>

          <div className="topbar-actions">
            <button className="secondary" onClick={() => setActivePage('Overview')}>
              Home
            </button>
            <button className="secondary" onClick={() => setUser(null)}>
              Sign out
            </button>
          </div>
        </header>

        <main className="main-panel">
          {loading && <div className="loading-banner">Loading…</div>}
          {message && <div className="notice">{message}</div>}
          {activePage === 'Overview' && <OverviewPage overviewStats={overviewStats} />}
          {activePage === 'Browse Jobs' && (
            <BrowseJobsPage
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              jobs={jobs}
              onApply={handleApply}
            />
          )}
          {activePage === 'Post Job' && (
            <PostJobPage
              formValues={formValues}
              onChange={setFormValues}
              onSubmit={handleCreateJob}
              created={jobCreated}
            />
          )}
          {activePage === 'Employer Dashboard' && <EmployerDashboardPage jobs={postedJobs} />}
          {activePage === 'User Dashboard' && <UserDashboardPage applications={applications} />}
          {activePage === 'Data Insights' && <DataInsightsPage insights={insights} />}
          {activePage === 'Code Studio' && (
            <CodeStudioPage code={code} onCodeChange={setCode} onSave={handleSaveCode} saved={codeSaved} />
          )}
        </main>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin, error, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>Sign in to SprintWork</h2>
        <p>Use the local platform login to unlock the dashboard.</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            placeholder="Enter a password"
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button
          className="primary"
          disabled={!email || !password || loading}
          onClick={() => onLogin({ email, password })}
        >
          {loading ? 'Signing in…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

function OverviewPage({ overviewStats }) {
  return (
    <section className="section-grid">
      <div className="panel intro-panel">
        <h2>Platform overview</h2>
        <p>
          This rebuilt SprintWork dashboard uses the same UI structure as the reference export and is backed by a local API.
        </p>
      </div>

      <div className="cards-grid">
        {overviewStats.map(stat => (
          <div key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>Quick actions</h3>
        <div className="action-list">
          <button className="primary">Create new job</button>
          <button className="secondary">View candidates</button>
          <button className="secondary">Export insights</button>
        </div>
      </div>
    </section>
  )
}

function BrowseJobsPage({ searchQuery, onSearch, jobs, onApply }) {
  return (
    <section>
      <div className="panel search-panel">
        <label>
          Search roles
          <input
            type="search"
            value={searchQuery}
            placeholder="Search by title, company, or location"
            onChange={e => onSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="grid-list">
        {jobs.length === 0 && (
          <div className="panel">
            <p>No jobs match your search yet.</p>
          </div>
        )}

        {jobs.map(job => (
          <article key={`${job.title}-${job.company}`} className="job-card">
            <div>
              <span className="job-type">{job.type}</span>
              <h3>{job.title}</h3>
              <p>{job.company} · {job.location}</p>
            </div>
            <div className="job-meta">
              <span>{job.applicants || 0} applicants</span>
              <span>{job.status}</span>
            </div>
            <button className="secondary" onClick={() => onApply(job)}>
              Apply now
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function PostJobPage({ formValues, onChange, onSubmit, created }) {
  return (
    <section className="section-grid">
      <div className="panel">
        <h2>Post a new position</h2>
        <p>Publish a role with details that match the original SprintWork employer flow.</p>
      </div>

      <div className="panel">
        <form
          className="form-grid"
          onSubmit={e => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <label>
            Role title
            <input
              value={formValues.title}
              onChange={e => onChange({ ...formValues, title: e.target.value })}
              placeholder="Senior Backend Engineer"
            />
          </label>

          <label>
            Company
            <input
              value={formValues.company}
              onChange={e => onChange({ ...formValues, company: e.target.value })}
              placeholder="Acme Solutions"
            />
          </label>

          <label>
            Location
            <input
              value={formValues.location}
              onChange={e => onChange({ ...formValues, location: e.target.value })}
              placeholder="Remote"
            />
          </label>

          <label>
            Employment type
            <select
              value={formValues.type}
              onChange={e => onChange({ ...formValues, type: e.target.value })}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </label>

          <label className="full-width">
            Description
            <textarea
              rows="5"
              value={formValues.description}
              onChange={e => onChange({ ...formValues, description: e.target.value })}
              placeholder="Write a short summary for the position."
            />
          </label>

          <button className="primary" type="submit">
            Publish role
          </button>
        </form>

        {created && <p className="notice">Job posted successfully. View it in Employer Dashboard.</p>}
      </div>
    </section>
  )
}

function EmployerDashboardPage({ jobs }) {
  return (
    <section className="section-grid">
      <div className="panel">
        <h2>Employer dashboard</h2>
        <p>Track live listings, pipeline stages, and activity across the hiring funnel.</p>
      </div>

      <div className="cards-grid">
        {jobs.length === 0 && (
          <div className="panel">
            <p>No active roles available.</p>
          </div>
        )}

        {jobs.map(job => (
          <div key={`${job.title}-${job.company}`} className="stat-card">
            <span>{job.title}</span>
            <strong>{job.pipeline || 'Reviewing'}</strong>
            <small>{job.posted || 'Just now'} · {job.views || 0} views · {job.applicants || 0} applicants</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function UserDashboardPage({ applications }) {
  return (
    <section className="section-grid">
      <div className="panel">
        <h2>User dashboard</h2>
        <p>Personal candidate status and recommended roles based on your activity.</p>
      </div>

      <div className="grid-list">
        {applications.length === 0 && (
          <article className="status-card">
            <p>No applications yet. Apply to a role from Browse Jobs.</p>
          </article>
        )}

        {applications.map(application => (
          <article key={application.id} className="status-card">
            <h3>{application.role}</h3>
            <p>{application.stage}</p>
            <small>{application.date}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function DataInsightsPage({ insights }) {
  return (
    <section className="section-grid">
      <div className="panel">
        <h2>Data insights</h2>
        <p>Metrics and performance delivered in a clean analytics layout.</p>
      </div>

      <div className="cards-grid">
        {insights.map(item => (
          <div key={item.metric} className="stat-card">
            <span>{item.metric}</span>
            <strong>{item.value}</strong>
            <small>{item.change} from last period</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function CodeStudioPage({ code, onCodeChange, onSave, saved }) {
  return (
    <section className="section-grid">
      <div className="panel">
        <h2>Code Studio</h2>
        <p>Use this section to store a code sample and keep it synced with the local backend.</p>
      </div>

      <div className="code-card">
        <textarea
          className="code-editor"
          value={code}
          onChange={e => onCodeChange(e.target.value)}
          rows="16"
        />
        <button className="primary" onClick={onSave}>
          Save code
        </button>
        {saved && <p className="notice">Code saved successfully.</p>}
      </div>
    </section>
  )
}
