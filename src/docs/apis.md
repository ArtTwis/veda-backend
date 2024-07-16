## Version 1.0

- UserAuth
- post /api/v1/user/admin ( createAdminUser )
- get /api/v1/user/login ( loginUser )
- post /api/v1/user/refreshToken ( reGenerateAccessToken )
- get /api/v1/user/logout ( verifyUser, logoutUser )
- put /api/v1/user/change-password ( verifyUser, chnagePassword )

- Patient
- post /api/v1/admin/patient ( isAdmin, verifyUser, createPatient )
- put /api/v1/admin/patient/:patientId ( isAdmin, verifyUser, updatePatientDetail )
- get /api/v1/admin/patients ( isAdmin, verifyUser, getAllPatients )
- get /api/v1/admin/patient/:patientId ( verifyUser, getPatientDetail )
- delete /api/v1/admin/patient/:patientId ( isAdmin, verifyUser, deletePatientRecord )

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