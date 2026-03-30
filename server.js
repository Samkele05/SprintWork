const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 4000
const dataDir = path.join(__dirname, 'data')
const dbFile = path.join(dataDir, 'db.json')

const defaultStore = {
  users: [
    { id: 1, name: 'Alex Rivera', email: 'alex@sprintwork.com', role: 'manager' }
  ],
  jobs: [
    {
      id: 1,
      title: 'Full Stack Developer',
      company: 'Sprint Labs',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build the next generation of our hiring platform with React and Node.',
      applicants: 42,
      views: 120,
      status: 'Hiring',
      pipeline: 'Reviewing',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Growth Marketing Lead',
      company: 'Pulse Works',
      location: 'New York, NY',
      type: 'Contract',
      description: 'Drive growth through campaigns, analytics, and channel optimization.',
      applicants: 19,
      views: 76,
      status: 'Open',
      pipeline: 'Screening',
      posted: '6 days ago'
    },
    {
      id: 3,
      title: 'Product Designer',
      company: 'Nimbus Creative',
      location: 'Los Angeles, CA',
      type: 'Hybrid',
      description: 'Design customer journeys, interfaces, and product experiences.',
      applicants: 27,
      views: 88,
      status: 'Interviewing',
      pipeline: 'Offers sent',
      posted: '10 days ago'
    },
    {
      id: 4,
      title: 'Customer Success Manager',
      company: 'Atlas Talent',
      location: 'Remote',
      type: 'Full-time',
      description: 'Manage enterprise accounts and ensure customer retention.',
      applicants: 14,
      views: 41,
      status: 'Open',
      pipeline: 'Reviewing',
      posted: '1 day ago'
    }
  ],
  applications: [
    { id: 1, role: 'Frontend Engineer', company: 'Sprint Labs', stage: 'Applied', date: 'Today', userEmail: 'alex@sprintwork.com' },
    { id: 2, role: 'Senior Product Manager', company: 'Pulse Works', stage: 'Interview', date: 'Yesterday', userEmail: 'alex@sprintwork.com' },
    { id: 3, role: 'Data Analyst', company: 'Nimbus Creative', stage: 'Offer sent', date: '3 days ago', userEmail: 'alex@sprintwork.com' }
  ],
  codeSnippets: [
    {
      id: 1,
      title: 'SprintWork data pipeline sample',
      code: `// SprintWork data pipeline sample
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
    }
  ]
}

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(defaultStore, null, 2))
  }
}

function loadStore() {
  ensureStore()
  try {
    const raw = fs.readFileSync(dbFile, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    fs.writeFileSync(dbFile, JSON.stringify(defaultStore, null, 2))
    return { ...defaultStore }
  }
}

function saveStore(store) {
  fs.writeFileSync(dbFile, JSON.stringify(store, null, 2))
}

function makeName(email) {
  const username = email.split('@')[0]
  return username
    .split(/[-_.]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function computeOverview(store) {
  const openRoles = store.jobs.filter(job => job.status === 'Open' || job.pipeline === 'Reviewing' || job.pipeline === 'Screening').length
  const recentApplications = store.applications.filter(app => ['Today', 'Yesterday', '2 days ago', '3 days ago'].includes(app.date)).length
  const jobsFilled = store.applications.filter(app => app.stage === 'Offer sent' || app.stage === 'Hired').length
  const hrTasks = Math.max(3, store.jobs.filter(job => job.pipeline === 'Reviewing' || job.pipeline === 'Screening').length)

  return [
    { label: 'Open Roles', value: String(openRoles), detail: '+12% this week' },
    { label: 'New Candidates', value: String(recentApplications + 18), detail: '+8% this week' },
    { label: 'Jobs Filled', value: String(jobsFilled + 8), detail: '+22% this month' },
    { label: 'HR Tasks', value: String(hrTasks), detail: '-3% from last week' }
  ]
}

function computeInsights(store) {
  const totalApplications = Math.max(store.applications.length, 1)
  const conversionValue = Math.min(10, 4 + Math.floor(totalApplications * 0.6))
  const qualityValue = Math.min(92, 60 + totalApplications * 4)
  const responseValue = Math.min(88, 55 + totalApplications * 3)
  const timeValue = Math.max(14, 24 - Math.floor(totalApplications * 0.7))

  return [
    { metric: 'Conversion rate', value: `${conversionValue.toFixed(1)}%`, change: '+1.4%' },
    { metric: 'Time to fill', value: `${timeValue} days`, change: '-2 days' },
    { metric: 'Candidate quality', value: `${qualityValue}%`, change: '+5%' },
    { metric: 'Candidate response', value: `${responseValue}%`, change: '+9%' }
  ]
}

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const store = loadStore()
  let user = store.users.find(item => item.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    user = {
      id: Date.now(),
      name: makeName(email),
      email,
      role: 'candidate'
    }
    store.users.push(user)
    saveStore(store)
  }

  res.json(user)
})

app.get('/api/jobs', (req, res) => {
  const store = loadStore()
  const search = (req.query.search || '').toLowerCase().trim()
  let results = store.jobs
  if (search) {
    results = results.filter(job =>
      [job.title, job.company, job.location, job.type, job.description]
        .join(' ')
        .toLowerCase()
        .includes(search)
    )
  }
  res.json(results)
})

app.post('/api/jobs', (req, res) => {
  const { title, company, location, type, description } = req.body
  if (!title || !company || !description) {
    return res.status(400).json({ message: 'Title, company, and description are required.' })
  }

  const store = loadStore()
  const newJob = {
    id: Date.now(),
    title,
    company,
    location: location || 'Remote',
    type: type || 'Full-time',
    description,
    applicants: 0,
    views: 0,
    status: 'Open',
    pipeline: 'Reviewing',
    posted: 'Just now'
  }
  store.jobs.unshift(newJob)
  saveStore(store)
  res.json(newJob)
})

app.get('/api/applications', (req, res) => {
  const store = loadStore()
  const userEmail = (req.query.userEmail || '').toLowerCase()
  const applications = userEmail
    ? store.applications.filter(app => app.userEmail.toLowerCase() === userEmail)
    : store.applications
  res.json(applications)
})

app.post('/api/applications', (req, res) => {
  const { role, company, userEmail } = req.body
  if (!role || !company || !userEmail) {
    return res.status(400).json({ message: 'Role, company, and user email are required.' })
  }

  const store = loadStore()
  const application = {
    id: Date.now(),
    role,
    company,
    stage: 'Applied',
    date: 'Today',
    userEmail
  }
  store.applications.unshift(application)
  const job = store.jobs.find(jobItem => jobItem.title === role && jobItem.company === company)
  if (job) {
    job.applicants = (job.applicants || 0) + 1
  }
  saveStore(store)
  res.json(application)
})

app.get('/api/overview', (req, res) => {
  const store = loadStore()
  res.json(computeOverview(store))
})

app.get('/api/insights', (req, res) => {
  const store = loadStore()
  res.json(computeInsights(store))
})

app.get('/api/code', (req, res) => {
  const store = loadStore()
  const snippet = store.codeSnippets[0] || { code: '' }
  res.json({ code: snippet.code || '' })
})

app.post('/api/code', (req, res) => {
  const { code } = req.body
  if (typeof code !== 'string') {
    return res.status(400).json({ message: 'Code snippet is required.' })
  }
  const store = loadStore()
  if (!store.codeSnippets.length) {
    store.codeSnippets.push({ id: Date.now(), title: 'SprintWork data pipeline sample', code })
  } else {
    store.codeSnippets[0].code = code
  }
  saveStore(store)
  res.json({ code })
})

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`SprintWork backend listening at http://localhost:${PORT}`)
})
