export const overviewStats = [
  { label: 'Open Roles', value: '18', detail: '+12% this week' },
  { label: 'New Candidates', value: '246', detail: '+8% this week' },
  { label: 'Jobs Filled', value: '13', detail: '+22% this month' },
  { label: 'HR Tasks', value: '8', detail: '-3% from last week' }
]

export const jobs = [
  {
    title: 'Full Stack Developer',
    company: 'Sprint Labs',
    location: 'Remote',
    type: 'Full-time',
    applicants: 42,
    status: 'Hiring'
  },
  {
    title: 'Growth Marketing Lead',
    company: 'Pulse Works',
    location: 'New York, NY',
    type: 'Contract',
    applicants: 19,
    status: 'Open'
  },
  {
    title: 'Product Designer',
    company: 'Nimbus Creative',
    location: 'Los Angeles, CA',
    type: 'Hybrid',
    applicants: 27,
    status: 'Interviewing'
  },
  {
    title: 'Customer Success Manager',
    company: 'Atlas Talent',
    location: 'Remote',
    type: 'Full-time',
    applicants: 14,
    status: 'Open'
  }
]

export const postedJobs = [
  {
    title: 'Senior Backend Engineer',
    pipeline: 'Reviewing',
    posted: '2 days ago',
    views: 328,
    applicants: 58
  },
  {
    title: 'UI/UX Product Designer',
    pipeline: 'Screening',
    posted: '6 days ago',
    views: 219,
    applicants: 33
  },
  {
    title: 'Talent Acquisition Partner',
    pipeline: 'Offers sent',
    posted: '10 days ago',
    views: 184,
    applicants: 21
  }
]

export const applications = [
  { role: 'Frontend Engineer', stage: 'Applied', date: 'Today' },
  { role: 'Senior Product Manager', stage: 'Interview', date: 'Yesterday' },
  { role: 'Data Analyst', stage: 'Offer sent', date: '3 days ago' }
]

export const insights = [
  { metric: 'Conversion rate', value: '6.2%', change: '+1.4%' },
  { metric: 'Time to fill', value: '19 days', change: '-2 days' },
  { metric: 'Candidate quality', value: '83%', change: '+5%' },
  { metric: 'Candidate response', value: '72%', change: '+9%' }
]

export const codeSnippet = `// SprintWork data pipeline sample
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
