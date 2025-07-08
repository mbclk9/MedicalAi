import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  licenseNumber: text("license_number"),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  tcKimlik: text("tc_kimlik"),
  birthDate: timestamp("birth_date"),
  gender: text("gender"), // 'erkek', 'kadın'
  sgkNumber: text("sgk_number"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalTemplates = pgTable("medical_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  description: text("description"),
  structure: jsonb("structure").notNull(), // Template structure for SOAP format
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  templateId: integer("template_id").references(() => medicalTemplates.id),
  visitDate: timestamp("visit_date").defaultNow(),
  visitType: text("visit_type").notNull(), // 'ilk', 'kontrol', 'konsultasyon'
  duration: integer("duration"), // in seconds
  status: text("status").default("in_progress"), // 'in_progress', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalNotes = pgTable("medical_notes", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").references(() => visits.id).notNull(),
  transcription: text("transcription"),
  visitSummary: text("visit_summary"),
  subjective: jsonb("subjective"), // Anamnez data
  objective: jsonb("objective"), // Physical examination data
  assessment: jsonb("assessment"), // Assessment data
  plan: jsonb("plan"), // Treatment plan
  generatedAt: timestamp("generated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").references(() => visits.id).notNull(),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  duration: integer("duration"), // in seconds
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Relations
export const doctorsRelations = relations(doctors, ({ many }) => ({
  visits: many(visits),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  visits: many(visits),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  patient: one(patients, {
    fields: [visits.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [visits.doctorId],
    references: [doctors.id],
  }),
  template: one(medicalTemplates, {
    fields: [visits.templateId],
    references: [medicalTemplates.id],
  }),
  medicalNote: one(medicalNotes, {
    fields: [visits.id],
    references: [medicalNotes.visitId],
  }),
  recording: one(recordings, {
    fields: [visits.id],
    references: [recordings.visitId],
  }),
}));

export const medicalNotesRelations = relations(medicalNotes, ({ one }) => ({
  visit: one(visits, {
    fields: [medicalNotes.visitId],
    references: [visits.id],
  }),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  visit: one(visits, {
    fields: [recordings.visitId],
    references: [visits.id],
  }),
}));

export const medicalTemplatesRelations = relations(medicalTemplates, ({ many }) => ({
  visits: many(visits),
}));

// Insert schemas
export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true,
  visitDate: true,
});

export const insertMedicalNoteSchema = createInsertSchema(medicalNotes).omit({
  id: true,
  generatedAt: true,
  updatedAt: true,
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  recordedAt: true,
});

export const insertTemplateSchema = createInsertSchema(medicalTemplates).omit({
  id: true,
  createdAt: true,
});

// Types
export type Doctor = typeof doctors.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type MedicalNote = typeof medicalNotes.$inferSelect;
export type Recording = typeof recordings.$inferSelect;
export type MedicalTemplate = typeof medicalTemplates.$inferSelect;

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type InsertMedicalNote = z.infer<typeof insertMedicalNoteSchema>;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
