import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Status types for service requests
export type RequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

// Service Requests Table - stores all citizen service submissions
export const serviceRequests = sqliteTable('service_requests', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    trackingNumber: text('tracking_number').notNull().unique(),
    serviceId: text('service_id').notNull(),
    serviceTitle: text('service_title').notNull(),

    // Applicant Information
    applicantName: text('applicant_name').notNull(),
    applicantPhone: text('applicant_phone').notNull(),
    applicantAddress: text('applicant_address'),
    applicantNik: text('applicant_nik'),

    // Additional data
    notes: text('notes'),
    documents: text('documents'), // JSON string of document descriptions
    completedDocuments: text('completed_documents'), // JSON string of completed documents uploaded by admin

    // Status tracking
    status: text('status').$type<RequestStatus>().notNull().default('pending'),
    adminNotes: text('admin_notes'),

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    completedAt: text('completed_at'),
});

// Admin Users Table - for admin authentication
export const adminUsers = sqliteTable('admin_users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    role: text('role').notNull().default('admin'), // 'admin' | 'superadmin'

    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastLoginAt: text('last_login_at'),
});

// Request Status History - logs all status changes
export const requestStatusHistory = sqliteTable('request_status_history', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    requestId: integer('request_id').notNull().references(() => serviceRequests.id, { onDelete: 'cascade' }),

    previousStatus: text('previous_status').$type<RequestStatus>(),
    newStatus: text('new_status').$type<RequestStatus>().notNull(),
    notes: text('notes'),

    changedBy: integer('changed_by').references(() => adminUsers.id),
    changedAt: text('changed_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Type exports for use in the application
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type StatusHistory = typeof requestStatusHistory.$inferSelect;
export type NewStatusHistory = typeof requestStatusHistory.$inferInsert;
