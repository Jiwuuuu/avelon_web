import { useState, useMemo } from "react"
import adminProfile from "../../assets/will.png"

// Types
type UserStatus = "verified" | "unverified" | "suspended" | "pending"
type UserRole = "borrower" | "lender"

interface User {
  id: number
  firstName: string
  middleInitial: string
  lastName: string
  email: string
  phone: string
  secondaryEmail?: string
  role: UserRole
  riskScore: number | null
  status: UserStatus
  birthDate: string
  education: string
  region: string
  province: string
  cityTown: string
  barangay: string
  businessName?: string
  brn?: string
  businessType?: string
  industry?: string
  documents: {
    name: string
    url: string
  }[]
  creditScore: number
  requestedDate?: string
}

// Mock Data
const mockUsers: User[] = [
  {
    id: 1,
    firstName: "Will Anthony",
    middleInitial: "B",
    lastName: "Barillo",
    email: "WillPop@gmail.com",
    phone: "+63 929 595 6436",
    secondaryEmail: "willanthony.backup@gmail.com",
    role: "borrower",
    riskScore: 92.5,
    status: "verified",
    birthDate: "03/15/1995",
    education: "Bachelor of Science in Computer Science",
    region: "1 / Ilocos Region",
    province: "Pangasinan",
    cityTown: "Mangaldan",
    barangay: "Ewan",
    businessName: "Tech Solutions Inc",
    brn: "123456789",
    businessType: "Sole Proprietorship",
    industry: "Information Technology",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
      { name: "Business Permit.pdf", url: "#" },
    ],
    creditScore: 750,
  },
  {
    id: 2,
    firstName: "Cecilia",
    middleInitial: "M",
    lastName: "Francisco",
    email: "FranciscoCecilia@gmail.com",
    phone: "+63 917 123 4567",
    secondaryEmail: "cecilia.work@gmail.com",
    role: "lender",
    riskScore: null,
    status: "verified",
    birthDate: "07/22/1988",
    education: "Master of Business Administration",
    region: "NCR / National Capital Region",
    province: "Metro Manila",
    cityTown: "Makati City",
    barangay: "Poblacion",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
    ],
    creditScore: 820,
  },
  {
    id: 3,
    firstName: "Aaron",
    middleInitial: "L",
    lastName: "Smith",
    email: "AaronSmith@gmail.com",
    phone: "+63 918 987 6543",
    role: "borrower",
    riskScore: 75.2,
    status: "unverified",
    birthDate: "11/30/1992",
    education: "Bachelor of Arts in Business Management",
    region: "3 / Central Luzon",
    province: "Pampanga",
    cityTown: "Angeles City",
    barangay: "Balibago",
    businessName: "Smith Trading",
    brn: "987654321",
    businessType: "Partnership",
    industry: "Retail Trade",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
    ],
    creditScore: 680,
  },
  {
    id: 4,
    firstName: "Karlos",
    middleInitial: "S",
    lastName: "Rivo",
    email: "karlossonrivo@gmail.com",
    phone: "+63 929 595 6436",
    secondaryEmail: "manukannikarlos@gmail.com",
    role: "borrower",
    riskScore: 68.5,
    status: "pending",
    birthDate: "01/01/2000",
    education: "Information Technology",
    region: "1 / Ilocos Region",
    province: "Pangasinan",
    cityTown: "Mangaldan",
    barangay: "Ewan",
    businessName: "Manukan Ni Karlos",
    brn: "123456789",
    businessType: "Sole Proprietorship",
    industry: "Food and Beverage Industry",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
      { name: "Business Permit.pdf", url: "#" },
    ],
    creditScore: 100,
    requestedDate: "01-21-2025",
  },
  {
    id: 5,
    firstName: "Maria",
    middleInitial: "G",
    lastName: "Santos",
    email: "maria.santos@gmail.com",
    phone: "+63 927 111 2222",
    role: "borrower",
    riskScore: 45.0,
    status: "suspended",
    birthDate: "05/14/1990",
    education: "Bachelor of Science in Accountancy",
    region: "4A / CALABARZON",
    province: "Laguna",
    cityTown: "San Pablo City",
    barangay: "San Rafael",
    businessName: "Santos Accounting Services",
    brn: "456789123",
    businessType: "Sole Proprietorship",
    industry: "Professional Services",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
    ],
    creditScore: 450,
  },
  {
    id: 6,
    firstName: "Juan",
    middleInitial: "P",
    lastName: "Dela Cruz",
    email: "juan.delacruz@gmail.com",
    phone: "+63 915 333 4444",
    role: "lender",
    riskScore: null,
    status: "verified",
    birthDate: "09/08/1985",
    education: "Doctor of Medicine",
    region: "7 / Central Visayas",
    province: "Cebu",
    cityTown: "Cebu City",
    barangay: "Lahug",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
      { name: "Medical License.pdf", url: "#" },
    ],
    creditScore: 890,
  },
  {
    id: 7,
    firstName: "Ana",
    middleInitial: "R",
    lastName: "Reyes",
    email: "ana.reyes@gmail.com",
    phone: "+63 916 555 6666",
    role: "borrower",
    riskScore: 82.3,
    status: "pending",
    birthDate: "02/28/1993",
    education: "Bachelor of Science in Nursing",
    region: "11 / Davao Region",
    province: "Davao del Sur",
    cityTown: "Davao City",
    barangay: "Poblacion",
    businessName: "Reyes Healthcare Services",
    brn: "789123456",
    businessType: "Sole Proprietorship",
    industry: "Healthcare",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
    ],
    creditScore: 720,
    requestedDate: "01-18-2025",
  },
  {
    id: 8,
    firstName: "Pedro",
    middleInitial: "A",
    lastName: "Garcia",
    email: "pedro.garcia@gmail.com",
    phone: "+63 919 777 8888",
    role: "borrower",
    riskScore: 55.8,
    status: "unverified",
    birthDate: "12/12/1991",
    education: "Bachelor of Science in Civil Engineering",
    region: "6 / Western Visayas",
    province: "Iloilo",
    cityTown: "Iloilo City",
    barangay: "Jaro",
    businessName: "Garcia Construction",
    brn: "321654987",
    businessType: "Corporation",
    industry: "Construction",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
    ],
    creditScore: 580,
  },
  {
    id: 9,
    firstName: "Isabella",
    middleInitial: "C",
    lastName: "Lopez",
    email: "isabella.lopez@gmail.com",
    phone: "+63 920 999 0000",
    role: "lender",
    riskScore: null,
    status: "verified",
    birthDate: "04/05/1987",
    education: "Master of Science in Finance",
    region: "NCR / National Capital Region",
    province: "Metro Manila",
    cityTown: "Taguig City",
    barangay: "BGC",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
    ],
    creditScore: 910,
  },
  {
    id: 10,
    firstName: "Miguel",
    middleInitial: "T",
    lastName: "Torres",
    email: "miguel.torres@gmail.com",
    phone: "+63 921 111 3333",
    role: "borrower",
    riskScore: 78.9,
    status: "pending",
    birthDate: "08/20/1994",
    education: "Bachelor of Science in Information Technology",
    region: "10 / Northern Mindanao",
    province: "Misamis Oriental",
    cityTown: "Cagayan de Oro",
    barangay: "Carmen",
    businessName: "Torres Tech Hub",
    brn: "654987321",
    businessType: "Sole Proprietorship",
    industry: "Information Technology",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
      { name: "Business Permit.pdf", url: "#" },
    ],
    creditScore: 690,
    requestedDate: "01-20-2025",
  },
  {
    id: 11,
    firstName: "Sofia",
    middleInitial: "N",
    lastName: "Navarro",
    email: "sofia.navarro@gmail.com",
    phone: "+63 922 444 5555",
    role: "borrower",
    riskScore: 88.1,
    status: "verified",
    birthDate: "06/18/1996",
    education: "Bachelor of Arts in Communication",
    region: "2 / Cagayan Valley",
    province: "Isabela",
    cityTown: "Cauayan City",
    barangay: "District 1",
    businessName: "Navarro Media Productions",
    brn: "147258369",
    businessType: "Sole Proprietorship",
    industry: "Media and Entertainment",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
    ],
    creditScore: 780,
  },
  {
    id: 12,
    firstName: "Carlos",
    middleInitial: "E",
    lastName: "Espinoza",
    email: "carlos.espinoza@gmail.com",
    phone: "+63 923 666 7777",
    role: "borrower",
    riskScore: 62.4,
    status: "unverified",
    birthDate: "10/25/1989",
    education: "Bachelor of Science in Agriculture",
    region: "5 / Bicol Region",
    province: "Albay",
    cityTown: "Legazpi City",
    barangay: "Daraga",
    businessName: "Espinoza Farms",
    brn: "369147258",
    businessType: "Partnership",
    industry: "Agriculture",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
    ],
    creditScore: 620,
  },
  {
    id: 13,
    firstName: "Gabriella",
    middleInitial: "M",
    lastName: "Mendoza",
    email: "gabriella.mendoza@gmail.com",
    phone: "+63 924 888 9999",
    role: "lender",
    riskScore: null,
    status: "suspended",
    birthDate: "01/30/1984",
    education: "Bachelor of Laws",
    region: "NCR / National Capital Region",
    province: "Metro Manila",
    cityTown: "Quezon City",
    barangay: "Diliman",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
    ],
    creditScore: 300,
  },
  {
    id: 14,
    firstName: "Rafael",
    middleInitial: "J",
    lastName: "Jimenez",
    email: "rafael.jimenez@gmail.com",
    phone: "+63 925 000 1111",
    role: "borrower",
    riskScore: 71.6,
    status: "pending",
    birthDate: "07/07/1997",
    education: "Bachelor of Science in Mechanical Engineering",
    region: "8 / Eastern Visayas",
    province: "Leyte",
    cityTown: "Tacloban City",
    barangay: "San Jose",
    businessName: "Jimenez Auto Repair",
    brn: "258369147",
    businessType: "Sole Proprietorship",
    industry: "Automotive",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
    ],
    creditScore: 650,
    requestedDate: "01-19-2025",
  },
  {
    id: 15,
    firstName: "Elena",
    middleInitial: "V",
    lastName: "Villanueva",
    email: "elena.villanueva@gmail.com",
    phone: "+63 926 222 3333",
    role: "borrower",
    riskScore: 95.2,
    status: "verified",
    birthDate: "03/03/1992",
    education: "Master of Business Administration",
    region: "9 / Zamboanga Peninsula",
    province: "Zamboanga del Sur",
    cityTown: "Zamboanga City",
    barangay: "Sta. Maria",
    businessName: "Villanueva Trading Co.",
    brn: "951753864",
    businessType: "Corporation",
    industry: "Import/Export",
    documents: [
      { name: "Valid ID Front.jpg", url: "#" },
      { name: "Valid ID Back.jpg", url: "#" },
      { name: "E-Signature.jpg", url: "#" },
      { name: "Business Permit.pdf", url: "#" },
      { name: "SEC Registration.pdf", url: "#" },
    ],
    creditScore: 860,
  },
]

