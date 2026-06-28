import { create } from "zustand";

interface BookingState {
  // Service
  serviceId: number | null;
  serviceName: string | null;
  consultationFee: number | null;

  // Doctor
  doctorId: number | null;
  doctorName: string | null;
  doctorAvatar: string | null;
  specialtyName: string | null;
  experienceYears: number | null;

  // TimeSlot
  timeSlotId: number | null;
  appointmentDate: string | null;
  startTime: string | null;
  endTime: string | null;

  // Actions
  setService: (id: number, name: string, fee: number) => void;
  setDoctor: (id: number, name: string, avatar: string | null, specialty: string, experience: number) => void;
  setTimeSlot: (id: number, date: string, start: string, end: string) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  serviceId: null,
  serviceName: null,
  consultationFee: null,

  doctorId: null,
  doctorName: null,
  doctorAvatar: null,
  specialtyName: null,
  experienceYears: null,

  timeSlotId: null,
  appointmentDate: null,
  startTime: null,
  endTime: null,

  setService: (id, name, fee) =>
    set({
      serviceId: id,
      serviceName: name,
      consultationFee: fee,
    }),

  setDoctor: (id, name, avatar, specialty, experience) =>
    set({
      doctorId: id,
      doctorName: name,
      doctorAvatar: avatar,
      specialtyName: specialty,
      experienceYears: experience,
    }),

  setTimeSlot: (id, date, start, end) =>
    set({
      timeSlotId: id,
      appointmentDate: date,
      startTime: start,
      endTime: end,
    }),

  clearBooking: () =>
    set({
      serviceId: null,
      serviceName: null,
      consultationFee: null,
      doctorId: null,
      doctorName: null,
      doctorAvatar: null,
      specialtyName: null,
      experienceYears: null,
      timeSlotId: null,
      appointmentDate: null,
      startTime: null,
      endTime: null,
    }),
}));
