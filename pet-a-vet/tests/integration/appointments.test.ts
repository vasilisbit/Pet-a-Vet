// Mock the database connection first
jest.mock("@/lib/db/connection", () => ({
  query: jest.fn(),
}));

import {
  findAppointmentsByDate,
  createAppointment,
  checkAvailability,
} from "@/lib/db/models/appointment";

describe("Appointment Management", () => {
  describe("Date Handling", () => {
    it("should correctly filter appointments by date", async () => {
      const mockQuery = require("@/lib/db/connection").query;
      const testDate = "2024-01-15";

      mockQuery.mockResolvedValueOnce([
        {
          appointment_id: 1,
          appointment_date: testDate,
          appointment_time: "10:00",
        },
        {
          appointment_id: 2,
          appointment_date: testDate,
          appointment_time: "14:00",
        },
      ]);

      const appointments = await findAppointmentsByDate(testDate);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM Appointment WHERE DATE(appointment_date) = DATE(?) ORDER BY appointment_date",
        [testDate]
      );
      expect(appointments).toHaveLength(2);
      expect(appointments[0].appointment_date).toBe(testDate);
    });

    it("should handle timezone conversions correctly", () => {
      const date = new Date("2024-01-15T10:00:00Z");
      const formattedDate = date.toISOString().split("T")[0];
      expect(formattedDate).toBe("2024-01-15");
    });
  });

  describe("Availability Checking", () => {
    it("should detect scheduling conflicts", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      // Mock existing appointment at 10:00
      mockQuery.mockResolvedValueOnce([
        { appointment_time: "10:00:00", duration: 60 },
      ]);

      const isAvailable = await checkAvailability(1, "2024-01-15", "10:30", 60);
      expect(isAvailable).toBe(false);
    });

    it("should allow booking in available slots", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      // Mock no conflicts
      mockQuery.mockResolvedValueOnce([]);

      const isAvailable = await checkAvailability(1, "2024-01-15", "14:00", 60);
      expect(isAvailable).toBe(true);
    });
  });

  describe("Appointment Creation", () => {
    it("should create appointment with correct data", async () => {
      const mockQuery = require("@/lib/db/connection").query;
      mockQuery.mockResolvedValueOnce({ insertId: 123 });

      const appointmentData = {
        id: 0, // BaseModel id field (will be ignored during insert)
        pet_id: 1,
        service_provider_id: 2,
        creator_id: 3,
        service_type: "MEDICAL" as const,
        appointment_date: new Date("2024-01-15"),
        appointment_time: "10:00",
        duration: 60,
        reason: "Annual checkup",
        notes: "Bring vaccination records",
        status: "SCHEDULED" as const,
      };

      const id = await createAppointment(appointmentData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Appointment"),
        expect.arrayContaining([
          appointmentData.pet_id,
          appointmentData.service_provider_id,
          appointmentData.creator_id,
          "MEDICAL", // service_type gets transformed to uppercase
          appointmentData.appointment_date,
          appointmentData.duration,
          appointmentData.reason,
          appointmentData.notes,
          "SCHEDULED",
        ])
      );
      expect(id).toBe(123);
    });
  });
});
