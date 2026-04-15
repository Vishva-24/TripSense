"use client";

import { createContext, useContext, useMemo, useState } from "react";

const TripPlannerContext = createContext(null);

const initialFormData = {
  destination: "",
  startDate: "",
  endDate: "",
  travelers: "Solo",
  budget: "Standard",
  vibe: [],
  dietary: ["None"],
  notes: ""
};

const initialTrips = [];

export function TripPlannerProvider({ children }) {
  const [formData, setFormData] = useState(initialFormData);
  const [trips] = useState(initialTrips);

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const value = useMemo(
    () => ({
      formData,
      trips,
      updateFormField,
      resetFormData
    }),
    [formData, trips]
  );

  return (
    <TripPlannerContext.Provider value={value}>
      {children}
    </TripPlannerContext.Provider>
  );
}

export function useTripPlanner() {
  const context = useContext(TripPlannerContext);
  if (!context) {
    throw new Error("useTripPlanner must be used within TripPlannerProvider");
  }
  return context;
}
