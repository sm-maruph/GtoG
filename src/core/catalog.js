/** Central catalogue for every portal module. */
import {
  Car, Boxes, Gauge, GraduationCap, Lightbulb, ClipboardList,
  FileStack, ShieldCheck, ContactRound, CalendarClock,
  Megaphone,
} from 'lucide-react';

export const MODULE_CATALOG = [
  {
    code: 'ann', name: 'Announcement Management',
    blurb: 'Create, prioritize, schedule, and publish portal-wide operational announcements.',
    category: 'Operations', icon: Megaphone, routePath: '/announcements', adminOnly: true,
    welcome: 'Welcome to Announcement Management. Publish clear, prioritized portal notices for all users.',
  },
  {
    code: 'emp', name: 'Employee Directory',
    blurb: 'Find employee IDs, contact information, organisation placement, and reporting lines.',
    category: 'People & Learning', icon: ContactRound, routePath: '/employee-directory',
    welcome: 'Welcome to the Employee Directory. Search colleagues by name, ID, branch, department, designation, or contact details.',
  },
  {
    code: 'exb', name: 'IT EximBill Roster Duty',
    blurb: 'Plan daily EximBill processing duty, replacements, departures, and monthly reports.',
    category: 'Operations', icon: CalendarClock, routePath: '/eximbill-roster',
    welcome: 'Welcome to the IT EximBill Process Roster. Review daily assignments, complete duty, and track departure records.',
  },
  {
    code: 'ins', name: 'Insurance Management Tracker',
    blurb: 'Manage borrower insurance policies, maturity risk, renewals, follow-ups, and exposure.',
    category: 'Operations', icon: ClipboardList, routePath: '/insurance',
    welcome: 'Welcome to the Insurance Management Tracker. Review portfolio risk, policy maturity, follow-ups, and unit-level exposure from one controlled workspace.',
  },
  {
    code: 'vbs', name: 'Vehicle Booking System',
    blurb: 'Request official vehicles, approve trips, assign fleet resources, and monitor schedules.',
    category: 'Operations', icon: Car, routePath: '/vehicle-booking',
    welcome: 'Welcome to the Vehicle Booking System. Submit official trips, complete approvals, and manage vehicles and drivers from the same workflow.',
  },
  {
    code: 'utl', name: 'Utility Tracker',
    blurb: 'Monitor generator, electricity, WASA, and drinking-water usage branch by branch.',
    category: 'Operations', icon: Gauge, routePath: '/utility',
    welcome: 'Welcome to the Utility Tracker. Record and analyse utility consumption and costs across branches and departments.',
  },
  {
    code: 'inv', name: 'Stationery Inventory Management',
    blurb: 'Control stationery requisitions, FIFO stock, dispatch, receipts, and branch consumption.',
    category: 'Operations', icon: Boxes, routePath: '/inventory',
    welcome: 'Welcome to Stationery Inventory Management. Create monthly requisitions, complete approvals, dispatch stock, and track consumption.',
  },
  {
    code: 'ppr', name: 'Paper Usage Tracker',
    blurb: 'Record printer page counts, paper balances, monthly requisitions, and usage reports.',
    category: 'Operations', icon: FileStack, routePath: '/paper-tracker',
    welcome: 'Welcome to the Paper Usage Tracker. Record printer counters and paper usage by branch, department, paper type, and month.',
  },
  {
    code: 'eka', name: 'Employee Knowledge Assessment',
    blurb: 'Take competency assessments across banking modules and review scores.',
    category: 'People & Learning', icon: GraduationCap, routePath: '/assessment',
    welcome: 'Welcome to Employee Knowledge Assessment.',
  },
  {
    code: 'iih', name: 'Innovative Idea Hub',
    blurb: 'Submit ideas and follow them from review through to rollout.',
    category: 'People & Learning', icon: Lightbulb, routePath: '/idea-hub',
    welcome: 'Welcome to the Innovative Idea Hub.',
  },
  {
    code: 'adm', name: 'Super Admin Portal',
    blurb: 'Manage branches, departments, users, roles, granular permissions, and global audit logs.',
    category: 'Administration', icon: ShieldCheck, routePath: '/super-admin', adminOnly: true,
    welcome: 'Welcome to the Super Admin Portal. Changes made here affect organisation structure, user access, and every connected module.',
  },
];

export const CATEGORY_ORDER = ['Operations', 'People & Learning', 'Risk & Compliance', 'Administration'];
export const getCatalogEntry = (code) => MODULE_CATALOG.find((m) => m.code === code) ?? null;
export const getCatalogByPath = (path) => MODULE_CATALOG.find((m) => path.startsWith(m.routePath)) ?? null;
export function groupByCategory(items = MODULE_CATALOG) {
  return CATEGORY_ORDER.map((category) => ({ category, items: items.filter((m) => m.category === category) })).filter((section) => section.items.length);
}
