## Version 1.0

- UserAuth
- post /api/v1/auth/createAdmin ( createAdminUser )
- post /api/v1/auth/login ( loginUser )
- post /api/v1/auth/refreshToken ( reGenerateAccessToken )
- post /api/v1/auth/logout ( verifyUser, logoutUser )
- put /api/v1/auth/change-password ( verifyUser, chnagePassword )

- Patient
- post /api/v1/route/patient ( isAdmin, verifyUser, createPatient )
- get /api/v1/route/patients ( isAdmin, verifyUser, getAllPatients )
- put /api/v1/route/patient/:patientId ( isAdmin, verifyUser, updatePatientDetail )
- get /api/v1/route/patient/:patientId ( verifyUser, getPatientDetail )
- delete /api/v1/route/patient/:patientId ( isAdmin, verifyUser, deletePatientRecord )

- Doctor
- post /api/v1/admin/doctor ( isAdmin, verifyUser, createDoctor )
- put /api/v1/admin/doctor/:doctorId ( isAdmin, verifyUser, updateDoctorDetail )
- get /api/v1/admin/doctors ( isAdmin, verifyUser, getAllDoctors )
- get /api/v1/admin/doctor/:doctorId ( verifyUser, getDoctorDetail )
- delete /api/v1/admin/doctor/:doctorId ( isAdmin, verifyUser, deleteDoctorRecord )

- Appointment
- post /api/v1/admin/appointment ( isAdmin, verifyUser, createAppointment )
- put /api/v1/admin/appointment/:appointmentId ( isAdmin, verifyUser, updateAppointmentDetail )
- get /api/v1/admin/appointments ( isAdmin, verifyUser, getAllAppointments )
- get /api/v1/admin/appointment/:appointmentId ( verifyUser, getAppointmentDetail )
- delete /api/v1/admin/appointment/:appointmentId ( isAdmin, verifyUser, deleteAppointmentRecord )

- Service
- post /api/v1/admin/service ( isAdmin, verifyUser, createDoctorService )
- post /api/v1/admin/service/:serviceId ( isAdmin, verifyUser, updateDoctorServiceDetail )
- get /api/v1/admin/service/:doctorId ( verifyUser, getDoctorServices )
- get /api/v1/admin/services ( isAdmin, verifyUser, getAllRegisteredServices )
- delete /api/v1/admin/services/:serviceId ( isAdmin, verifyUser, deleteDoctorServiceRecord )
