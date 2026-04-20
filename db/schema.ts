import { relations, sql } from "drizzle-orm";
import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core";

export const activityTypeEnum = pgEnum("activity_type", [
  "food",
  "landmark",
  "transit"
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull().default(""),
    name: varchar("name", { length: 120 }).notNull().default(""),
    country: varchar("country", { length: 120 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email)
  })
);

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  destination: varchar("destination", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  budgetTier: varchar("budget_tier", { length: 50 }).notNull(),
  travelGroup: varchar("travel_group", { length: 50 }).notNull(),
  vibe: text("vibe")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  dietaryPrefs: text("dietary_prefs")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  mustDos: text("must_dos"),
  estimatedCost: numeric("estimated_cost", { precision: 12, scale: 2 }),
  estimatedCurrency: varchar("estimated_currency", { length: 12 }),
  estimatedCostNote: text("estimated_cost_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const itineraryDays = pgTable(
  "itinerary_days",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    date: date("date").notNull()
  },
  (table) => ({
    tripDayUnique: uniqueIndex("trip_day_unique").on(table.tripId, table.dayNumber)
  })
);

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id")
    .notNull()
    .references(() => itineraryDays.id, { onDelete: "cascade" }),
  time: varchar("time", { length: 20 }).notNull(),
  type: activityTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  costEstimate: numeric("cost_estimate", { precision: 10, scale: 2 }),
  imageUrl: text("image_url")
});

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips)
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id]
  }),
  itineraryDays: many(itineraryDays)
}));

export const itineraryDaysRelations = relations(itineraryDays, ({ one, many }) => ({
  trip: one(trips, {
    fields: [itineraryDays.tripId],
    references: [trips.id]
  }),
  activities: many(activities)
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  day: one(itineraryDays, {
    fields: [activities.dayId],
    references: [itineraryDays.id]
  })
}));

export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type ItineraryDay = typeof itineraryDays.$inferSelect;
export type Activity = typeof activities.$inferSelect;