// Icon Components
const UserIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
)

const GraduationIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
  </svg>
)

const BusinessTypeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
)

const IndustryIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const ChevronLeft = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const ChevronRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
)

// Status Badge Component
const StatusBadge = ({ status }: { status: UserStatus }) => {
  const styles: Record<UserStatus, string> = {
    verified: "bg-green-100 text-green-800",
    unverified: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
    pending: "bg-blue-100 text-blue-800",
  }

  const labels: Record<UserStatus, string> = {
    verified: "VERIFIED",
    unverified: "UNVERIFIED",
    suspended: "SUSPENDED",
    pending: "PENDING",
  }

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

// Role Badge Component
const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles: Record<UserRole, string> = {
    borrower: "bg-blue-100 text-blue-800",
    lender: "bg-purple-100 text-purple-800",
  }

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[role]}`}>
      {role.toUpperCase()}
    </span>
  )
}

// User Avatar Component
const UserAvatar = ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ]
  const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length

  return (
    <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold`}>
      {firstName.charAt(0)}
    </div>
  )
}

// User Details Modal Component
const UserDetailsModal = ({
  user,
  isOpen,
  onClose,
  isPending = false,
  onApprove,
  onReject,
  onMarkDelinquent,
}: {
  user: User | null
  isOpen: boolean
  onClose: () => void
  isPending?: boolean
  onApprove?: () => void
  onReject?: () => void
  onMarkDelinquent?: () => void
}) => {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isPending ? "Pending Verification" : `${user.firstName} ${user.lastName}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <UserIcon />
                <span>First Name: {user.firstName}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon />
                <span>Middle Initial: {user.middleInitial}.</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon />
                <span>Last Name: {user.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon />
                <span>Birth Date: {user.birthDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationIcon />
                <span>Education: {user.education}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>Region: {user.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>Province: {user.province}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>City/Town: {user.cityTown}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>Barangay: {user.barangay}</span>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Business Information</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {user.businessName && (
                <div className="flex items-center gap-2">
                  <BuildingIcon />
                  <span>BN: {user.businessName}</span>
                </div>
              )}
              {user.brn && (
                <div className="flex items-center gap-2">
                  <BuildingIcon />
                  <span>BRN: {user.brn}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>Region: {user.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>Province: {user.province}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>City/Town: {user.cityTown}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>Barangay: {user.barangay}</span>
              </div>
              {user.businessType && (
                <div className="flex items-center gap-2">
                  <BusinessTypeIcon />
                  <span>{user.businessType}</span>
                </div>
              )}
              {user.industry && (
                <div className="flex items-center gap-2">
                  <IndustryIcon />
                  <span>{user.industry}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information & Documents */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <div className="flex items-center gap-2">
                <PhoneIcon />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon />
                <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                  {user.email}
                </a>
              </div>
              {user.secondaryEmail && (
                <div className="flex items-center gap-2">
                  <MailIcon />
                  <a href={`mailto:${user.secondaryEmail}`} className="text-blue-600 hover:underline">
                    {user.secondaryEmail}
                  </a>
                </div>
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-2 text-sm">
              {user.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-2">
                  <DocumentIcon />
                  <a href={doc.url} className="text-blue-600 hover:underline">
                    {doc.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {isPending ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Requested Date: {user.requestedDate}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={onApprove}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={onReject}
                  className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Credit: {user.creditScore}
              </p>
              {user.status !== "suspended" && (
                <button
                  onClick={onMarkDelinquent}
                  className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Delinquent User
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Pending Verification Modal Component
const PendingVerificationModal = ({
  users,
  isOpen,
  onClose,
  onSelectUser,
  currentPage,
  totalPages,
  onPageChange,
}: {
  users: User[]
  isOpen: boolean
  onClose: () => void
  onSelectUser: (user: User) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pending Verification ({users.length})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending verifications</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex items-center gap-4">
                  <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{user.requestedDate}</span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                    Review <EyeIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}) => {
  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
      <span>
        {totalItems === 0
          ? "Showing 0 of 0 users"
          : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
              currentPage * itemsPerPage,
              totalItems,
            )} of ${totalItems} users`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1
          const isActive = page === currentPage
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// Main Users Component
export default function Users() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)
  const [isViewingPendingUser, setIsViewingPendingUser] = useState(false)
  const [pendingModalPage, setPendingModalPage] = useState(1)
  const [users, setUsers] = useState<User[]>(mockUsers)

  const ITEMS_PER_PAGE = 5
  const PENDING_ITEMS_PER_PAGE = 5

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      // Exclude pending users from main list
      const isNotPending = user.status !== "pending"

      return matchesSearch && matchesRole && matchesStatus && isNotPending
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  // Get pending users
  const pendingUsers = useMemo(() => {
    return users.filter((user) => user.status === "pending")
  }, [users])

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const pendingTotalPages = Math.ceil(pendingUsers.length / PENDING_ITEMS_PER_PAGE)
  const paginatedPendingUsers = pendingUsers.slice(
    (pendingModalPage - 1) * PENDING_ITEMS_PER_PAGE,
    pendingModalPage * PENDING_ITEMS_PER_PAGE
  )

  // Event handlers
  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsViewingPendingUser(false)
    setIsUserModalOpen(true)
  }

  const handleSelectPendingUser = (user: User) => {
    setSelectedUser(user)
    setIsViewingPendingUser(true)
    setIsPendingModalOpen(false)
    setIsUserModalOpen(true)
  }

  const handleApprove = () => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "verified" as UserStatus } : u
        )
      )
      setIsUserModalOpen(false)
      setSelectedUser(null)
    }
  }

  const handleReject = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
      setIsUserModalOpen(false)
      setSelectedUser(null)
    }
  }

  const handleMarkDelinquent = () => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "suspended" as UserStatus } : u
        )
      )
      setIsUserModalOpen(false)
      setSelectedUser(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false)
    setSelectedUser(null)
    if (isViewingPendingUser) {
      setIsPendingModalOpen(true)
    }
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3">
          <img src={adminProfile.src} alt="Admin" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search users"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as "all" | UserRole)
                setCurrentPage(1)
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All Roles</option>
              <option value="borrower">Borrower</option>
              <option value="lender">Lender</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | UserStatus)
                setCurrentPage(1)
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="suspended">Suspended</option>
            </select>

            <button
              onClick={() => setIsPendingModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Pending Verification
              {pendingUsers.length > 0 && (
                <span className="bg-white text-orange-500 px-2 py-0.5 rounded-full text-xs font-bold">
                  {pendingUsers.length}
                </span>
              )}
            </button>
          </div>
        </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.riskScore !== null ? user.riskScore : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      View Details <EyeIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        isPending={isViewingPendingUser}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkDelinquent={handleMarkDelinquent}
      />

      {/* Pending Verification Modal */}
      <PendingVerificationModal
        users={paginatedPendingUsers}
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        onSelectUser={handleSelectPendingUser}
        currentPage={pendingModalPage}
        totalPages={pendingTotalPages}
        onPageChange={setPendingModalPage}
      />
    </div>
  )
}
