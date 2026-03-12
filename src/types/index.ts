// User roles and types
export type UserRole = 'CUSTOMER' | 'COMPANY' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Company (조경회사)
export interface Company {
  id: string;
  userId: string;
  companyName: string;
  businessNumber: string;
  representative: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  phone: string;
  specialties: string[];
  serviceAreas: string[];
  established?: string;
  isVerified: boolean;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  projectCount: number;
}

// Portfolio (블로그형 포트폴리오)
export interface Portfolio {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  beforeImages: string[];
  afterImages: string[];
  processImages: string[];
  projectType: ProjectType;
  style: GardenStyle;
  area: number;
  duration: string;
  location: string;
  budget: string;
  plants: string[];
  materials: string[];
  isPublished: boolean;
  views: number;
  likes: number;
  createdAt: string;
}

export type ProjectType = 'GARDEN' | 'ROOFTOP' | 'VERANDA' | 'COMMERCIAL' | 'OTHER';
export type GardenStyle = 'MODERN' | 'TRADITIONAL' | 'NATURAL' | 'MINIMAL' | 'ENGLISH' | 'JAPANESE' | 'MIXED';

// Quote Request (견적 요청)
export interface QuoteRequest {
  id: string;
  customerId: string;
  customer?: User;
  projectType: ProjectType;
  location: string;
  area: number;
  currentPhotos: string[];
  referenceImages: string[];
  budget: string;
  preferredSchedule: string;
  requirements: string;
  extras: string[];
  status: QuoteRequestStatus;
  createdAt: string;
}

export type QuoteRequestStatus = 'PENDING' | 'MATCHED' | 'COMPLETED' | 'CANCELLED';

// Quote (견적서)
export interface Quote {
  id: string;
  quoteRequestId: string;
  companyId: string;
  company?: Company;
  customerId: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes: string;
  paymentTerms: string;
  version: number;
  status: QuoteStatus;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';

// Contract (계약서)
export interface Contract {
  id: string;
  quoteId: string;
  companyId: string;
  customerId: string;
  content: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentSchedule: PaymentPhase[];
  warrantyTerms: string;
  specialTerms: string;
  customerSignature?: string;
  companySignature?: string;
  status: ContractStatus;
  createdAt: string;
}

export interface PaymentPhase {
  phase: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID';
}

export type ContractStatus = 'DRAFT' | 'REVIEW' | 'PENDING_SIGN' | 'SIGNED' | 'COMPLETED' | 'CANCELLED';

// Blog Post
export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: BlogCategory;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
}

export type BlogCategory = 'TREND' | 'PLANT_GUIDE' | 'TIPS' | 'SEASONAL' | 'COST_GUIDE' | 'CASE_STUDY' | 'NEWS';

// Review
export interface Review {
  id: string;
  projectId: string;
  customerId: string;
  customer?: User;
  companyId: string;
  rating: number;
  designRating: number;
  qualityRating: number;
  communicationRating: number;
  scheduleRating: number;
  valueRating: number;
  content: string;
  images: string[];
  companyReply?: string;
  createdAt: string;
}

// Flotren subscription
export type FlotrenPlan = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface FlotrenSubscription {
  id: string;
  customerId: string;
  plan: FlotrenPlan;
  gardenArea: number;
  monthlyPrice: number;
  startDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
}

// Utility types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
