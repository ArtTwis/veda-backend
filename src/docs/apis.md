## Version 1.0

- UserAuth
- post /api/v1/auth/create/:userType ( setDefaultPassword, createAdminUser )
- post /api/v1/auth/login ( loginUser )
- post /api/v1/auth/logout ( verifyJwtToken, logoutUser )
- post /api/v1/auth/refreshToken ( reGenerateAccessToken )
- put /api/v1/auth/change-password ( verifyJwtToken, changePassword )

- User
- post /api/v1/route/user/create/:userType ( verifyJwtToken, isAdmin, setDefaultPassword, createUser)
- post /api/v1/route/user/:userType ( verifyJwtToken, isAdmin, getAllUsers )
- post /api/v1/route/user/:userType/:userId ( verifyJwtToken, getUserDetails )
- patch /api/v1/route/user/disable/:userType/:userId ( verifyJwtToken, isAdmin, disableUser )
- patch /api/v1/route/user/enable/:userType/:userId ( verifyJwtToken, isAdmin, enableUser )
- patch /api/v1/route/user/update/:userType/:userId ( verifyJwtToken, isAdmin, updateUserInfo )

- Service
- post /api/v1/route/service/create( verifyJwtToken, isAdmin, createDoctorService )
- post /api/v1/route/services/:userId ( verifyJwtToken, isAdmin, getDoctorServices )
- patch /api/v1/admin/service/:serviceId ( verifyJwtToken, isAdmin, updateService )
- delete /api/v1/admin/service/:serviceId ( verifyJwtToken, isAdmin, deleteService )

- Appointment
- post /api/v1/route/appointment/create ( verifyJwtToken, isAdmin, createAppointment )

- put /api/v1/admin/appointment/:appointmentId ( isAdmin, verifyUser, updateAppointmentDetail )
- get /api/v1/admin/appointments ( isAdmin, verifyUser, getAllAppointments )
- get /api/v1/admin/appointment/:appointmentId ( verifyUser, getAppointmentDetail )
- delete /api/v1/admin/appointment/:appointmentId ( isAdmin, verifyUser, deleteAppointmentRecord )
