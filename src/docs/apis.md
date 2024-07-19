## Version 1.0

- UserAuth
- post /api/v1/auth/createAdmin ( createAdminUser )
- post /api/v1/auth/login ( loginUser )
- post /api/v1/auth/refreshToken ( reGenerateAccessToken )
- post /api/v1/auth/logout ( verifyUser, logoutUser )
- put /api/v1/auth/change-password ( verifyUser, chnagePassword )

- User
- post /api/v1/route/user/create/:userType ( verifyJwtToken, isAdmin, setDefaultPassword, createUser)
- post /api/v1/route/user/:userType ( verifyUser, isAdmin, getAllUsers )
- post /api/v1/route/user/:userType/:userId ( verifyUser, getUserDetails )
- patch /api/v1/route/user/disable/:userType/:userId ( verifyUser, isAdmin, disableUser )
- patch /api/v1/route/user/enable/:userType/:userId ( verifyUser, isAdmin, enableUser )
- patch /api/v1/route/user/update/:userType/:userId ( verifyUser, isAdmin, updateUserInfo )

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
